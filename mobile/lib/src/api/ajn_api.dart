import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

import '../model/tool_definition.dart';

enum TransferStage { preparing, uploading, processing, downloading, complete }

class TransferProgress {
  const TransferProgress(this.stage, {this.fraction});

  final TransferStage stage;
  final double? fraction;
}

class ConversionOutput {
  const ConversionOutput({required this.path, required this.fileName});

  final String path;
  final String fileName;
}

class AjnApiException implements Exception {
  const AjnApiException(this.message, {this.code, this.requestId});

  final String message;
  final String? code;
  final String? requestId;

  @override
  String toString() => message;
}

class AjnApi {
  AjnApi()
      : _baseUrl = const String.fromEnvironment('AJN_API_BASE_URL'),
        _dio = Dio(
          BaseOptions(
            connectTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(minutes: 3),
            receiveTimeout: const Duration(minutes: 8),
            headers: const <String, Object>{'Accept': 'application/json, application/octet-stream'},
          ),
        );

  final String _baseUrl;
  final Dio _dio;

  String get baseUrl => _baseUrl.trim().replaceAll(RegExp(r'/+$'), '');

  void _ensureConfigured() {
    if (baseUrl.isEmpty || !baseUrl.startsWith('https://')) {
      throw const AjnApiException(
        'AJN PDF API is not configured. Build with --dart-define=AJN_API_BASE_URL=https://your-api-host.',
        code: 'API_NOT_CONFIGURED',
      );
    }
  }

  Future<List<ToolDefinition>> fetchTools() async {
    _ensureConfigured();
    try {
      final response = await _dio.get<Map<String, dynamic>>('$baseUrl/api/tools');
      final rawTools = response.data?['tools'] as List<dynamic>? ?? const <dynamic>[];
      final tools = rawTools
          .whereType<Map<String, dynamic>>()
          .map(ToolDefinition.fromJson)
          .where((tool) => tool.id.isNotEmpty)
          .toList(growable: true);
      tools.sort((a, b) {
        if (a.available != b.available) return a.available ? -1 : 1;
        return a.name.compareTo(b.name);
      });
      return List<ToolDefinition>.unmodifiable(tools);
    } on DioException catch (error) {
      throw await _mapDioException(error);
    }
  }

  Future<ConversionOutput> convert({
    required ToolDefinition tool,
    required List<String> filePaths,
    required String outputName,
    required Map<String, dynamic> options,
    required void Function(TransferProgress progress) onProgress,
    String sourceUrl = '',
    String password = '',
  }) async {
    _ensureConfigured();
    if (!tool.available) {
      throw AjnApiException(tool.unavailableReason ?? 'This tool is unavailable right now.');
    }

    onProgress(const TransferProgress(TransferStage.preparing));
    final form = await _buildForm(
      tool: tool,
      filePaths: filePaths,
      outputName: outputName,
      options: options,
      sourceUrl: sourceUrl,
      password: password,
    );
    final endpoint = switch (tool.id) {
      'protect-pdf' => '/api/pdf/protect',
      'unlock-pdf' => '/api/pdf/unlock',
      'repair-pdf' => '/api/pdf/repair',
      'compress-pdf' => '/api/pdf/compress',
      _ => '/api/convert/${tool.id}',
    };

    try {
      var uploadFinished = false;
      final response = await _dio.post<ResponseBody>(
        '$baseUrl$endpoint',
        data: form,
        options: Options(responseType: ResponseType.stream),
        onSendProgress: (sent, total) {
          if (total > 0 && sent < total) {
            onProgress(TransferProgress(TransferStage.uploading, fraction: sent / total));
          } else if (!uploadFinished) {
            uploadFinished = true;
            onProgress(const TransferProgress(TransferStage.processing));
          }
        },
      );

      final body = response.data;
      if (body == null) {
        throw const AjnApiException('The server returned an empty result.');
      }

      final fileName = _responseFileName(response, tool, outputName);
      final root = await getApplicationDocumentsDirectory();
      final exportDir = Directory('${root.path}${Platform.pathSeparator}AJN PDF${Platform.pathSeparator}Exports');
      await exportDir.create(recursive: true);
      final outputFile = File('${exportDir.path}${Platform.pathSeparator}$fileName');
      final sink = outputFile.openWrite();
      final contentLength = int.tryParse(response.headers.value(Headers.contentLengthHeader) ?? '');
      var received = 0;
      onProgress(const TransferProgress(TransferStage.downloading, fraction: 0));
      try {
        await for (final Uint8List chunk in body.stream) {
          received += chunk.length;
          sink.add(chunk);
          if (contentLength != null && contentLength > 0) {
            onProgress(
              TransferProgress(
                TransferStage.downloading,
                fraction: (received / contentLength).clamp(0, 1).toDouble(),
              ),
            );
          }
        }
      } finally {
        await sink.flush();
        await sink.close();
      }
      if (!await outputFile.exists() || await outputFile.length() == 0) {
        try {
          await outputFile.delete();
        } catch (_) {
          // Best-effort cleanup; preserve the original processing error.
        }
        throw const AjnApiException('AJN PDF received an empty output file.');
      }
      onProgress(const TransferProgress(TransferStage.complete, fraction: 1));
      return ConversionOutput(path: outputFile.path, fileName: fileName);
    } on DioException catch (error) {
      throw await _mapDioException(error);
    }
  }

  Future<FormData> _buildForm({
    required ToolDefinition tool,
    required List<String> filePaths,
    required String outputName,
    required Map<String, dynamic> options,
    required String sourceUrl,
    required String password,
  }) async {
    final files = <MultipartFile>[];
    for (final path in filePaths) {
      files.add(await MultipartFile.fromFile(path, filename: File(path).uri.pathSegments.last));
    }

    if (tool.isProtect) {
      return FormData.fromMap(<String, dynamic>{
        'file': files.first,
        'user_password': password,
        'owner_password': '',
        'allow_printing': true,
        'allow_copying': false,
        'allow_editing': false,
        'allow_annotations': false,
        'allow_form_filling': true,
        'output_name': outputName,
      });
    }
    if (tool.isUnlock) {
      return FormData.fromMap(<String, dynamic>{
        'file': files.first,
        'password': password,
        'authorized': true,
        'output_name': outputName,
      });
    }
    if (tool.isRepair || tool.id == 'compress-pdf') {
      return FormData.fromMap(<String, dynamic>{'file': files.first, 'output_name': outputName});
    }
    return FormData.fromMap(<String, dynamic>{
      if (files.isNotEmpty) 'files': files,
      'options_json': jsonEncode(options),
      'output_name': outputName,
      'source_url': sourceUrl,
    });
  }

  String _responseFileName(Response<ResponseBody> response, ToolDefinition tool, String outputName) {
    final disposition = response.headers.value('content-disposition') ?? '';
    final utf = RegExp(r"filename\*=UTF-8''([^;]+)", caseSensitive: false).firstMatch(disposition);
    if (utf != null) return Uri.decodeComponent(utf.group(1)!).replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    final plain = RegExp(r'filename="?([^";]+)"?', caseSensitive: false).firstMatch(disposition);
    if (plain != null) return plain.group(1)!.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    final stem = outputName.trim().isEmpty ? tool.id : outputName.trim();
    return '${stem.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_')}${tool.outputExtension}';
  }

  Future<AjnApiException> _mapDioException(DioException error) async {
    var message = 'AJN PDF could not reach the processing service.';
    String? code;
    String? requestId = error.response?.headers.value('x-request-id');
    final data = error.response?.data;
    try {
      if (data is Map<String, dynamic>) {
        message = data['error'] as String? ?? message;
        code = data['code'] as String?;
        requestId ??= data['request_id'] as String?;
      } else if (data is ResponseBody) {
        final chunks = <int>[];
        await for (final chunk in data.stream) {
          chunks.addAll(chunk);
          if (chunks.length > 65536) break;
        }
        final decoded = jsonDecode(utf8.decode(chunks, allowMalformed: true));
        if (decoded is Map<String, dynamic>) {
          message = decoded['error'] as String? ?? message;
          code = decoded['code'] as String?;
          requestId ??= decoded['request_id'] as String?;
        }
      }
    } catch (_) {}
    if (error.type == DioExceptionType.connectionTimeout || error.type == DioExceptionType.receiveTimeout) {
      message = 'The processing request timed out. Try a smaller file or try again.';
      code ??= 'TIMEOUT';
    }
    return AjnApiException(message, code: code, requestId: requestId);
  }
}

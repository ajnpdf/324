import 'dart:io';

import 'package:cross_file/cross_file.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../api/ajn_api.dart';
import '../app.dart';
import '../model/tool_definition.dart';

class ToolScreen extends ConsumerWidget {
  const ToolScreen({required this.toolId, super.key});
  final String toolId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tools = ref.watch(toolsProvider);
    return tools.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, _) => Scaffold(appBar: AppBar(), body: Center(child: Text('$error'))),
      data: (items) {
        ToolDefinition? tool;
        for (final item in items) {
          if (item.id == toolId) {
            tool = item;
            break;
          }
        }
        if (tool == null) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Tool not found.')));
        return _ToolWorkspace(tool: tool);
      },
    );
  }
}

class _ToolWorkspace extends ConsumerStatefulWidget {
  const _ToolWorkspace({required this.tool});
  final ToolDefinition tool;

  @override
  ConsumerState<_ToolWorkspace> createState() => _ToolWorkspaceState();
}

class _ToolWorkspaceState extends ConsumerState<_ToolWorkspace> {
  final _files = <String>[];
  final _output = TextEditingController();
  final _password = TextEditingController();
  final _url = TextEditingController();
  bool _busy = false;
  TransferProgress? _progress;
  String? _error;
  String? _ocrLanguage;
  double _quality = 90;
  double _dpi = 150;

  ToolDefinition get tool => widget.tool;

  @override
  void dispose() {
    _output.dispose();
    _password.dispose();
    _url.dispose();
    super.dispose();
  }

  Future<void> _pickFiles() async {
    final extensions = tool.inputExtensions.map((value) => value.replaceFirst('.', '')).where((value) => value.isNotEmpty).toList();
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: tool.multiFile,
      type: extensions.isEmpty ? FileType.any : FileType.custom,
      allowedExtensions: extensions.isEmpty ? null : extensions,
    );
    if (result == null) return;
    final paths = result.files.map((item) => item.path).whereType<String>().toList();
    setState(() {
      if (!tool.multiFile) _files.clear();
      for (final path in paths) {
        if (!_files.contains(path)) _files.add(path);
      }
      _error = null;
    });
  }

  Future<void> _run() async {
    if (_busy) return;
    if (!tool.isUrlTool && _files.isEmpty) {
      setState(() => _error = 'Choose ${tool.multiFile ? 'one or more files' : 'a file'} first.');
      return;
    }
    if (tool.isUrlTool && !Uri.tryParse(_url.text.trim())!.hasScheme) {
      setState(() => _error = 'Enter a valid https URL.');
      return;
    }
    if ((tool.isProtect || tool.isUnlock) && _password.text.length < (tool.isProtect ? 4 : 1)) {
      setState(() => _error = tool.isProtect ? 'Use a password with at least 4 characters.' : 'Enter the current PDF password.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
      _progress = const TransferProgress(TransferStage.preparing);
    });
    try {
      final options = <String, dynamic>{
        'quality': _quality.round(),
        'dpi': _dpi.round(),
        if (_ocrLanguage != null) 'language': _ocrLanguage,
      };
      final result = await ref.read(apiProvider).convert(
        tool: tool,
        filePaths: List<String>.unmodifiable(_files),
        outputName: _output.text.trim(),
        options: options,
        sourceUrl: _url.text.trim(),
        password: _password.text,
        onProgress: (progress) {
          if (mounted) setState(() => _progress = progress);
        },
      );
      if (!mounted) return;
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(builder: (_) => _ResultScreen(tool: tool, output: result)),
      );
    } on AjnApiException catch (error) {
      if (mounted) setState(() => _error = error.requestId == null ? error.message : '${error.message}\nRequest: ${error.requestId}');
    } catch (error) {
      if (mounted) setState(() => _error = 'Processing failed: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pageWidth = MediaQuery.sizeOf(context).width;
    final contentWidth = pageWidth > 820 ? 760.0 : pageWidth;
    return Scaffold(
      appBar: AppBar(title: Text(tool.name), centerTitle: false),
      body: Center(
        child: SizedBox(
          width: contentWidth,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 36),
            children: <Widget>[
              _intro(),
              const SizedBox(height: 16),
              if (tool.isUrlTool) _urlInput() else _filePanel(),
              if (tool.isProtect || tool.isUnlock) ...<Widget>[const SizedBox(height: 14), _passwordInput()],
              if (tool.ocrLanguages.isNotEmpty) ...<Widget>[const SizedBox(height: 14), _ocrInput()],
              if (tool.category == 'pdf-to-image' || tool.category == 'ocr') ...<Widget>[const SizedBox(height: 14), _qualityPanel()],
              const SizedBox(height: 14),
              TextField(controller: _output, enabled: !_busy, decoration: InputDecoration(labelText: 'Output name (optional)', hintText: '${tool.id}${tool.outputExtension}')),
              if (_progress != null) ...<Widget>[const SizedBox(height: 20), _progressPanel()],
              if (_error != null) ...<Widget>[const SizedBox(height: 14), _errorPanel()],
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: _busy || !tool.available ? null : _run,
                icon: Icon(_busy ? Icons.hourglass_top_rounded : Icons.auto_awesome_rounded),
                label: Text(_busy ? 'Processing…' : tool.name),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _intro() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: const Color(0xFFEEF2FF),
        border: Border.all(color: const Color(0xFFE0E7FF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(children: <Widget>[
            const Icon(Icons.verified_user_rounded, color: Color(0xFF4F46E5)),
            const SizedBox(width: 8),
            Expanded(child: Text(tool.processingMode == 'temporary-server' ? 'Secure temporary processing' : 'AJN processing', style: const TextStyle(fontWeight: FontWeight.w800))),
          ]),
          if (tool.limitation != null) ...<Widget>[const SizedBox(height: 8), Text(tool.limitation!, style: const TextStyle(color: Color(0xFF64748B)))],
          if (!tool.available && tool.unavailableReason != null) ...<Widget>[const SizedBox(height: 8), Text(tool.unavailableReason!, style: const TextStyle(color: Color(0xFFB91C1C)))],
        ],
      ),
    );
  }

  Widget _filePanel() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: <Widget>[
            InkWell(
              onTap: _busy ? null : _pickFiles,
              borderRadius: BorderRadius.circular(18),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 26, horizontal: 18),
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFC7D2FE), width: 1.4)),
                child: const Column(children: <Widget>[
                  Icon(Icons.add_to_drive_rounded, size: 38, color: Color(0xFF4F46E5)),
                  SizedBox(height: 8),
                  Text('Choose files', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                  SizedBox(height: 4),
                  Text('Native picker • device and cloud providers', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                ]),
              ),
            ),
            if (_files.isNotEmpty) ...<Widget>[
              const SizedBox(height: 12),
              ReorderableListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _files.length,
                onReorder: tool.multiFile && !_busy
                    ? (oldIndex, newIndex) {
                        setState(() {
                          if (newIndex > oldIndex) newIndex -= 1;
                          final item = _files.removeAt(oldIndex);
                          _files.insert(newIndex, item);
                        });
                      }
                    : (_, __) {},
                itemBuilder: (context, index) {
                  final path = _files[index];
                  final name = File(path).uri.pathSegments.last;
                  return ListTile(
                    key: ValueKey(path),
                    dense: true,
                    leading: const Icon(Icons.insert_drive_file_rounded),
                    title: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: IconButton(onPressed: _busy ? null : () => setState(() => _files.removeAt(index)), icon: const Icon(Icons.close_rounded)),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _urlInput() => TextField(controller: _url, enabled: !_busy, keyboardType: TextInputType.url, decoration: const InputDecoration(labelText: 'Website URL', hintText: 'https://example.com'));

  Widget _passwordInput() => TextField(controller: _password, enabled: !_busy, obscureText: true, decoration: InputDecoration(labelText: tool.isProtect ? 'New PDF password' : 'Current PDF password', prefixIcon: const Icon(Icons.password_rounded)));

  Widget _ocrInput() {
    _ocrLanguage ??= tool.ocrLanguages.first;
    return DropdownButtonFormField<String>(
      initialValue: _ocrLanguage,
      decoration: const InputDecoration(labelText: 'OCR language'),
      items: tool.ocrLanguages.map((item) => DropdownMenuItem<String>(value: item, child: Text(item.toUpperCase()))).toList(),
      onChanged: _busy ? null : (value) => setState(() => _ocrLanguage = value),
    );
  }

  Widget _qualityPanel() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: <Widget>[
          Row(children: <Widget>[const Expanded(child: Text('Output quality', style: TextStyle(fontWeight: FontWeight.w700))), Text('${_quality.round()}%')]),
          Slider(value: _quality, min: 40, max: 100, divisions: 12, onChanged: _busy ? null : (value) => setState(() => _quality = value)),
          Row(children: <Widget>[const Expanded(child: Text('Resolution', style: TextStyle(fontWeight: FontWeight.w700))), Text('${_dpi.round()} DPI')]),
          Slider(value: _dpi, min: 72, max: 300, divisions: 19, onChanged: _busy ? null : (value) => setState(() => _dpi = value)),
        ]),
      ),
    );
  }

  Widget _progressPanel() {
    final progress = _progress!;
    final label = switch (progress.stage) {
      TransferStage.preparing => 'Preparing files',
      TransferStage.uploading => 'Uploading securely',
      TransferStage.processing => 'Processing on AJN PDF',
      TransferStage.downloading => 'Saving result',
      TransferStage.complete => 'Complete',
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      child: Card(
        key: ValueKey(progress.stage),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
            Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            LinearProgressIndicator(value: progress.stage == TransferStage.processing ? null : progress.fraction),
            const SizedBox(height: 8),
            Text(
              progress.stage == TransferStage.processing
                  ? 'No fake percentage — waiting for the real backend result.'
                  : progress.fraction == null
                      ? 'Working…'
                      : '${(progress.fraction! * 100).round()}%',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _errorPanel() => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFFECACA))),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[const Icon(Icons.error_outline_rounded, color: Color(0xFFB91C1C)), const SizedBox(width: 10), Expanded(child: Text(_error!, style: const TextStyle(color: Color(0xFF991B1B)))]),
      );
}

class _ResultScreen extends StatelessWidget {
  const _ResultScreen({required this.tool, required this.output});
  final ToolDefinition tool;
  final ConversionOutput output;

  Future<void> _share() async {
    await SharePlus.instance.share(ShareParams(files: <XFile>[XFile(output.path)], title: 'AJN PDF result'));
  }

  Future<void> _saveCopy(BuildContext context) async {
    final destination = await FilePicker.platform.saveFile(dialogTitle: 'Save AJN PDF result', fileName: output.fileName);
    if (destination == null) return;
    await File(output.path).copy(destination);
    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved successfully.')));
  }

  Future<void> _showInFolder() async {
    if (Platform.isWindows) await Process.start('explorer.exe', <String>['/select,', output.path]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.7, end: 1),
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeOutBack,
                  builder: (_, value, child) => Transform.scale(scale: value, child: child),
                  child: Container(
                    width: 82,
                    height: 82,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFDCFCE7)),
                    child: const Icon(Icons.check_rounded, color: Color(0xFF16A34A), size: 46),
                  ),
                ),
                const SizedBox(height: 22),
                const Text('Your file is ready', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 26)),
                const SizedBox(height: 8),
                Text(output.fileName, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF64748B))),
                const SizedBox(height: 24),
                FilledButton.icon(onPressed: _share, icon: const Icon(Icons.share_rounded), label: const Text('Share result')),
                const SizedBox(height: 10),
                OutlinedButton.icon(onPressed: () => _saveCopy(context), icon: const Icon(Icons.save_alt_rounded), label: const Text('Save a copy')),
                if (Platform.isWindows) ...<Widget>[const SizedBox(height: 10), TextButton.icon(onPressed: _showInFolder, icon: const Icon(Icons.folder_open_rounded), label: const Text('Show in folder'))],
                const SizedBox(height: 18),
                TextButton(onPressed: () => Navigator.of(context).pop(), child: Text('Use ${tool.name} again')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

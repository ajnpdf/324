class ToolDefinition {
  const ToolDefinition({
    required this.id,
    required this.name,
    required this.category,
    required this.inputExtensions,
    required this.outputExtension,
    required this.available,
    required this.multiFile,
    required this.ocrLanguages,
    required this.processingMode,
    this.unavailableReason,
    this.limitation,
  });

  factory ToolDefinition.fromJson(Map<String, dynamic> json) {
    return ToolDefinition(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'AJN PDF Tool',
      category: json['category'] as String? ?? 'other',
      inputExtensions: (json['inputExtensions'] as List<dynamic>? ?? const <dynamic>[])
          .whereType<String>()
          .toList(growable: false),
      outputExtension: json['outputExtension'] as String? ?? '',
      available: json['available'] as bool? ?? false,
      unavailableReason: json['unavailableReason'] as String?,
      limitation: json['limitation'] as String?,
      multiFile: json['multiFile'] as bool? ?? false,
      ocrLanguages: (json['ocrLanguages'] as List<dynamic>? ?? const <dynamic>[])
          .whereType<String>()
          .toList(growable: false),
      processingMode: json['processingMode'] as String? ?? 'temporary-server',
    );
  }

  final String id;
  final String name;
  final String category;
  final List<String> inputExtensions;
  final String outputExtension;
  final bool available;
  final String? unavailableReason;
  final String? limitation;
  final bool multiFile;
  final List<String> ocrLanguages;
  final String processingMode;

  bool get isUrlTool => id == 'url-to-pdf';
  bool get isProtect => id == 'protect-pdf';
  bool get isUnlock => id == 'unlock-pdf';
  bool get isRepair => id == 'repair-pdf';
  bool get isSecurityTool => isProtect || isUnlock || isRepair;
}

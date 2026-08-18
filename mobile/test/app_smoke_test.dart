import 'package:ajnpdf/src/model/tool_definition.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('backend tool manifest parses into a native tool definition', () {
    final tool = ToolDefinition.fromJson(<String, dynamic>{
      'id': 'pdf-to-word',
      'name': 'PDF to Word',
      'category': 'pdf-to-document',
      'inputExtensions': <String>['.pdf'],
      'outputExtension': '.docx',
      'available': true,
      'multiFile': false,
      'ocrLanguages': <String>[],
      'processingMode': 'temporary-server',
    });
    expect(tool.id, 'pdf-to-word');
    expect(tool.available, isTrue);
    expect(tool.inputExtensions, <String>['.pdf']);
  });
}

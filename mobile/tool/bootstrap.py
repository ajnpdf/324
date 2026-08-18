from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLATFORMS = ("android", "ios", "windows")


def run(*args: str, cwd: Path | None = None) -> None:
    print('+', ' '.join(args))
    subprocess.run(args, cwd=str(cwd or ROOT), check=True)


def patch_text(path: Path, replacements: dict[str, str]) -> None:
    if not path.exists():
        return
    text = path.read_text(encoding='utf-8')
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')


def main() -> None:
    if shutil.which('flutter') is None:
        raise SystemExit('Flutter SDK was not found on PATH. Install Flutter 3.44.x or newer stable first.')

    with tempfile.TemporaryDirectory(prefix='ajn-pdf-flutter-') as temp:
        scaffold = Path(temp) / 'app'
        run('flutter', 'create', str(scaffold), '--platforms=android,ios,windows', '--org', 'com.ajnpdf', '--project-name', 'app')
        for platform in PLATFORMS:
            source = scaffold / platform
            target = ROOT / platform
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(source, target)
        metadata = scaffold / '.metadata'
        if metadata.exists():
            shutil.copy2(metadata, ROOT / '.metadata')

    patch_text(ROOT / 'android/app/src/main/AndroidManifest.xml', {'android:label="app"': 'android:label="AJN PDF"'})
    patch_text(ROOT / 'ios/Runner/Info.plist', {'<string>App</string>': '<string>AJN PDF</string>', '<string>app</string>': '<string>AJN PDF</string>'})
    patch_text(ROOT / 'windows/CMakeLists.txt', {'set(BINARY_NAME "app")': 'set(BINARY_NAME "AJNPDF")'})
    patch_text(ROOT / 'windows/runner/main.cpp', {'L"app"': 'L"AJN PDF"'})
    patch_text(ROOT / 'windows/runner/Runner.rc', {'VALUE "FileDescription", "app"': 'VALUE "FileDescription", "AJN PDF"', 'VALUE "ProductName", "app"': 'VALUE "ProductName", "AJN PDF"'})

    run('flutter', 'pub', 'get')
    run('flutter', 'analyze')
    run('flutter', 'test')
    print('\nAJN PDF native scaffold is ready for Android, iOS and Windows.')
    print('Bundle/application identifier: com.ajnpdf.app')
    print('Build with --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST')


if __name__ == '__main__':
    main()

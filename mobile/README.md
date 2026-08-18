# AJN PDF Native

Flutter client for **Android (APK/AAB), iOS, and Windows (EXE)**. The existing AJN PDF web application is intentionally outside this directory and must not be modified by native-app work.

## Architecture

- Flutter Material 3, responsive/adaptive layout.
- Riverpod for state and dependency management.
- GoRouter for navigation.
- Dio streaming multipart uploads and streaming result downloads.
- `/api/tools` is the source of truth for backend capability availability.
- `/api/convert/{tool_id}` drives registered conversions.
- Protect, Unlock and Repair use their existing dedicated backend endpoints.
- No fake processing percentage: upload/download percentages are real byte progress; server processing is shown as indeterminate until the backend responds.
- Results are written to `AJN PDF/Exports` in the application documents directory and can be shared or saved elsewhere.

## First setup

Requires Flutter stable 3.44.x+ and Python 3.

```powershell
cd mobile
python tool/bootstrap.py
```

The bootstrap script generates only `android/`, `ios/`, and `windows/` platform runners. It does not generate or touch any web platform.

## Run

```powershell
flutter run --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST
```

The release backend URL must be HTTPS.

## Build Android

```powershell
flutter build apk --release --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST
flutter build appbundle --release --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST
```

Outputs include `build/app/outputs/flutter-apk/app-release.apk` and `build/app/outputs/bundle/release/app-release.aab`.

## Build Windows

```powershell
flutter build windows --release --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST
```

The EXE and required runtime files are under `build/windows/x64/runner/Release/`.

## Build iOS

iOS builds require macOS + Xcode. For device/App Store distribution configure Apple signing, then:

```bash
flutter build ipa --release --dart-define=AJN_API_BASE_URL=https://YOUR_BACKEND_HOST
```

Never commit signing certificates, provisioning profiles, keystores, passwords, service-account JSON, or API credentials.

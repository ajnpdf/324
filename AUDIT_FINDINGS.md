# AJN PDF Repository Audit — commit 1480922

## Confirmed strengths

- Next.js 15 App Router frontend with a large tool catalogue.
- Browser-side PDF, image, OCR and conversion logic.
- Firebase client integration and account UI.
- Existing AdSense placements and cookie preferences.
- Razorpay one-time payment routes.
- FastAPI/Python backend foundation.
- Firebase App Hosting and standalone Next.js deployment configuration.

## Critical findings addressed by the bootstrap

1. The web build used `eslint.ignoreDuringBuilds: true`.
2. The Windows-incompatible build script set `NODE_ENV=production` inline.
3. `eslint-config-next` did not match the installed Next.js version.
4. The billing modal simulated success after a timeout and did not create a payment.
5. Razorpay had no recurring subscription workflow or webhook entitlement sync.
6. Android subscriptions and Google Play RTDN processing did not exist.
7. Firestore allowed any client to update `/stats/platform`.
8. Premium users were not connected to ad suppression.
9. Google Analytics and the AdSense library loaded before stored consent was checked.
10. The Python merge API had no request-size limit and used user filenames in temporary paths.
11. Flutter Android and Windows projects did not exist.
12. Android signing, CI release gates and reproducible output collection did not exist.

## Important limitations

- The bootstrap creates a production foundation, not instant completion of every listed tool on all platforms.
- APK/AAB require Flutter, Android SDK API 36 and Java.
- A Play-ready AAB requires an upload keystore and Google Play product configuration.
- Windows EXE requires Visual Studio 2022 Desktop development with C++.
- Real Razorpay subscriptions require plan IDs, keys and a validated webhook.
- Real Google Play subscriptions require Play Console products, service-account access and Pub/Sub RTDN.
- Production AdMob must remain disabled until the Android AdMob App ID and units are confirmed.

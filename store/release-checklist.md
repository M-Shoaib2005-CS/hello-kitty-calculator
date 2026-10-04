# Release checklist (Android / Play Store)

Prerequisites: Node 20+, JDK 17, Android Studio (SDK 34+).

1. `npm install`            (also refreshes package-lock.json for the Capacitor packages)
2. `npm test`               (generators, calculator parser, progress rules)
3. `npm run build`
4. `npm run cap:add`        (first time only; creates the `android/` folder)
5. `npm run assets`         (icons and splash from `resources/`)
6. `npm run cap:sync`
7. `npm run cap:open`       (opens Android Studio) and run on a real phone or emulator.
   Smoke test: calculator basic + scientific, finish one level, flip night mode, force-close and reopen (progress should persist).

## Signing (do this once, keep the files safe and backed up)
```bash
keytool -genkey -v -keystore catularor-release.jks -alias catularor -keyalg RSA -keysize 2048 -validity 10000
```
Never commit `*.jks` (already in .gitignore). Enrol in **Play App Signing** when you create the app in Play Console, so Google holds the final signing key and yours is just the upload key.

In Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle → release. Upload the `.aab`.

## Before each update
- Bump `versionCode` (+1) and `versionName` in `android/app/build.gradle`
- Keep `appId` exactly `com.shoaib.catularor`

## Optional hardening
The app is fully offline. If you want, remove `<uses-permission android:name="android.permission.INTERNET" />` from `android/app/src/main/AndroidManifest.xml` so the app visibly requests no permissions. Test afterwards; Capacitor's bundled web content does not need it.

## Play Console
Paste text from `store/play-listing.md`, upload screenshots, add the privacy-policy URL, complete Data safety, Content rating and Target audience forms, then start an internal test → closed test → production. New personal developer accounts must run a closed test with 12+ testers for 14 days before production access.

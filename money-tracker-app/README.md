# Money Tracker (Android app)

Offline version of the Money Tracker, packaged as an Android app with Capacitor.
All data is saved on the phone. No server or database needed.

## Build the APK
1. Install Node.js (LTS) and Android Studio
2. In this folder run:
   - `npm install`
   - `npx cap add android`
   - `npx cap sync`
   - `npx cap open android`
3. In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
4. Copy `app-debug.apk` to your phone and install it

After changing anything inside `www/`, run `npx cap sync` and build again.

# Elite FPL — Native Modules Scaffold

PRD §6.1 specifies two pieces of functionality that cannot be built in pure
React Native and require platform-native modules:

## Widgets (PRD §1.4)

Home-screen widgets on both platforms — iOS WidgetKit and Android App Widgets
(Glance on newer Android). These are bridged into the RN runtime via a small
native module exposed as e.g. `NativeEliteFplWidget`.

### iOS (Swift / WidgetKit)

1. `expo prebuild` to generate the `ios/` project.
2. In Xcode → File → New → Target → **Widget Extension**.
3. Implement a `TimelineProvider` that reads shared data written by the
   main app to the App Group (`group.com.elitefpl.shared`).
4. The main app writes JSON snapshots of the active team / GW points /
   next deadline into the App Group every time the data changes.

### Android (Kotlin / Glance)

1. `expo prebuild` to generate the `android/` project.
2. Add a new module under `android/app/src/main/java/.../widget/`.
3. Define an `AppWidgetProvider` and a `GlanceAppWidget`.
4. Share data via the main app's encrypted SharedPreferences.

## Biometrics (PRD §6.1)

Use `expo-local-authentication` (already in `package.json`). No custom
native module is required for Phase 2's biometric login toggle; the
expo module wraps Face ID / Touch ID / Android Biometric.

## Haptics

Use `expo-haptics` (already in `package.json`) and the `triggerHaptic`
wrapper at `src/services/haptic.ts`.

## Why This Folder Exists

We scaffold `native_modules/widgets/` and `native_modules/biometric/` as
empty directories so the Expo prebuild output and any hand-written Swift /
Kotlin modules have an obvious home. They are committed as empty folders
with `.keep` files (see below).

> **Do not** attempt widgets in Phase 0. PRD §11 explicitly notes that
> "native widget work is disproportionately costly relative to its usage
> and could be deferred without hurting the core loop." Phase 2 is the
> earliest sensible target.

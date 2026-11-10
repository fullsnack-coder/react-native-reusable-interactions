# ExpandableTransactionCard implementation journal

## 2026-11-08 — Component and package integration

- Work performed: Added the typed root export, measured clipped detail region, tap gesture, controlled and uncontrolled requests, reduced-motion-aware spring, and accessibility action. Packed the library as `microinteractions-native-0.0.0.tgz` and installed that artifact in the independent showcase. Added a VitePress component page and a text catalog entry on the landing site.
- Reason and alternatives: The [design proposal](design-proposal.md) records the choice of height animation for correct sibling reflow and a summary-only tap region to avoid capturing detail controls. The `ExpandableTransactionCard` export keeps the requested provisional name.
- Validation: `npm run typecheck`, library `npm test -- --watch=false` (3 passing tests), `npm run build`, iOS Simulator `xcodebuild ... Debug ... build` (passed), Android `./gradlew :app:assembleDebug --offline --no-daemon` (passed), VitePress `npm run build` (passed). Further checks are recorded below as they complete.
- Failures and surprises: Jest initially could not transform the Gesture Handler and Reanimated ESM entries; the documented transform exceptions and Reanimated resolver fixed loading. Gesture Handler 3 scheduled a Worklets runtime binding in Jest; a Worklets mock fixed it. Tests also required a `GestureHandlerRootView`. The initial showcase `StatusBar` prop was outside the RN 0.88 strict type and was removed. iOS native build emitted warnings from installed native dependencies but exited successfully.
- Development time: **not measured**.
- Evidence: Component source and tests in this repository; packed artifact and showcase consumer in the sibling repository. [Jest setup investigation](../../experiments/2026-11-08-component-jest-setup.md).
- Next step: Finish runtime interaction validation, final checks, and lessons.

## 2026-11-08 — Native runtime finding

- Android emulator initially rendered the collapsed showcase. A card tap and the external controlled button changed state but failed to reveal detail content. The measured child was inside a zero-height parent and reported no useful height.
- Changed the measured child to absolute positioning inside the clipped reveal view, rebuilt and repacked the library, and reinstalled the artifact in the showcase. A restarted Android emulator showed expansion, detail content, sibling reflow, and settled collapse. A stale Metro instance from the library example briefly caused an app-registration error; starting showcase Metro on port 8081 resolved it.
- Android logcat showed Reanimated warning that `useAnimatedStyle` dependencies are ignored on native. Removed the dependency array and configured the Worklets Babel plugin for Jest. Library tests passed again; the final artifact was rebuilt and reinstalled. A fresh Android launch produced no `ReactNativeJS` warnings in the inspected logcat output.
- iOS Simulator displayed the initial collapsed layout; interactive iOS testing was unavailable through the UI automation surface.
- Development time: **not measured**.

## Iteration 7 release hardening — 2026-11-10

Reviewed public API, current regressions, exact peer compatibility, package consumption and accessibility/performance limits. Guided physical Android 13 / Xiaomi 2201117SL and iPhone 16 Pro Max / iOS 27 indicated touch scenarios passed by explicit owner confirmation; chosen larger-text/reduced-motion checks passed and preferences were restored. TalkBack/VoiceOver were deferred by owner and remain Not Tested; no blanket release pass. The specific component cases, defects/fixes, native build identities and carried gates are in [release audit](../../releases/0.1.0-beta.1/release-audit.md) and [physical results](../../releases/0.1.0-beta.1/physical-device-results.md). Existing historical records remain valid within their original scope.

Added finite-positive spring validation and explicit unmount cancellation; valid API unchanged. No measured leak/crash is invented. New invalid-input regressions and real release-window samples recorded.

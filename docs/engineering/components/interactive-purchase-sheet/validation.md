# Iteration 6 — InteractivePurchaseSheet validation

Recorded 2026-11-09. **Implementation complete; native validation partial; release validation pending.** No next iteration, commit, publication or deployment. Development time not measured.

## Architecture and public contract

Official Gorhom 5.2.14 documentation, versioned manifest/source and npm metadata were reviewed before implementation (ADR 0008). Its peers admit installed RN 0.88.1 / React 19.3 / Reanimated 4.7.1 / RNGH 3.4, but exact native compatibility and comparative performance were not empirically tested. No incompatibility or speed advantage is claimed. Worklets 0.13.1, Hermes/New Architecture remain unchanged; no runtime dependency added.

Custom scope: controlled visibility/index, 1..4 increasing fraction snap points in [0.2,1], UI-thread handle-only pan, independently scrolling native body, scrollable footer, deterministic velocity-projected release, generation-guarded interruption and request/completion separation. Layout comes from measured usable viewport/header; no fixed device height or per-frame React state. Body viewport height animates on UI and incurs layout work, explicitly not GPU-only.

ADR 0009 supersedes the original native Modal presentation after actual Android keyboard overlap persisted through a bounded Modal configuration experiment. Exported **PurchaseSheetHost** owns one scoped root overlay, blocks background touches/AX while presented and clears it on close/unmount. Place it inside existing GestureHandlerRootView/SafeAreaProvider, above SafeAreaView/ScrollView. Providers consumed by sheet content must wrap it. No arbitrary native Modal/native-navigation stacking; no general portal framework.

Required sheet props: `visible`, `snapPoints`, `snapIndex`, `onSnapIndexChange`, `onDismissRequest`, `safeAreaInsets`, `children`. Optional settled `onSnapChange`, completed `onDismiss`, dismissal/backdrop flags, decorative handle, scrollable footer, styles, labels, native returnFocusRef and testID. Requests require application acknowledgment; rejected requests retain current state. Dismiss reasons are gesture/backdrop/close/back/accessibility. Invalid configurations throw; points/index must change atomically when removing active points. Existing five public APIs are unchanged.

Body scroll never pans the sheet, including continued downward movement at scroll top. Release and use the handle/size actions. Nested vertical ScrollView/FlatList/SectionList, content-to-pan handoff and dynamic content sizing are unsupported. Horizontal children and standard TextInput are demonstrated; custom recognizers/input engines require integration testing.

## Automated and build matrix

| Check | Result | Evidence |
| --- | --- | --- |
| Library typecheck, lint, format, tests, Bob build, pack dry-run and actual local tarball | **Passed**, 143 tests / 6 suites; no lint warnings | [log](evidence/library-checks.log) |
| Showcase typecheck, lint, format and tests | **Passed**, 10 tests / 5 suites; no lint warnings | [log](evidence/showcase-checks.log) |
| Documentation typecheck, formatting lint, tests and VitePress build | **Passed**, 1 test | [log](evidence/docs-checks.log) |
| Landing typecheck, lint, format, Next production build and built-HTML test | **Passed**, 1 test; test must follow build | [final checks](evidence/web-final-checks.log) |
| Android forced fresh JS bundle and arm64 Release assembly/install | **Passed** | [build](evidence/android-build.log) |
| iOS Simulator Debug xcodebuild and final host runtime through Metro | **Passed** | [build](evidence/ios-build.log), [runtime](evidence/ios-host-validation.txt) |
| Previous five component/model source hashes | **Passed**, identical to pre-Iteration-6 baseline | [audit](evidence/previous-source-preservation.json) |

Initial test harness/formatting errors were corrected. The first landing test read a stale pre-Iteration-6 production build; rebuilding before the HTML test passed. A stale installed export/absent Metro caused an iOS undefined Host render error during migration; final explicit tarball installation and reset Metro resolved it. Neither is recorded as an unexplained component failure. [Final package audit](evidence/final-package-audit.json) links the built/installed/tarball/profiled runtime and independent Git roots.

## Final native matrix

Android: Medium_Phone_API_36.1, sdk_gphone64_arm64 emulator, Android 16 / SDK 36, arm64, 1080×2400 portrait; standalone **Release**, no Metro required. iOS: iPhone 17 Pro Simulator, iOS 26.2, **Debug**, Hermes/New Architecture, final packed public API through Metro. No physical device or human screen-reader session.

| Scenario | Android | iOS |
| --- | --- | --- |
| Open, root overlay, background isolation and close cleanup | **Passed** native touches/tree | **Passed** native AX tree/activation; background absent while open, restored after close |
| Actual handle pans between snaps and down-to-dismiss | **Passed**, real adb motion/swipes 1→2→3→2→1→closed | **Not executed** reliably; AX sizing is not pan validation |
| Body scroll, continuing down at top, horizontal child | **Passed**, actual touch; handle bounds retained, no handoff | **Not executed** physical scroll/gesture arbitration on final host |
| Child controls / accessible size alternatives | **Passed**, quantity and expand | **Passed**, native increment 1→2, Expand→3 |
| Backdrop / explicit close / hardware Back | **Passed**, real taps/Back; lock rejected Back/down-dismiss | **Passed** explicit native Close; final-host backdrop tap **not executed** (prototype locked backdrop check retained separately) |
| Dynamic points/remove active point and lock/unlock | **Passed**, 3/3→2/2, bounded locked pan, close removed | **Passed**, native 3/3→2/2, dismissal action/close removed then one Close button restored |
| Standard software keyboard visible + field visible above it | **Passed**, actual standard IME before text injection, text entry and Back; focusing scrolled collapsed1/3 expanded to3/3, IME Back restored1/3 | **Passed**, actual software keyboard, onscreen Q entry, native Done hides without closing; native lower-snap auto-expansion/restoration **not executed** |
| Home/foreground cancellation during pan | **Passed**, actual DOWN/MOVE/Home/UP; same controlled snap after return | **Not executed** final host |
| Rapid close/open; timed unmount during motion | **Passed**, final visible/latest index then no overlay after unmount | **Passed**, final visible1/2, native Close increments once; unmount restores catalog without increment |
| Font scaling / long content / footer | **Passed**, 200% font, readable close, scrollable footer; font change recreates showcase Activity and local state, reopened for layout test | **Not executed**, largest text/custom-font breadth |
| Orientation | **Passed**, landscape dimensions and active return to portrait bounded | **Not executed**, existing iPhone target portrait-only; configuration unchanged |
| Reduced motion | **Passed** functional open/expand/close/reopen with native transition scale0; actual transition timing not measured | **Not executed** effective native preference transition; mocked/live-event tests only |
| Native multitouch, reversed/rapid physical pans, smallest/largest physical screens | **Not executed**; model/callback interruption regressions do not establish native coverage | **Not executed** |

[Android touch/state log](evidence/android-host-validation.log), [visible-IME log](evidence/android-host-keyboard.log), [actual prior-snap restoration](evidence/android-keyboard-restore.log), [layout log](evidence/android-host-layout.log), [motion log](evidence/android-host-motion.log), [iOS observations](evidence/ios-host-validation.txt). Keyboard/font/rotation/motion settings restored, with before/after JSON evidence. The combined layout script initially lost a control after Activity recreation and later attempted an offscreen reopen; these are recorded harness failures. A separate fresh-catalog motion run passed. Do not infer native screen-reader coverage from these trees/actions.

## Reproducible defects and fixes

1. **iOS focused input obscured by software keyboard:** corrected native responder reveal offset with measured ScrollView screen origin. Nonzero-origin and stale async-measurement regressions added. Final host visible keyboard/input typing revalidated.
2. **iOS close control became an AX slider after reuse:** modern-role/direct-Text alternatives did not provide the required single native button. Installed RNGH v3 Touchable supplies its own button host. Regression retains host choice; native lock/reopen/close sequence exposes one button and correct adjustable handle. Underlying RN recycling cause is an inference.
3. **Android Modal standard IME overlap:** disabling navigation translucency failed to resolve the visible overlap. Preserve prototype evidence; supersede presentation only with root host/main-root KeyboardAvoidingView (Android height/iOS padding), apply all supplied insets, prioritize visible IME on Back. New host ownership/background/cleanup/insets/Back regressions; final native standard keyboard passed. No unrelated native configuration changed.

Prototype-only logs/screenshots and source are explicitly named `modal-*` / `native-modal-prototype.tsx.txt`; earlier iOS keyboard/roles records describe prototype investigations. Final host checks above are independently rerun. Text injection alone is not evidence of a visible IME; it can hide the keyboard before Back. Advanced floating/split keyboards remain unverified.

## Accessibility, performance and remaining warnings

Implemented adjustable handle increment/decrement/dismiss, visible native close, hidden backdrop, host background isolation, initial focus request, best-effort native return ref, discrete settled announcements, default scalable text and live reduced-motion preference. **Full VoiceOver/TalkBack focus order, containment, return focus, speech and announcements: not executed.** Native AX roles and direct accessible actions passed only as described. English default hints/announcements and localized consumer themes require review.

Actual Release window counters, workload, device/build identity and limitations are in [performance report](performance-report.md). No per-component FPS, latency, memory, React render-count or JS/UI/GPU attribution claim. No equivalent before/after benchmark or Gorhom comparison.

Final library/showcase lint warnings: **0**. iOS still reports existing empty NSLocationWhenInUseUsageDescription and build-script output/dependency-analysis warnings; no location feature was added and unrelated native configuration was preserved. Metro workers report NO_COLOR/FORCE_COLOR environment warnings; final runtime loads without the stale-export render error. Gradle cache advice is not a component defect.

## Changed files and documentation

- Library: new `src/components/InteractivePurchaseSheet.tsx`, `PurchaseSheetHost.tsx`, `purchase-sheet-model.ts`, `__tests__/purchase-sheet.test.tsx`; append root exports, README and CHANGELOG. No dependency version change.
- Showcase: new `src/catalog/InteractivePurchaseSheetDemo.tsx` and demo test; update `App.tsx` with root host/catalog jump, App test safe-area mock, package lock tarball integrity. Public package imports only; no native project configuration change.
- Journal: five component records, this matrix, authentic evidence/scripts, ADR 0008 and superseding 0009, engineering index and cumulative release matrix.
- Docs: new `docs/reference/interactive-purchase-sheet.md`, navigation config, component/API indexes. Public reference includes root-host setup, full actual API, controlled requests, keyboard/safe areas, unsupported nested scroll/native Modal stacking, accessibility and performance limits.
- Landing: existing `src/app/page.tsx` catalog copy and `tests/landing.test.mjs`; text-only native description, no web implementation/redesign/fabricated image.

The local fictional carry-set demonstration covers quantity, horizontal finish scrolling, standard note input, dynamic points, lock, long content, local preview action, rapid requests and timed unmount. It performs no purchase, payment, networking or backend operation.

## Readiness and carried debt

Ready to enter final **release hardening**, not production/release validated. No known reproducible critical defect remains in the exercised final host scope. Critical iOS physical-pan/scroll and full native screen-reader checks are still **unverified**, plus physical-device/advanced-keyboard/navigation breadth and trace/memory/render profiling. These cannot be closed by passing unit tests or Android window counters.

The [cumulative matrix](../../release-validation-matrix.md) preserves all earlier five components' unresolved iOS gestures, screen-reader, device and profiling gates. Their source hashes/APIs/tests/demos/docs were preserved. Four independent Git repositories, no new remote/commit/publication/deployment. Stop after Iteration 6.

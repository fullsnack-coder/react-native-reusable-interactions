# Iteration 3.1 — native validation

Recorded 2026-11-08. Development time: **not measured**. This is a validation iteration; no new component, API, animation framework, dependency upgrade or native configuration change was introduced. Existing component source and package manifests are checked against [the starting SHA-256 baseline](evidence/iteration-3.1/source-baseline.json).

## Evidence standard and test environment

**PASS** means an outcome was observed. **NOT EXECUTED** includes scenarios that the mechanism could not reliably generate. A failed injection or inspection mechanism is recorded separately from a component failure. Accessibility activation is not touch-driven dragging; keyboard focus is not screen-reader focus. No FPS, latency or per-component cost is inferred from tests or display refresh rate.

- iOS: iPhone 17 Pro Simulator, iOS 26.2, Debug/Hermes/New Architecture. Rebuilt with xcodebuild, installed and launched using simctl. Metro status returned packager-status:running. CUA operated Simulator and inspected its native AX tree.
- Android: Medium_Phone_API_36.1 emulator, Android 16, arm64, 1080×2400 portrait / 2400×1080 landscape, existing nondebuggable arm64-v8a Release APK. SHA-256 `6616834364bfcc09396f208f415fdb59168018f3c8796e44c1b5d59421e32054`, unchanged from Iteration 3. Gradle assembleRelease passed again. adb input swipe generated observed native touch pans; screencap/UIAutomator and gfxinfo supplied evidence.
- No physical device was used. No deliberate build/test suites ran during the Release frame sample.

## iOS: touch-driven tests versus native accessible activation

**Touch-driven checks NOT EXECUTED reliably:** partial release, threshold confirmation, rapid repeated pans, direction reversal, canceled active pan, pan while disabled/processing, pan in parent ScrollView. CUA drag at both coordinate ranges and scroll on container/coordinates did not produce a verified continuous displacement of the parent. A half-coordinate attempt activated a different card instead of scrolling. Full-coordinate drag and wheel attempts left the viewport unchanged. SwipeToPay remained below the viewport. This does not establish a component gesture defect; it prevents a passing gesture claim. No API or configuration workaround was introduced to hide the test limitation.

**Native accessible-action checks PASS:** exposed `Confirm demo order` secondary action produced processing/busy, then success; error outcome/reset produced processing then error; disabled exposed Unavailable and attempted action did not increment the count. Only one native accessible button represented the confirmation, with status value and disabled/busy state. These are native AX semantics and operation outcomes, not VoiceOver focus or speech verification.

**Lifecycle PASS through accessible initiation:** observed the control unmounted while status was processing at count 4; later success while still unmounted; remount showed success at the same count. A prior attempt only observed unmount after success and is not counted as a pending-unmount test. Sent Home immediately after an accessible confirmation, observed SpringBoard, reopened the app and observed success/count 5 without duplicate operation. This verifies operation lifecycle across backgrounding; active-pan cancellation on iOS remains NOT EXECUTED.

[Native AX excerpts, mechanism failures and session boundaries](evidence/iteration-3.1/ios-ax-excerpts.txt).

## RTL

Android used a temporary per-app locale, without code or manifest changes:

```sh
adb shell cmd locale get-app-locales com.microinteractions.showcase --user 0
adb shell cmd locale set-app-locales com.microinteractions.showcase --user 0 --locales ar-EG
```

Original locale list was empty. Restarted the app. Native screenshot showed right-anchored handle, left-pointing arrow and mirrored catalog alignment. Full-width portrait track bounds `[58,1325][1022,1493]`; handle start approximately `(938,1409)`, travel approximately 796 pixels. Leftward 40% swipe to x=620 returned with count 0; rightward attempt to x=1060 did not confirm; leftward 90% swipe to x=220 confirmed exactly once, including an additional attempted pan while pending. Partial-pan screenshot showed fill advancing from the right and the handle following leftward input. **PASS: Android direction, progress alignment, partial/default threshold and final geometry.** Exact boundary values remain covered by existing controller tests, not a new native threshold calibration.

An above-threshold leftward 6-second pan was interrupted with Home before release. Screenshot immediately before Home showed the handle near the left destination; after the injected sequence completed, foregrounding showed idle/count 1 and the handle at the right start. **PASS: cancellation/background/foreground for this Android pan.**

A separate `input motionevent DOWN/MOVE/UP` reversal and CANCEL experiment did not show intermediate movement in the peak screenshot. Its unchanged counter is not proof of reversal or cancellation of an active gesture. **NOT EXECUTED: single-gesture reversal and explicit CANCEL-event coverage with that mechanism.** The later continuous-swipe/Home test supplies the actual cancellation evidence instead.

Evidence: [RTL idle](evidence/iteration-3.1/android-rtl-idle.png), [partial state](evidence/iteration-3.1/android-rtl-partial.xml), [wrong direction](evidence/iteration-3.1/android-rtl-wrong-direction.xml), [actual mid-pan](evidence/iteration-3.1/android-rtl-mid-partial.png), [success](evidence/iteration-3.1/android-rtl-success.png), [before background](evidence/iteration-3.1/android-rtl-before-background.png), [after foreground](evidence/iteration-3.1/android-rtl-after-background.png).

On iOS, launched a temporary process with `-RCTI18nUtil_forceRTL YES`; catalog heading/card placement visibly mirrored, and native accessible confirmation produced success/count 1. **PASS: forced RTL session and accessible operation. NOT EXECUTED: SwipeToPay track alignment/progress/direction/threshold**, since it remained offscreen and reliable touch scrolling was unavailable. A batched second action hit a stale CUA element ID and is not counted as duplicate-protection evidence. Terminated the forced process and relaunched normally.

## Orientation

**Android PASS:** rotated to landscape with existing supported configuration. Slow parent swipes (x=1200, y=850→250, 1500 ms) brought the complete control into view; earlier faster attempts overshot and were insufficient evidence. Actual landscape bounds `[58,644][2342,812]`. A partial drag `(142,728)→(990,728)` returned with count 0. A complete drag to `(2046,728)` yielded success/count 1. Returned to portrait; status/count remained success/1, track bounds returned to `[58,1325][1022,1493]` and screenshot showed handle within the right endpoint. No native orientation configuration changed.

Evidence: [landscape partial](evidence/iteration-3.1/android-landscape-partial.png), [landscape success](evidence/iteration-3.1/android-landscape-success.png), [portrait after rotation](evidence/iteration-3.1/android-portrait-after-success-rotation.png). Rotation during an active pan is NOT EXECUTED. iPhone orientation test is NOT EXECUTED because this existing target supports portrait only; no unrelated orientation capability was added.

## Interruption test mechanism limitation

Native keyboard focus traversal reached the existing Disable button. Enter toggled its label to Enable; this resting-state keyboard action worked. Attempting to retain that focus during a long touch pan was inconclusive: UIAutomator reported `ERROR: could not get idle state` and left the earlier XML file on disk. The copied active-pan file was stale, so the helper's apparent focus evidence is invalid. It is explicitly named `android-active-drag-keyboard-focus-stale.xml`. The later Enter did not produce an observed disable transition; the gesture completed normally to success/count 2. **NOT EXECUTED: disabling during active pan with this mechanism.** This is a test-mechanism failure, not a reproduced SwipeToPay defect. Do not infer a passing prop-interruption test from stale XML.

Existing mocked regression tests cover disabled/status/layout invalidation, resets and deferred callback cleanup. They remain distinct from native interruption checks.

## Android lifecycle follow-up and fresh geometry

**PASS: unmount while processing.** After the Release sample ended at idle/count 6, selected error and completed a pan. An immediate screenshot showed the control unmounted with processing/count 7. Later XML showed error/count 7 while still unmounted; remount retained error/count 7. [Pending unmount screenshot](evidence/iteration-3.1/android-unmounted-processing.png), [unmounted error](evidence/iteration-3.1/android-unmounted-error.xml), [remounted error](evidence/iteration-3.1/android-remounted-error.xml).

The first subsequent reset/pan test reused old coordinates after content height and scroll offset changed. It did not initiate a new confirmation (count stayed 7), so it is not counted as a pending-reset test. The corrected helper obtained fresh track and button bounds from a successful, idle UIAutomator dump before each sequence. This is fixture/test correction; no project layout defect was established.

**PASS: reset during processing and stale result protection.** With fresh geometry, screenshot showed processing/count 8 before Reset; after Reset and waiting beyond the local timer, status remained idle/count 8. **PASS: disabled at rest**, same valid pan region, native node exposed Unavailable/enabled=false and the attempted pan did not increment count. Re-enabled afterward. [Before reset](evidence/iteration-3.1/android-processing-before-reset-verified.png), [after delayed completion](evidence/iteration-3.1/android-after-pending-reset-verified.xml), [disabled](evidence/iteration-3.1/android-disabled-valid-pan.xml).

**PASS: reset while returning.** Released an 80%-travel pan below threshold, captured the returning handle at an intermediate position, then tapped the existing Reset control. Final state idle/count 8 with no confirmation. Reset command began 0.2530445 seconds after swipe-command completion, including screencap overhead. This interval is command scheduling evidence, not gesture latency or animation-duration measurement. [Returning handle before reset](evidence/iteration-3.1/android-return-before-reset.png), [after reset](evidence/iteration-3.1/android-return-after-reset.xml), [command interval](evidence/iteration-3.1/android-return-reset-command-timing.json).

## Accessibility and reduced motion

- **iOS native semantics/action PASS**, including normal/disabled/busy/success/error and controlled lifecycle as described above. VoiceOver was absent from this Simulator's Accessibility Vision settings; **NOT EXECUTED: VoiceOver focus order, spoken processing/success/error announcements**. Native AX state and mocked announcement tests do not establish spoken feedback.
- **TalkBack service availability PASS, full accessibility NOT EXECUTED reliably.** Enabled installed TalkBack 16.0.0.777931756 and observed it bound with touchExplorationEnabled=true and spoken feedback capability. A notification permission prompt appeared and was declined. The visible green focus ring remained on the earlier Everyday selector item. Ten injected next-item key combinations did not produce an observed focus advance to SwipeToPay. No accessible confirmation, processing/success/error speech or disabled spoken semantics is claimed from this attempt. Emulator was not present as an available native app surface in CUA inventory. The previous TalkBack focus/speech gap therefore remains open. [Bound service](evidence/iteration-3.1/android-talkback-bound.txt), [first traversal attempt](evidence/iteration-3.1/android-talkback-next-01.png), [tenth attempt](evidence/iteration-3.1/android-talkback-next-10.png). Shortcut intent was checked against [Google's documented default keymap](https://support.google.com/accessibility/android/answer/6110948); injected keys did not establish equivalent external-keyboard behavior here.
- **Reduced motion functional PASS on both platforms.** iOS Settings changed from OFF to ON; defaults read ReduceMotionEnabled=1; a fresh LTR process showed accessible processing then success/count 1. Android repeated partial return and successful confirmation in a fresh app session with transition_animation_scale=0; final success/count 1. No reduced-motion spring timing or audio result was measured. [Android result](evidence/iteration-3.1/android-reduced-motion-success.xml). Existing controller tests are additional coverage, not the native evidence.

Restored Android enabled_accessibility_services to absent and accessibility_enabled=0, original font/rotation/animation-scale values and empty app-locales list. iOS forced RTL was limited to one process and terminated; ReduceMotionEnabled restored to 0 via simctl defaults after CUA could not reopen the Motion settings row; app relaunched normally. Restoration evidence: [Android settings](evidence/iteration-3.1/android-restored-settings.json), [iOS settings](evidence/iteration-3.1/ios-restored-settings.txt).

## Release performance

Repeated the same warmed Release workload from Iteration 3: ten partial returns, five complete confirmations, five additional pending attempts and resets. Monotonic workload duration **24.072089792 seconds**. **1019 frames, 27 janky (2.65%); p50/p90/p95/p99 16/17/18/22 ms**. Final idle/count 6, after warmup count 1: exactly five new accepted operations. Same APK; no production source changes and no deliberate build/test load during capture. This single repeat shows no new window-level slowdown warranting an animation rewrite. It is not an improvement claim or per-component attribution. See [performance report](performance-report.md) and [raw capture](evidence/iteration-3.1/android-release-gfxinfo.txt). React render counts, latency, JS/UI attribution, iOS profiling and physical-device performance remain **not measured**.

## Regression checks and changes

| Final check                              | Result                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Library typecheck, lint, format:check    | PASS                                                                                                    |
| Library Jest                             | PASS, 36 tests / 3 suites, previous component regressions retained                                      |
| Library build                            | PASS                                                                                                    |
| Library pack:check                       | PASS on retry with temporary npm cache; initial run failed because existing default cache is root-owned |
| Showcase typecheck, lint, format:check   | PASS                                                                                                    |
| Showcase Jest --watch=false              | PASS, 4 tests / 2 suites                                                                                |
| iOS Simulator Debug build/install/launch | PASS                                                                                                    |
| Android arm64 Release build/runtime      | PASS                                                                                                    |
| Source/public API preservation           | PASS, baseline hashes unchanged                                                                         |

Logs: [library](evidence/iteration-3.1/library-checks.log), [pack retry](evidence/iteration-3.1/pack-check.log), [showcase](evidence/iteration-3.1/showcase-checks.log), [iOS build](evidence/iteration-3.1/ios-build.log), [Android build](evidence/iteration-3.1/android-build.log), [source preservation](evidence/iteration-3.1/source-preservation.json).

No reproducible production defect was established, so no component fix, new API or mirrored regression test was introduced. Test mechanism failures and coordinate correction are explicitly recorded above. Existing lint has zero warnings. Native toolchain/template build warnings remain (legacy Gradle/Kotlin/variant APIs and iOS location-description/script-phase warnings), as in Iteration 3.

Only the Engineering Journal/index and validation evidence changed. The four Git repositories remain independent; no commits/remotes/publication/deployment. Documentation and landing application code were not changed, so their build suites were not rerun in this validation-only iteration.

## Final matrix and readiness

| Check                                                  | Android Release                      | iOS Simulator Debug                                                          |
| ------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| Actual partial/threshold pans in parent ScrollView     | PASS                                 | NOT EXECUTED reliably                                                        |
| Repeated partial pans / duplicate pending attempts     | PASS                                 | NOT EXECUTED reliably                                                        |
| Direction reversal during one active pan               | NOT EXECUTED reliably                | NOT EXECUTED reliably                                                        |
| Cancellation by background / foreground                | PASS, active pan                     | PASS, operation lifecycle via accessible initiation; active pan NOT EXECUTED |
| Disabled / processing states                           | PASS                                 | PASS via native AX semantics/action                                          |
| Disable during active pan / rotation during active pan | NOT EXECUTED reliably                | NOT EXECUTED                                                                 |
| Unmount during processing / remount result             | PASS                                 | PASS via accessible initiation                                               |
| Rapid processing reset / delayed result / return reset | PASS                                 | NOT EXECUTED for these specific interruption timings                         |
| RTL direction/progress/alignment/threshold             | PASS                                 | NOT EXECUTED for the track; forced RTL accessible operation PASS             |
| Orientation with valid handle placement                | PASS landscape and portrait          | NOT EXECUTED, existing iPhone target portrait-only                           |
| Native accessible alternate action                     | NOT EXECUTED with TalkBack reliably  | PASS exposed native action                                                   |
| Screen-reader focus order and spoken announcements     | NOT EXECUTED reliably                | NOT EXECUTED, VoiceOver unavailable                                          |
| Reduced motion                                         | PASS functional, timing not measured | PASS functional accessible lifecycle, timing not measured                    |
| Release frame capture                                  | PASS, window-level only              | NOT EXECUTED                                                                 |

**Recommendation: do not begin Iteration 4 yet.** Android RTL/orientation and both platforms' operation lifecycle now have stronger native evidence, but the main iOS touch gate remains open. A real touch-capable test session or manual iOS run must cover partial/full/reversed/canceled/rapid pans in the parent scroll container. Complete VoiceOver/TalkBack focus, accessible activation and spoken status validation on environments that support them, plus native active-pan prop/layout interruption. No dependency upgrade or architectural change is justified by these unexecuted checks. Stop after Iteration 3.1.

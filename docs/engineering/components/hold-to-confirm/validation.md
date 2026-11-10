# HoldToConfirm — Iteration 5 validation

Recorded 2026-11-09. **Implementation complete; native runtime validation partial; release validation pending.** No Iteration 6 work started. Development time not measured.

## Architecture, API and ownership

New independent flat component, no shared framework or changes to previous APIs. [Design](design-proposal.md), [implementation history](implementation-journal.md), [ADR 0007](../../decisions/0007-native-hold-completion.md).

```tsx
<HoldToConfirm
  label="Hold to confirm"
  holdDuration={1200}
  status={status}
  onConfirm={confirmIntent}
  resetKey={resetKey}
/>
```

Required `status: HoldToConfirmStatus` (idle/processing/success/error) and `onConfirm: () => void`. Optional label (Hold to confirm), holdDuration (integer 500..10000 ms, default 1200), disabled, resetKey, accessibilityLabel, labels (holding/confirmed/processing/success/error/disabled), style, progressStyle, labelStyle and testID. No progress events, onReset callback, Promise interpretation, automatic retry or built-in haptics. Consumer may use onConfirm for haptics.

RNGH native LongPress activation is the sole physical timing authority. Begin starts a Reanimated linear visual clock without a completion callback; cap at 0.99 until native activation. One pointer, 12-point radial tolerance, outside cancellation. Early release/native failure returns progress to zero over 160 ms (snap when reduced), interruptible by a fresh hold. Duration/layout/reset/disabled/status changes invalidate the hold. Background/inactive and Android blur invalidate generations; foreground cannot resume. Unmount cancels and rejects queued work. UI lock plus synchronous RN latch protect physical and accessible paths before parent state updates. Confirmed intent remains locked until resetKey changes while idle or a non-idle status returns to idle. Changing resetKey while processing or toggling disabled does not unlock accepted intent. Application owns operation identity, cancellation and actual outcomes.

Single accessible button: instruction/value, busy/disabled state, native activate and iOS accessibility tap alternatives, hidden descendants, discrete result announcements. No progress speech. Reduced motion uses quarter-step visual feedback with the same native duration. Styled minimum height 56 points, wrapping/scaling labels, logical-start RTL fill. Custom themes/layout/font tiers need consuming-app checks.

## Native environment and methods

- Android Medium_Phone_API_36.1, sdk_gphone64_arm64, Android 16 / SDK 36, 1080×2400 portrait; standalone arm64 nondebuggable Release, Hermes/New Architecture. Fresh bundle/assemble/install passed. Actual adb touch injection: stationary and moving swipe sequences, split DOWN/Home/UP lifecycle input. These are native touch events, not accessible activation or human manual tests.
- iPhone 17 Pro Simulator / iOS 26.2, 1206×2622; Debug build/launch with Metro. CUA coordinate clicks with explicit duration translated into actual Simulator long-press recognition. Separate exposed native accessibility action was also tested; it is not reported as physical hold evidence. Previous unreliable iOS drag mechanisms were not retried.

## Passed, failed and unexecuted matrix

| Scenario                                                   | Android Release                                                                    | iOS Debug                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Build/install/launch                                       | Passed                                                                             | Initially failed at runtime on AppState subscriptions; fixed and retest passed            |
| Early release at 50% (600/1200 ms)                         | Passed, zero acceptance                                                            | Passed, zero acceptance                                                                   |
| Hold through threshold                                     | Passed with 1500/1600-ms input                                                     | Passed with 1700-ms coordinate input                                                      |
| Progress then processing then success                      | Passed; screenshot and counters                                                    | Passed; authentic sampled recording and native AX/status                                  |
| Immediate repeat / locked result                           | Passed short repeat during processing, one confirmation                            | Passed repeat while result locked, no extra confirmation                                  |
| Rapid short holds                                          | Passed four 180-ms inputs                                                          | Passed three 180-ms inputs                                                                |
| Slight movement                                            | Passed 8 physical px over 1600 ms                                                  | Not executed                                                                              |
| Excess movement / outside boundary                         | Passed 180 physical px over 600 ms, no acceptance; outside separately not isolated | Not executed                                                                              |
| Disable during hold                                        | Passed armed 1-second prop change                                                  | Passed armed 1-second prop change, count unchanged                                        |
| Duration change during hold                                | Passed armed 1-second change                                                       | Passed armed 1-second change, count unchanged                                             |
| Background while holding / foreground                      | Passed split touch/Home sequence before threshold; no resumed acceptance           | Not executed during active hold                                                           |
| External error, explicit reset/retry                       | Passed                                                                             | Passed                                                                                    |
| Accessible immediate confirmation                          | Component tests only; native TalkBack action not executed                          | Passed exposed native custom action; not VoiceOver speech/focus                           |
| Unmount while processing / owner result / remount          | Passed actual hold then hide, processing screenshot; result retained               | Passed via accessible activation then hide, processing observed; success/remount retained |
| Physical hold in existing scrollable screen                | Passed                                                                             | Passed                                                                                    |
| Parent scroll takeover as an isolated checked cancellation | Vertical motion attempted, final cancellation not separately asserted; unresolved  | Not executed                                                                              |
| Multitouch                                                 | Controller rejection and native configuration only; native test not executed       | Not executed natively                                                                     |
| Reduced motion preserves hold interval                     | Passed OS transition scale zero: short release cancels, full hold completes        | Not executed natively; unit/event coverage only                                           |
| VoiceOver/TalkBack focus/readout/announcements             | Not executed fully                                                                 | Not executed fully                                                                        |
| RTL/orientation/largest fonts/custom themes                | Not executed for this new component; no inference from earlier components          | Not executed for this new component; iPhone target portrait-only                          |
| Physical devices / maximum-duration endurance              | Not executed                                                                       | Not executed                                                                              |

Changed Android transition animation setting was restored to 1.0 and checked against original ([restoration](evidence/android-settings-restored.json)). No unrelated native project configuration changed. iOS CUA finishing state is mounted/idle; its demo confirmation count intentionally persists until app reload. Metro remains local development infrastructure, not a published service.

## Reproducible defect and fix

**Failed then fixed:** iOS initial render threw unsupported appStateFocusChange. RN TypeScript accepts focus/blur but the iOS native AppState module does not. Subscribe to focus/blur on Android only, keep change events cross-platform, test the platform subscriptions explicitly. [Before-fix screenshot](evidence/ios-appstate-before-fix.png). Native iOS retest passes; library regression included.

A same-tick Android blur/accessible activation test also guards synchronous RN rejection before React commits. No verified native configuration problem or dependency incompatibility required an upgrade. No known reproducible critical defect remains.

Validation harness failures are separate: incorrect assumed iOS bundle ID (corrected from built plist), isolated showcase missing GestureHandlerRootView, preset listener mocks without remove(), spies mounted too late, and Android test expecting success while error was still selected. Corrected harness/setup and reran affected checks. No project behavior was changed to satisfy those errors.

## Automated checks

| Repository    | Executed commands                                             | Result                                         |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| Library       | typecheck, lint, format:check, test, build, pack:check        | Passed: 106 tests / 5 suites; no lint warnings |
| Showcase      | typecheck, lint, format:check, test --runInBand --watch=false | Passed: 8 tests / 4 suites; no lint warnings   |
| Documentation | typecheck, lint, test, build                                  | Passed: one test                               |
| Landing       | typecheck, lint, format:check, production build, test         | Passed: one test                               |

New tests cover statuses/styles, hold begin/cancel/activation, exactly once, accessible latch, reset, processing blocks, configuration/layout invalidation, stale queued callbacks after unmount/config changes, multitouch activation rejection, AppState/background/blur, synchronous interruption, reduced motion, announcements, invalid durations and iOS event compatibility. Gesture controller events do not enforce elapsed native duration or movement thresholds: actual native observations above are separate evidence. Showcase tests cover local success/error, hidden-owner result, reset, scheduled interruption and owner timer cleanup.

## Performance

[Measured Release report](performance-report.md): 20 real Android holds (10 complete / 10 cancelled), 30.950716917 s, **1211 rendered frames; 33 janky (2.73%)**; p50/p90/p95/p99 11/16/25/31 ms. Some deadlines missed, including two frames in the 121-ms histogram bucket. Window-level counters do not attribute costs, prove FPS or establish a regression versus different workloads. No speculative optimization. Per-component traces, render counts, memory, physical devices and iOS Release timings not measured. iOS recording has sample/capture limitations documented explicitly.

## Files created and modified

- Library: src/components/HoldToConfirm.tsx, src/index.ts exports, **tests**/hold-to-confirm.test.tsx, README.md, CHANGELOG.md; generated ignored build/tarball artifacts.
- Journal: five hold-to-confirm records, validation.md and genuine evidence; ADR 0007; Engineering Journal index and cumulative matrix.
- Showcase: src/catalog/HoldToConfirmDemo.tsx, **tests**/HoldToConfirmDemo.test.tsx, App.tsx fifth demo and native jump button, package-lock.json same-version local tarball integrity.
- Documentation: docs/reference/hold-to-confirm.md, API/catalog references and VitePress navigation.
- Landing: src/app/page.tsx text catalog entry and tests/landing.test.mjs catalog assertion. No web component.

The showcase uses fictional session reservation/$48.00 context, local deterministic 1800-ms result, success/error choice, reset/retry, disable, delayed disable/duration changes, duration switch and hide/remount. No network/provider/payment behavior. The component owns no operation timer.

## Release gates and readiness

Implementation complete, with available checks passed and no known blocking defect. Eligible for Iteration 6 implementation under AGENTS.md; **Iteration 6 not started**. Release validation remains pending: complete screen-reader focus/speech/action behavior, iOS motion/background/movement interruption, native multitouch and parent takeover, RTL/font/layout/theme breadth, physical-device and trace-based profiling. Prior four components' requirements remain in the [cumulative release matrix](../../release-validation-matrix.md).

No dependency upgrades, Expo, React Native Web, shared repository/workspace, commits, remotes, publication or deployment. Previous four component source hashes must remain equal to evidence/source-baseline.json; [final package audit](evidence/final-package-audit.json) confirms installed/tarball/profiled runtime identity and repository independence. Final showcase checks use the refreshed artifact; retained command logs are in evidence/. Existing iOS location-purpose/script-output and Android Gradle/Kotlin/legacy variant warnings remain; no library/showcase lint warnings.

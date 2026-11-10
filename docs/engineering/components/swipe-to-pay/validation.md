# Iteration 3 validation — 2026-11-08

Status: implementation delivered with unresolved native validation gates. Stop after Iteration 3. No commits, remotes, publishing or deployments. Development time not measured. Existing ExpandableTransactionCard and CardStackSelector sources/APIs were preserved; their regression tests pass.

## Architecture and public contract

Component-local implementation in src/components/SwipeToPay.tsx, root exports SwipeToPay/SwipeToPayProps/SwipeToPayStatus. Required label/status/onConfirm; optional disabled, threshold, resetKey, height, accessibilityLabel, labels, root/track/handle/label styles, springConfig, testID. See the design proposal and public reference for exact types/defaults. Controlled status is idle/processing/success/error; gesture idle/dragging/returning/confirmed is separate. UI and JS latches prevent duplicate acceptance before the parent updates. Reset from operation state to idle or change resetKey on idle to rearm. No automatic retries or inferred operation success. The app owns rejected Promises, stale async results and cancellation.

The handle follows shared-value translation, clamped to measured travel, mirrored for RTL. Final release distance must meet threshold (default .85, validated .5..1); velocity cannot substitute. A single-pointer pan on the handle yields to vertical scrolling. Changes to geometry, status, disabled, threshold, direction or reset invalidate incomplete/queued intent. Spring return/completion uses system reduced motion. Idle instruction fades with progress; processing is static. Haptics deferred. One accessible button exposes status/busy/disabled and an activation action through the same latch; discrete result announcements only.

## Automated checks

| Repository | Checks actually run                                                                           | Result                                                   |
| ---------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| native     | typecheck, lint, format:check, Jest, build, pack:check, npm pack                              | PASS, 36 tests / 3 suites; includes existing regressions |
| showcase   | typecheck, lint, format:check, Jest --watch=false                                             | PASS, 4 tests / 2 suites                                 |
| docs       | typecheck, lint, Node tests, VitePress build                                                  | PASS, 1 test                                             |
| web        | typecheck, lint, format:check, Next build                                                     | PASS                                                     |
| Android    | forced Release bundle, assembleRelease, final source-map content verification, install/launch | PASS                                                     |
| iOS        | Simulator Debug xcodebuild, install/launch, Metro iOS bundle                                  | PASS; HTTP 200 on final JS                               |

[Library log](evidence/library-checks.log), [showcase log](evidence/showcase-checks.log), [docs log](evidence/docs-checks.log), [web log](evidence/web-checks.log), [Android build](evidence/android-release-build.log), [iOS build](evidence/ios-debug-build.log).

Mocked controller tests cover threshold boundaries, clamps/reversal, canceled gestures, interrupted return, single-delivery latch, processing/success/error/reset, narrow/resize/disabled, RTL, multitouch, deferred callbacks after unmount/status changes, labels/styles/announcements, threshold changes and authoritative coalesced release. Showcase timer tests cover both results, stale reset completion and control unmount/remount while the consumer retains its operation. These tests do not establish native touch responsiveness or spoken screen-reader behavior.

## Native runtime matrix

Android: Medium_Phone_API_36.1 emulator, Android 16 API 36.1, arm64, 1080×2400; final Release artifact SHA-256 `6616834364bfcc09396f208f415fdb59168018f3c8796e44c1b5d59421e32054`. iOS: iPhone 17 Pro Simulator, iOS 26.2, Debug/Hermes/New Architecture. iOS functional tests preceded the final instruction-opacity-only refinement; final JS served HTTP 200, final UI retest blocked by locked Mac.

PASS means observed, PARTIAL means limited evidence, UNVERIFIED means attempted without an observed successful outcome, NOT RUN means not executed natively.

| Scenario                                                 | Android Release                                                                                                             | iOS Simulator Debug                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Launch / preserved catalog                               | PASS                                                                                                                        | PASS                                                                                 |
| 40% release / return without callback                    | PASS, final warmup and 10-cycle sample                                                                                      | UNVERIFIED touch injection                                                           |
| 90% release / processing / success                       | PASS                                                                                                                        | PASS through native accessible activation; drag UNVERIFIED                           |
| Processing / error / reset / retry                       | PASS, final counter 6→7 error then idle                                                                                     | PASS through native accessible action and reset/error selection                      |
| Continuous drag / bounded handle                         | PASS observed mid-drag screenshot and completed position; edge boundaries also unit tested                                  | UNVERIFIED                                                                           |
| Repeated partial drags / duplicate pending drags         | PASS, 10 partial + 5 complete + 5 additional pending drags, exactly 5 new confirmations                                     | NOT RUN reliably                                                                     |
| Parent scroll to component                               | PASS                                                                                                                        | PARTIAL; scrolling attempted, exposed AX action used                                 |
| Disabled resting control                                 | PASS, disabled node and drag adds no callback                                                                               | PASS, unavailable AX state observed                                                  |
| Width changed while idle                                 | PASS, 72% screenshot                                                                                                        | PASS visually inspected                                                              |
| Disable or resize during active drag                     | NOT RUN natively; mocked regression passes                                                                                  | NOT RUN natively; mocked regression passes                                           |
| Unmount during processing                                | NOT RUN conclusively natively; showcase integration test passes                                                             | NOT RUN conclusively natively; showcase integration test passes                      |
| Reduced motion                                           | PASS functional partial/confirmation/result at transition_animation_scale=0; timing not measured                            | PASS accessible processing/success with Reduce Motion ON; spring timing not measured |
| Dynamic font                                             | PASS visual font_scale=2.0 portrait                                                                                         | NOT RUN for this component                                                           |
| Orientation                                              | PARTIAL: rotated at font 200%, controls reflowed, but control was outside viewport in captured landscape; drag not verified | NOT RUN; existing target portrait-only                                               |
| RTL                                                      | NOT RUN natively; mocked direction regression passes                                                                        | NOT RUN natively; mocked direction regression passes                                 |
| Accessible alternate action                              | Native button/status/disabled tree verified; activation with TalkBack NOT RUN                                               | PASS exposed native secondary activation action, same operation counter/lifecycle    |
| VoiceOver / TalkBack focus, speech, announcement quality | NOT RUN for this component; previous TalkBack focus/speech gap remains                                                      | NOT RUN; simulator VoiceOver availability gap remains                                |
| Release frame capture                                    | PASS, see performance report                                                                                                | NOT RUN                                                                              |
| Physical device                                          | NOT RUN                                                                                                                     | NOT RUN                                                                              |

Android evidence: [mid-drag](evidence/android-release-mid-drag.png), [after sample](evidence/android-release-after-profile.xml), [error](evidence/android-release-error.xml), [reset](evidence/android-release-reset.xml), [disabled](evidence/android-release-disabled.xml), [narrow](evidence/android-release-narrow.png), [font 200% portrait](evidence/android-font200-portrait.png), [reduced motion success](evidence/android-reduced-motion-success.png). Landscape captures are retained as attempted/limited evidence, not proof that the component was verified in that viewport.

Android original preferences restored and queried: font_scale=1.0, accelerometer_rotation=1, user_rotation=0, transition_animation_scale=1.0. iOS Reduce Motion OFF was restored and verified in Settings. No native configuration was changed.

## Failures discovered and corrected

- Full-distance threshold lost the activation dead zone; capture position at touch begin, retain full translation. Regression at threshold=1 passes.
- A coalesced final movement could confirm/cancel using stale last-update distance. Use end-event translation. Both directions have passing regressions.
- Idle instruction was covered by the moving handle; fade it on the UI runtime, preserve operation and accessibility feedback. Final native screenshot inspected.
- Initial test assumptions about settled springs/mock announcement history were corrected; they were test setup failures, not native performance findings.

No known failing automated checks remain. iOS drag attempts remain unresolved rather than counted as a passing runtime test or assumed to be a configuration defect.

## Environment and warnings

Persistent Metro initially missed the new demo file (HTTP 500); restart with --reset-cache resolved it. Final iOS HTTP 200. A development device connection timed out while the app was away in Settings; no release impact established. No Metro/native configuration fix was justified. NODE_OPTIONS=--use-system-ca was incompatible with the default Node, so commands used installed Node 24.21.0 with NODE_OPTIONS removed. npm used a temporary cache to avoid the existing root-owned cache.

Library/showcase lint: zero warnings. Native build warnings remain: Android legacy variant APIs / Kotlin and DSL compatibility flags / Gradle deprecations; iOS empty NSLocationWhenInUseUsageDescription and script output/dependency-analysis warnings. These are existing toolchain/template debt outside this component; no unrelated native edits. Development Reanimated reduced-motion warning appeared while the preference was ON. npm local install noted unapproved optional fsevents install script; no new dependency/version was introduced. See captured logs for exact build warnings.

## Files created or modified in this iteration

- native: src/components/SwipeToPay.tsx, src/index.ts, **tests**/swipe-to-pay.test.tsx, README.md, CHANGELOG.md, docs/engineering/README.md; the five swipe-to-pay journal records plus this validation record and evidence. Generated lib and local tarball rebuilt.
- showcase: App.tsx, src/catalog/SwipeToPayDemo.tsx, **tests**/SwipeToPayDemo.test.tsx, package.json (src format coverage), package-lock.json (relative tarball integrity). Installed package refreshed from the public root API; no direct source imports.
- docs: docs/reference/swipe-to-pay.md, docs/reference/components.md, docs/reference/api.md, docs/.vitepress/config.ts. Navigation retains existing pages and adds the previously missing selector link alongside SwipeToPay.
- web: src/app/page.tsx, text catalog entry only.

The entire foundation was already untracked in these independent repositories, so Git status is not a reliable per-iteration diff. No staging, commit, remote or cross-repository workspace was created.

## Remaining gates and Iteration 4 recommendation

Implementation, package integration, automated regressions, Android core interaction and both native builds pass. **Do not treat Iteration 3 as fully validated or begin Iteration 4 yet.** Verify physical/native touch on iOS, full VoiceOver/TalkBack focus/speech and action semantics, native active-drag interruption/layout scenarios, landscape and RTL before closing the remaining acceptance gaps. Physical-device traces, JS/UI attribution and React render counts remain unmeasured technical debt; no production FPS or latency claim is warranted. No additional architectural change or dependency upgrade is currently justified.

## Follow-up

The historical matrix above records Iteration 3. See [Iteration 3.1 native validation](validation-iteration-3.1.md) for newer Android RTL/orientation/interruption evidence, iOS operation lifecycle, repeat Release measurements and the current unresolved gates.

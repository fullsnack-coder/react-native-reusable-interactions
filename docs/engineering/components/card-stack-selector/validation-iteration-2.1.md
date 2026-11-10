# Iteration 2.1 hardening validation

Date: 2026-11-08. Development time not measured. Public library API preserved.

## Environment and method

Android emulator Medium_Phone_API_36.1, Android 16/API 36.1, 1080×2400, arm64. iPhone 17 Pro simulator, iOS 26.2. React Native 0.88.1, Reanimated 4.7.1, Worklets 0.13.1, Gesture Handler 3.4.0. Physical-device performance is not inferred from simulator results.

Initial Simulator attachment by name timed out. Attaching through the full Xcode Simulator.app path succeeded later in this iteration; native iOS selection and interruption results are recorded below. VoiceOver speech/focus remains unavailable on this simulator.

## Changes and regression checks

- Moved static showcase styles into a local StyleSheet; retained only data-dependent background style. Lint reported zero warnings after extraction.
- Added direct collection reorder/removal controls for native testing. Removal tracks all removed IDs and removes the effective fallback selection, so repeated removal cannot restore previously removed cards. Showcase regression test passed.
- Added a library regression scenario with consecutive selection requests, reorder, selected removal, empty collection and repopulation; no synthetic callbacks. All twelve library tests passed at this checkpoint.
- Showcase card height follows font scale and control rows wrap, allowing its fixed-height consumer content to accommodate large text. Native visual validation recorded below as executed.

## Build attempts

Android `./gradlew :app:assembleRelease --offline --no-daemon` failed because lint-gradle:32.2.1 was absent from the local cache. Retried online without dependency version changes. Build outcome and profiling evidence will be appended after execution.

## Limits

Passing mocked tests does not establish native motion smoothness or assistive-technology speech. No FPS, latency, memory or frame-time result is claimed without captured evidence.

## Accessibility investigation and rejected fix

The default UIAutomator dump showed secondary cards as focusable, leading to an initial suspected accessibility leak. This was a false positive: UIAutomator's default hierarchy includes views marked not important for accessibility. The `--compressed` mode removes FLAG_INCLUDE_NOT_IMPORTANT_VIEWS and showed only the selected primary card. Source: https://android.googlesource.com/platform/frameworks/uiautomator/+/dec12c69b4e09679f691050d8fdcab0a5e474258/cmds/uiautomator/src/com/android/commands/uiautomator/DumpCommand.java

A temporary defensive patch to card Pressable properties was evaluated and then removed because the leak was not reproduced in the filtered tree. The existing public API and component implementation are retained. The new regression test checks existing native-container touch and accessibility gating.

The local tarball replacement also exposed a stale Release bundle: Gradle considered bundle generation up to date because changes inside node_modules were not an input change. Verified using sourcesContent in the generated Hermes sourcemap. Forced `:app:createBundleReleaseJsAndAssets --rerun-tasks`, then assembled again. APK assets were compared with generated bundle bytes. This is a local artifact workflow issue, not a library runtime defect.

## iOS native validation

Using the full Simulator.app path resolved the UI automation attachment problem. On iPhone 17 Pro/iOS 26.2 Debug: expanded the stack, scrolled, selected Reserve, and verified collapsed selected state. Then opened, reversed order and removed the selected card in a short action sequence; Journey became the deterministic fallback. A rapid coordinate tap burst left a stable expanded state, followed by an explicit close that settled correctly. The input tool did not provide a callback count or exact accepted-tap count, so no stronger race or latency claim is made.

The accessibility tree exposed only the primary card when collapsed and all available cards when expanded. Simulator Settings has no VoiceOver option in its available accessibility features; actual VoiceOver speech/focus validation remains unavailable. Enabled Reduce Motion, relaunched the app, expanded and selected Journey successfully, then restored Reduce Motion to off. Movement duration was not instrumented. A development warning appeared under reduced motion; the installed Reanimated utilCommon emits that warning intentionally in development.

Rotating the simulator retained portrait app layout. Info.plist declares only portrait for iPhone, so landscape reflow is not validated on this showcase target. Native configuration was preserved. Largest iOS accessibility text size was enabled and activation/selection semantics stayed available; full visual card-content fit was not verified because the large hero occupied the viewport and automated scrolling did not reach the card reliably. Restored content_size to its original large category and device orientation upright.

## Android final Release validation

Verified the original component in the final Release APK with `uiautomator dump --compressed`: only Everyday appears while collapsed; available cards appear after expansion. Full/pruned hierarchy evidence is retained separately. The suspected hidden-card leak was not reproduced with accessibility filtering.

After 20-cycle timing capture, sent a short expansion → reverse → remove selection → close sequence. The filtered tree showed closed state and Journey selected, with no permanent intermediate layout. Native accepted-event counts were not instrumented; mocked tests cover exact callback sequences.

At font_scale=2.0 and landscape, the selector reflowed to available width, the larger card text fit within its card, and parent scrolling recovered content below the viewport. Changing Android font scale recreated the screen and reset demo state; this is not evidence of selection loss from rotation alone. A later rotation-only check retained Reserve selection (see evidence/android-release-rotation.xml). Restored font_scale=1.0, user_rotation=0 and accelerometer_rotation=1.

Set TRANSITION_ANIMATION_SCALE=0, relaunched, expanded, located Reserve using its actual accessibility bounds, selected it, and verified collapsed Reserve selected. Functional behavior passed under system reduced motion; duration/suppression timing was not instrumented. Restored transition_animation_scale=1.0.

TalkBack 16.0.0.777931756 was enabled and confirmed bound with touchExplorationEnabled=true. Declined its notification prompt. Native injected focus/double-tap sequences expanded and selected Reserve with TalkBack active. However the visible focus ring stayed on earlier screen content, and injected swipe traversal did not reliably move it. This is a **partial** validation: spoken output and correct user focus traversal are not verified, and no focus fix is claimed from this injection result. Restored enabled_accessibility_services to absent and accessibility_enabled=0. Manual TalkBack focus/speech validation remains a release gate.

## Validation matrix

| Check                            | Android                                                         | iOS                                                             |
| -------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Build                            | Release passed                                                  | Simulator Debug passed                                          |
| Expand/select/collapse           | Passed, Release                                                 | Passed, Debug                                                   |
| Rapid interruptions              | Stable final state in native burst; exact callbacks unit-tested | Stable final state in native burst; exact callbacks unit-tested |
| Reorder/remove during transition | Passed short native sequence + unit regression                  | Passed short native sequence + unit regression                  |
| Filtered accessibility structure | Passed                                                          | Passed native AX structure                                      |
| Screen reader                    | Partial TalkBack activation; focus/speech unresolved            | VoiceOver unavailable in this simulator                         |
| Reduced motion                   | Functional pass after relaunch; timing not measured             | Functional pass after relaunch; timing not measured             |
| Large fonts                      | 200% landscape visual check passed                              | Largest-size activation checked; complete visual fit unverified |
| Orientation                      | Landscape reflow and rotation-only selection retention passed   | iPhone target portrait-only; landscape reflow unexecuted        |
| Performance                      | Release gfxinfo sample captured                                 | Not measured                                                    |

## Final gates and recommendation

Library: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, `npm run pack:check` passed; 13 tests. Showcase: typecheck, lint, format and 2 integration tests passed. Zero inline-style lint warnings remain. Android Release and iOS Simulator Debug builds passed. Gradle still reports existing deprecated APIs; native dependency script-phase warnings are not changed. The four repositories remain independent; no versions, public API, commits, remotes or publication changed.

No reproducible CardStackSelector functional defect requiring a production-code rewrite was established. Keep manual TalkBack/VoiceOver focus and speech checks, full largest-font visual coverage and representative-device profiling open. Iteration 3 development can build on the component, but this report is not a complete accessibility or production release approval.

> Historical Iteration 7 decision. The maintainer superseded its automatic reader-only beta blocker in Iteration 7.1; see the [current report](../iteration-7.1/final-report.md). Original measurements and artifact hashes below remain historical.

# Iteration 7 final release-preparation report

2026-11-10. **NOT READY — BLOCKERS REMAIN** for public publication. Implementation/release preparation completed; scoped real physical touch validation passed on Android/iPhone by owner confirmation. Critical TalkBack/VoiceOver validation was deferred, so Physical Device Validated remains partial and Release Ready is No. No public action performed.

## A. Release summary and identity

React Native Reusable Interactions, package `@manueldev25/react-native-reusable-interactions`, exact version `0.1.0-beta.1`. Owner changed the originally requested scope after authenticated npm whoami confirmed manueldev25; exact public package query 404 and GitHub name search 0 matches. No reservation/legal/trademark clearance inferred. Owner confirmed existing MIT and selected repository Issues for reports/private follow-up for sensitive details. Actual remote/Issues/docs location is pending; none invented. No Stable/v1 API guarantee; all six components are Beta candidates. Version is immutable when published; intended beta dist-tag is a movable registry pointer, not latest.

## B. Architecture and six API audits

Six components plus PurchaseSheetHost audited: control/ownership/defaults/identity/precision/threshold/timing/dismissal/composition/disabled/reset/cleanup/accessibility/types. [API audit](public-api-audit.md), [compatibility](compatibility-matrix.md).

Disclosure/stack now reject nonfinite/nonpositive spring parameters, disclosure explicitly cancels on unmount. Owner-reproduced Android SwipeToPay arrow replaced by centered native geometry, preserving RTL/accessible intent. Sheet callback timing comment clarified. No new interaction, generic framework, native architecture rewrite, Expo/Web/backend/payment SDK or runtime dependency. Native stack stayed RN 0.88.1/React 19.3/Reanimated 4.7.1/Worklets 0.13.1/RNGH 3.4; peers narrowed to expected-compatible patches. Generated example gained its own config/direct existing TypeScript 6.0.3 to check its own placeholder, not parent library. Scoped imports/Jest whitelist and independent vendored showcase integrity fixed integration friction. Only owner-selected iPhone team changed required signing configuration.

## C. Candidate package audit

Local artifact: `microinteractions-native/artifacts/manueldev25-react-native-reusable-interactions-0.1.0-beta.1.tgz`.

- SHA256: `13032b12ca6a25a9f226593050ac4fed5b09a253f5335de9849411224352a640`.
- Bytes: 78293; files: 68; reviewed ESM Metro and typed root exports, package.json only additional public subpath.
- All six/host and public prop/status/reason/spring types present. No bundled React/RN/native peers, examples/native binaries/secrets/local paths in actual payload.
- Build-only prepack inspected; no prepare/postpack/prepublishOnly publishing lifecycle. Pack inspection and repeated archive bytes/integrity passed; no npm publish/dry-run publish.
- Root lib, actual archive, showcase/independent installed files and embedded Android maps match 10 runtime files; physical-tested runtime also byte-identical. [Package details](package-validation.md), [final audit](evidence/final-package-audit.json).

## D. Clean independent consumer

Generated fresh RN Community CLI app at /private/tmp/rnri-beta-consumer outside all four repositories, own lock/node_modules/native projects, installed final actual tarball/direct peers/Babel/root host. Public/negative internal-path TypeScript contracts pass. No original workspace sources in final map or installed symlink. Android and iOS Simulator **Release** builds/install/runtime pass within scope. Android actual taps/swipe/full hold verify all six and host isolation/cleanup; final iOS native AX rendering/host size/close verified, not VoiceOver/physical-pan automation. [Integration](consumer-integration.md), [consumer evidence](evidence/consumer/android-runtime.json).

## E. Automated/local quality

| Gate                                                                    | Result                                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Library clean install/types/lint/format/tests/build/pack checks         | Passed, 153 tests/6 suites; lint 0 warnings                                       |
| Showcase clean install/vendor verification/types/lint/format/tests      | Passed, 10 tests/5 suites; lint 0 warnings                                        |
| Docs clean install/types/lint/API inventory/link/release tests/build    | Passed, 3 tests                                                                   |
| Landing clean install/types/lint/format/production/built-HTML test      | Passed, 1 test; 375/1440 layout no overflow/broken anchors                        |
| Generated development shell own typecheck                               | Passed; placeholder is not native component coverage                              |
| Independent consumer exact final artifact/type contracts/Release builds | Passed; actual runtime observations retained                                      |
| CI                                                                      | Pinned/least privilege/YAML statically validated; hosted Not Executed, no remotes |

Failed exploratory checks were fixed and rerun: old Jest package allowlist, Markdown generic parsed as HTML, inherited example Jest types/offline cache miss, stale installed same-version file, wrong initial disposable iOS bundle identifier. Final showcase native rebuilds initially failed because Watchman's index omitted on-disk React; before/after targeted query proves environment issue. Only showcase watch recreated and task Metro restarted loopback; Android and signed iPhone builds pass afterward. [Recovery](evidence/metro-watchman-recovery.json). No global watcher/resolver/native configuration workaround.

## F. Native and guided physical results

| Environment                                                    | Actual outcome                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Android emulator 16 / SDK 36, arm64 Release                    | Independent final consumer native touches and six-scenario showcase profiling pass; frame/memory observations scoped                                                                                                                                                                  |
| Xiaomi 2201117SL Android 13 / SDK 33 physical Release          | ADB install/foreground verified; owner confirmed six indicated touch scenarios, keyboard/Back/insets and chosen motion/text/restoration. Arrow failed initially, fixed and owner rechecked                                                                                            |
| iPhone 17 Pro Simulator / iOS 26.2 consumer Release            | Builds/install/native AX public rendering/host actions pass; no reader/pan claim from AX                                                                                                                                                                                              |
| iPhone 16 Pro Max / iOS 27 physical signed Release, Xcode 26.2 | Wired/trust/DDI readiness and owner-selected signing; build/install/launch verified. Owner confirmed six indicated touch scenarios including real partial/full/reversed/rapid Swipe pans, real sheet pans/body scroll/keyboard and hold background cancellation; motion/text restored |

Owner confirmations are not instrumented traces; exact font tier/timing and every orientation/RTL/multitouch/advanced input edge are unexecuted. [Physical matrix](physical-device-results.md) distinguishes every scope. Some specific historical iOS pan gaps are closed; broader old gates remain in [cumulative matrix](../../release-validation-matrix.md).

## G. Accessibility

All six have inspected semantic/non-gesture alternatives and unit/native AX evidence. Default opaque palette ratios computed for selected pairs, not full consumer themes. TalkBack/VoiceOver activation/navigation/exit and component checklist guidance supplied; owner explicitly deferred both. **Actual critical reader completion, order/focus containment/return and spoken state: Not Tested.** This blocks public release; passing unit/AX/touch tests cannot close it. [Audit](accessibility-audit.md), [guided workflow](../../../../docs/release/physical-device-testing.md).

## H. Performance

Android Release emulator whole-window samples, real inputs and monotonic durations recorded for six scenarios. Janky/frames: disclosure 24/246, stack 7/291, swipe 15/299, balance 2/381, hold 10/362, sheet 9/720. No cross-workload comparison. Unchanged-code later disclosure repeat 1/248 retained alongside first tail; not evidence of an optimization or isolated root cause. Numerical idle app PSS 101235 KB / RSS 196908 KB is one snapshot, not a leak profile. No per-component FPS/latency/React-render/JS/UI/GPU or physical-device benchmark invented. [Full method/raw results](performance-summary.md).

## I. Documentation / community / CI

README/CHANGELOG/version/metadata/scoped public examples and six references match implementation; installation, host, compatibility, reader/motion, performance and reproducible troubleshooting updated. Landing brand/SEO/text-only catalog retained design; 375/1440 checks recorded, no fake native web demos/assets/metrics. Showcase all six reachable with fictional local intent/result controls, no business requests. CONTRIBUTING/CoC/SECURITY/issue/PR/component proposal/RFC/acceptance/maturity/maintainer guidelines prepared, owner sole initial maintainer. Journal component histories appended, cumulative matrix updated and old snapshot preserved. No hosted CI/deployment claimed. [CI audit](ci-review.md).

## J. Artifacts / runbook

[Package](package-validation.md), [release notes](release-notes.md), [compatibility](compatibility-matrix.md), [known issues](known-issues.md), [release checklist](release-checklist.md), [publishing runbook](publishing-runbook.md), [physical guide](../../../../docs/release/physical-device-testing.md), [source/metadata baseline](evidence/baseline-sha256.json), [exact final audit](evidence/final-package-audit.json). Relevant disposable consumer fixtures are inert text; no build output/credentials are added to npm package. Existing source repository directory names unchanged.

## K. Remaining risks

- **Blocker:** critical actual TalkBack/VoiceOver usability/focus/speech unverified after owner deferral.
- **High:** VitePress latest stable 1.6.4 still depends on vulnerable Vite 5 dev tooling; loopback limits exposure, does not patch. No unsupported major/alpha migration forced. Static/native package is separate; supported upstream update/retest pending.
- **Medium:** broader devices/fonts/RTL/multitouch/keyboard/navigation/endurance, low/moderate build/test dependency advisories, and component trace/memory/latency attribution.
- **Low/governance:** actual remote/Issues location and hosted CI pending future authorized repository setup; exact-artifact release approval not granted. Existing native build-script/empty purpose/static-global and optional fsevents/deprecation warnings disclosed.

[Security severity/reachability](security-audit.md) includes actual registry reports; no blind npm audit fix --force. No own library network/data logging/dynamic evaluation/permissions/payment authorization added. Existing debug signing is a test fixture excluded from package. MIT retained; reporting plan is owner's Issues choice, not an invented private inbox.

## L. Final decision and next action

**NOT READY — BLOCKERS REMAIN.** Local release preparation/Implementation Complete passes; physical touch/motion/text passed on both within owner-confirmed scope; Physical Device Validated is partial and Release Ready is No. The next essential action is guided critical TalkBack/VoiceOver validation when the owner chooses to resume it, followed by disposition of remaining release risks/actual reporting setup and explicit approval of exact archive. No public action may follow from this report alone. No commits/remotes/tags/npm publication/GitHub releases/deploy/store actions. Stop after Iteration 7.

# AnimatedBalance — Iteration 4 validation

Recorded 2026-11-09. **Implementation complete; native validation partial; release validation pending.** Development time was not measured. No Iteration 5 implementation was started.

## Implementation and public contract

Presentation only: the application owns the authoritative decimal string. No monetary calculations, network, backend, interpolation of financial values or extra animation mode. API:

```tsx
<AnimatedBalance
  value="12840.75"
  currency="PEN"
  locale="es-PE"
  duration={450}
/>
```

`value: string` is required. Optional `currency`, `locale` (en-US), `fractionDigits` (currency metadata or 2, integer 0..6), `duration` (450 ms, finite 0..2000), `style`, `textStyle`, `accessibilityLabel` and `testID`. Canonical optional-minus decimal input supports at most 15 integer and 6 fractional digits. Reject invalid input and significant excess precision; normalize trailing zeros and mathematical negative zero. No silent rounding. Generic exact counters may omit currency.

Intl formats only the exactly representable integer magnitude; a checked localized glyph template replaces zero fractional digits with the exact input fraction. Negative subunits use the negative-one pattern and replace its integer digit with zero. Locale literals, symbols, grouping and spacing remain native. No formatToParts requirement. Non-Latin digits/bidi literals use whole native Text to preserve shaping, without rolling.

ASCII digit columns use decimal-place identity, measured maximum digit width, a fixed 30-row strip and one cyclic UI-thread transform per digit. Increasing values roll up, decreasing values roll down; unchanged digits do not restart. Insert/remove columns discretely. Retarget from current visual progress with bounded travel, no completion queues or per-frame formatting/React state. Mount/configuration changes snap; reduced motion and duration zero snap/cancel. Accessible content is one complete latest amount; descendants hidden and automatic live announcements disabled. Applications own announcement cadence.

## Environment and input methods

- Android: Medium_Phone_API_36.1, sdk_gphone64_arm64, Android 16 / SDK 36, 1080×2400, standalone nondebuggable Release, arm64. Existing signing; fresh JS bundle forced. APK hash and capture metadata in [performance report](performance-report.md).
- iOS: iPhone 17 Pro Simulator, iOS 26.2, 1206×2622, Debug build with Metro, Hermes/New Architecture. Native build succeeded; corrected JS exercised through Metro.
- Android actions use adb injected taps and actual horizontal pans; assertions use fresh UIAutomator hierarchies plus screenshots. iOS requests use native accessibility button activation and visual/video observation. These iOS actions are not physical touch-driven drags.
- Reliable alternative to prior Simulator scroll input: a small native “View Animated Balance” catalog button scrolls to the existing fourth demo. No navigation dependency or unrelated redesign.

## Validation matrix

**Passed** means the described observation only; **not executed** is not a pass.

| Check                                               | Android Release                                                                | iOS Debug                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Build, launch, initial visible amount               | Passed                                                                         | Passed after two fixes below                                                                         |
| Increase/decrease, 999.99 → 1000.00 carry, negative | Passed                                                                         | Passed                                                                                               |
| PEN, USD, EUR, JPY                                  | Passed; actual native symbols                                                  | Passed; actual native symbols                                                                        |
| Arabic numbering/bidi static fallback               | Passed                                                                         | Passed                                                                                               |
| Maximum integer / exact six decimals                | Passed; complete AX value and native horizontal scroll                         | Passed complete AX value; visible viewport partial                                                   |
| Rapid four-snapshot interruptions, latest wins      | Passed                                                                         | Passed; sampled video shows rolling/retarget and final 1875.75                                       |
| Unmount/remount                                     | Passed during rapid updates; owner reaches final snapshot while absent         | Passed settled value; active-animation unmount not executed                                          |
| Narrow 72% width / overflow                         | Passed: 860 → 619 px; real pans expose .123456                                 | Width control exercised; overflow touch scrolling not executed reliably                              |
| Reduced motion                                      | Passed functional OS setting zero, early/final snapshots; latency not measured | Not executed natively for this component; unit/event coverage only                                   |
| Larger fonts                                        | Passed 200%: no vertical clipping; partial horizontal viewport by design       | Passed extra-extra-extra-large Dynamic Type visible glyphs; largest accessibility tiers not executed |
| RTL context with Latin locale                       | Passed: numeric order and logical-end alignment                                | Passed: forced RTL process, correct Latin order/logical-end alignment                                |
| Orientation                                         | Passed landscape, default amount fits and AX stays correct                     | Not executed: existing iPhone target portrait-only                                                   |
| Single complete native accessible amount            | Passed hierarchy inspection                                                    | Passed AX inspection                                                                                 |
| VoiceOver/TalkBack focus, speech, announcements     | Not executed fully; prior tooling limitations carried forward                  | Not executed; reliable VoiceOver input/audio unavailable                                             |
| Physical devices / custom fonts                     | Not executed                                                                   | Not executed                                                                                         |
| Release frame counters                              | Passed capture, missed frames observed; see below                              | Not measured                                                                                         |

All changed Android font/orientation/motion/app locale settings were restored and compared with their originals ([baseline](evidence/android-original-settings.json), [restored](evidence/android-restored-settings.json)). iOS content size restored to large; forced RTL process terminated and normal launch restored. No native project configuration changed. Earlier hardcoded jump coordinates failed after font/layout changes; waiting for layout and resolving fresh button bounds succeeded. This was not a verified component bug.

## Failed checks and fixes

1. **Failed, fixed:** initial iOS render threw because Hermes has no Intl.NumberFormat.formatToParts. Replaced that dependency with validated Intl.format templates while preserving decimal precision. Regression explicitly removes formatToParts; native retest passed. [Original failure](evidence/ios-initial-intl-error.png).
2. **Failed, fixed:** after formatter repair, accessible amount was correct but rolling digits were invisible. Explicit full strip and Text height (30 cells) resolves native clipping. Regression checks strip height; both platforms visually retested. [Before fix](evidence/ios-initial-digit-clipping.png), [after/motion samples](performance-report.md#ios-visual-recording).

No known reproducible critical defect remains. No dependency upgrade or unrelated native fix was needed.

## Automated validation

| Repository    | Executed checks                                                          | Result                                          |
| ------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| Library       | typecheck, lint, format:check, test, build, pack:check                   | Passed; 79 tests / 4 suites; zero lint warnings |
| Showcase      | typecheck, lint, format:check, test --runInBand                          | Passed; 6 tests / 3 suites; zero lint warnings  |
| Documentation | typecheck, lint, test, build                                             | Passed; one test                                |
| Landing       | typecheck, lint, format:check, test, production build                    | Passed; one test                                |
| Native        | iOS Debug simulator build; Android Release fresh bundle/assemble/install | Passed                                          |

New library coverage includes exact formats/limits, invalid input, negative subunits, carries and positional identity, retarget bounds/direction, unchanged/rapid updates, reduced motion, duration zero, cleanup, typography/format changes, native-height regression and complete accessibility label. Showcase integration tests exercise packed public API, atomic presets, rapid update cleanup and remount behavior. Existing component suites still pass. Prior three implementation file hashes match [baseline](evidence/source-baseline.json); old public APIs were preserved.

The landing test initially failed because it still expected the Iteration 0 “first component is planned” copy. Its truthful-catalog assertion was updated to the implemented four-component catalog and pending publication; the fresh production build and test passed. Raw check/build logs are retained in evidence/. [Final package audit](evidence/final-package-audit.json) confirms the installed package, tarball and profiled Android source-map runtime match byte-for-byte, previous component source hashes are unchanged and four Git roots remain separate. Final packaging refresh preserves runtime source hashes and updates the showcase tarball integrity; documentation-only package refresh does not change the profiled runtime. Four separate Git roots remain intact; no parent repository, commits, remotes, dependency upgrades, publishing or deployment were introduced.

## Remaining build warnings and development server

Library/showcase lint: zero warnings. Existing native build warnings remain: iOS empty NSLocationWhenInUseUsageDescription and bundle script without output dependencies; Android deprecated builtInKotlin/newDsl flags and legacy variant APIs. These were not changed as part of this component. Transform-cache reset and NO_COLOR/FORCE_COLOR messages are development/build environment notices. Builds succeeded; none is asserted as a new AnimatedBalance defect. Metro was checked at closeout and returned `packager-status:running` on port 8081.

## Performance findings

Actual Android Release window capture: **1409 rendered frames, 32 janky (2.27%)**, p50/p90/p95/p99 **16/17/17/17 ms**, **30.128325458 seconds**, 30 rapid bursts / 120 requested snapshots, six digit columns. Some deadlines were missed. No component FPS/latency, improvement or cross-component ranking is inferred. [Methodology, raw counters, recording and limits](performance-report.md).

Per-component CPU/UI/JS attribution, actual React render counts, memory/heap stability, maximum-column sustained profile, iOS frame timing and physical-device performance are **not measured**. Architectural avoidance of per-frame React state is code inspection, not a measured render count.

## Files created and modified

- Library: `src/components/AnimatedBalance.tsx`, `src/components/animated-balance-model.ts`, `src/index.ts`, `__tests__/animated-balance.test.tsx`, README.md, CHANGELOG.md and regenerated ignored package/build outputs.
- Journal: all five AnimatedBalance records, this validation report and actual evidence; ADR 0006; Engineering Journal index and cumulative release matrix.
- Showcase: `src/catalog/AnimatedBalanceDemo.tsx`, `__tests__/AnimatedBalanceDemo.test.tsx`, App.tsx (demo and jump button), existing App mount test uses async act, package-lock.json (same-version tarball integrity).
- Documentation: `docs/reference/animated-balance.md`, reference API/catalog and VitePress navigation.
- Landing: `src/app/page.tsx` text catalog entry only; `tests/landing.test.mjs` updated from its obsolete Iteration 0 planned-component expectation to check all four names and pending publication. No web implementation.

Demo controls cover increase/decrease, carries, negative/large/exact-six-decimal values, atomic locale/currency changes, rapid updates, narrow width, hide/remount and reset. All examples are fictional static snapshots; no financial arithmetic or networking.

## Remaining release gates and readiness

Full screen-reader focus/readout, iOS effective reduced-motion runtime changes, largest accessibility font tiers, custom fonts, physical devices and sustained maximum-column/trace profiling remain open. Existing components' outstanding native checks are preserved in the [cumulative release matrix](../../release-validation-matrix.md). No previous gap is marked closed based on AnimatedBalance results.

**Implementation complete and eligible for Iteration 5 development under AGENTS.md. Release validation pending.** No release/publication recommendation. Stop after Iteration 4.

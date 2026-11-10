# Implementation journal

2026-11-08. Development time: not measured.

Implemented a generic CardStackSelector with independent selection and expansion ownership, stable keys, deterministic fallback, geometry validation, shared progress, and unmount animation cancellation. No changes to ExpandableTransactionCard. Added root exports, seven new component tests (including parameterized collection sizes), and a controlled three-card showcase alongside the existing demo. The showcase uses a rebuilt relative tarball dependency.

Validation: library typecheck, lint, ten tests and build passed. Showcase typecheck, lint (inline-style warnings), formatting and integration test passed. Android debug assemble passed. Documentation initially failed because raw type syntax in the props table was parsed as Vue; code formatting fixed the build. Landing typecheck, lint, format and production build passed.

Collection removal can leave an old animated selection index outside the new collection. Interpolation is clamped to valid ranks to keep geometry bounded. Shared rank lookup arrays are memoized outside animation worklets.

Remaining validation is recorded below as it completes. Tests do not measure native animation or production performance.

## Native validation

Android emulator API 36.1: installed fresh APK; Metro returned HTTP 200. Scrolled from the existing transaction demo to the collapsed stack, expanded, scrolled the three-card collection, selected Reserve, and verified settled collapse with Reserve selected and primary. Temporary screenshots: /private/tmp/iteration2-stack.png, /private/tmp/iteration2-expanded.png and /private/tmp/iteration2-selected.png. Earlier hot reload during package replacement logged an undefined component; a fresh launch with the new artifact completed the flow.

Both iOS Simulator Debug xcodebuild and Android assembleDebug exited 0. Native rapid reversals, removal mid-motion, rotation, large text, screen-reader focus, reduced motion and Release profiling remain unverified. Unit tests cover controlled request alternation and collection reconciliation only.

Final checks: eleven library tests passed, including controlled rapid expansion request alternation; typecheck/lint/format/build/pack dry run passed. Showcase final artifact typecheck and integration test passed. Added 0/1/3-card controls for empty, single and dynamic collection demonstration; these final controls are covered by static checks, not a repeated native interaction session. iPhone 17 Pro iOS 26.2 launched successfully and screenshot showed the scrolling showcase and selector header/initial card; iOS selection interaction remains unverified. Documentation build passed after table correction. Performance remains not measured. No new ADR: choices are component-local and preserve existing architecture.

## 2026-11-08 — Iteration 2.1 hardening

See [actual validation matrix and evidence](validation-iteration-2.1.md) and [Release timings](performance-report.md). Added interruption/collection and accessibility-container regression tests. Refactored showcase styles to a local StyleSheet (zero lint warnings), added reorder/removal controls, made repeated removal use the effective fallback selection, and scaled showcase card height for text size. A default UIAutomator hierarchy suggested hidden-card leakage, but the accessibility-pruned hierarchy disproved it; the temporary defensive library patch was removed. CardStackSelector's public API and production implementation remain unchanged.

Android Release and iOS Debug native flows were exercised. Thirteen library tests and two showcase tests passed. Android Release timing: 1196 rendered frames, 35 janky frames (2.93%), p50/p90/p95/p99 16/16/17/17 ms on the emulator. These are window-level emulator metrics, not a physical-device FPS/latency guarantee. Full manual screen-reader focus/speech and iOS profiling remain open. All modified simulator accessibility/display preferences were restored. Development time: not measured.

## Iteration 7 release hardening — 2026-11-10

Reviewed public API, current regressions, exact peer compatibility, package consumption and accessibility/performance limits. Guided physical Android 13 / Xiaomi 2201117SL and iPhone 16 Pro Max / iOS 27 indicated touch scenarios passed by explicit owner confirmation; chosen larger-text/reduced-motion checks passed and preferences were restored. TalkBack/VoiceOver were deferred by owner and remain Not Tested; no blanket release pass. The specific component cases, defects/fixes, native build identities and carried gates are in [release audit](../../releases/0.1.0-beta.1/release-audit.md) and [physical results](../../releases/0.1.0-beta.1/physical-device-results.md). Existing historical records remain valid within their original scope.

Added finite-positive resolved spring validation before native animation; identity/selection/collection API unchanged. Native frames remain window-level, not per-card attribution.

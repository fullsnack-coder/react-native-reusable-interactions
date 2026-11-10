> Historical Iteration 7 decision. The maintainer superseded its automatic reader-only beta blocker in Iteration 7.1; see the [current report](../iteration-7.1/final-report.md). Original measurements and artifact hashes below remain historical.

# Release audit — React Native Reusable Interactions 0.1.0-beta.1

Recorded 2026-11-10. **Release preparation/implementation complete; physical validation partial; public release NOT READY — BLOCKERS REMAIN.** Both devices passed the indicated real-touch/motion/text cases by owner confirmation; TalkBack/VoiceOver were explicitly deferred. No development duration measured, no public action performed.

## Internal audit checklist — review completed, not blanket test passes

- [x] All four instructions/Git roots/status/manifests/locks/TypeScript/lint/format/build/test/CI/journal/ADRs/known debt inspected. Four roots remain independent; no staging/commits/remotes/tags.
- [x] Installed RN/UI UX skills applied; advisory Expo/monorepo rules ignored per project scope.
- [x] Six public API/control/callback/invalid input/disabled/style/a11y/composition contracts reviewed; existing valid APIs retained. [API audit](public-api-audit.md).
- [x] Official exact native peer compatibility checked, ranges narrowed without upgrading stack. [Compatibility](compatibility-matrix.md).
- [x] Owner-selected scope authenticated and registry/GitHub name searches recorded; no reservation/legal-clearance claim. Owner confirmed MIT and Issues reporting plan. [Branding](branding.md).
- [x] Lifecycle/content/exports/types/metadata/native exclusions and deterministic local pack checked. [Package](package-validation.md).
- [x] Exact tarball installed in fresh independent CLI consumer outside repositories; both native Release builds and actual runtime evidence, public/negative type contracts. [Consumer](consumer-integration.md).
- [x] Both physical devices connected through guided checkpoints, owner signing/team, install/launch and six touch scenarios confirmed. Reader steps offered/deferred honestly. [Physical](physical-device-results.md), [accessibility](accessibility-audit.md).
- [x] Meaningful invalid-spring/RTL-decoration regressions, full prior regression suite and all four production checks executed. Gate A local results below.
- [x] Six actual Android Release window samples, disclosed noisy repeat and numerical process memory snapshot. [Performance](performance-summary.md).
- [x] Dependency/security/permissions/intent-ownership review with unresolved reachability/severity. [Security](security-audit.md), [known issues](known-issues.md).
- [x] Self-contained showcase/vendor guard; pinned least-privilege CI, public docs/landing/SEO/navigation and lightweight community templates. [CI](ci-review.md).
- [x] Release notes, checklist and publishing runbook prepared. Final exact-artifact publication approval and critical readers remain pending, not waived.

## Reproducible findings and corrections

| Finding                                                      | Correction and actual validation                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Physical Android arrow below circle center                   | Native geometry replaces decorative font glyph; no new dependency/gesture/API. Before/after screenshot and owner corrected partial/full drag confirmation.                                                                                                                                                 |
| Disclosure/stack resolved spring values unguarded            | Finite-positive guards, explicit disclosure unmount cancel; 8 invalid-input regressions. No invented native crash/leak measurement.                                                                                                                                                                        |
| Same-version vendored artifact retained stale installed code | Explicit artifact install, lock integrity + installed/archive runtime guard; showcase independent of sibling source. Scoped Jest ESM allowlist updated.                                                                                                                                                    |
| Generated shell typecheck walked to parent config            | Own tsconfig/types and direct existing TypeScript 6.0.3 dev tool; own-placeholder typecheck now passes. Real external consumer remains required.                                                                                                                                                           |
| Stale public pages/partial exports/missing CI gates          | Six accurate Beta references, root types/host/API, installation, troubleshooting, physical/reader limits; 3 docs tests plus build, branded landing built-HTML test and responsive checks.                                                                                                                  |
| Local Watchman lost React index after npm ci                 | Disk/Node resolution existed, Watchman query returned no file with dropped-event recrawl warning. Project-only watch reset restored index/warning; Metro restarted loopback, /status and affected Android/iPhone Release rebuilds pass. No resolver/native configuration workaround or global watch reset. |

The initial audit and failed/recovered logs are retained; harness failures (scoped Jest whitelist, Markdown generic parsed as HTML, offline cache miss and example inherited Jest types) were corrected and rerun. Optional fsevents install approval/deprecation and native toolchain warnings remain explicit. No blind audit fix, dependency upgrade or speculative animation rewrite.

## Local validation results

| Check                                                                                                                             | Result                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Library clean npm ci; types/lint/format/tests/Bob build/pack dry-run/actual pack/package inspection                               | Passed; 153 tests/6 suites, lint 0 warnings.                                              |
| Showcase clean npm ci; vendor integrity/types/lint/format/tests                                                                   | Passed; 10 tests/5 suites, lint 0 warnings.                                               |
| Docs clean install/types/Markdown lint/inventory-link-release tests/VitePress production                                          | Passed; 3 tests.                                                                          |
| Landing clean install/types/lint/format/Next production and built HTML                                                            | Passed; 1 test; local 375/1440 CSS viewport checks no horizontal overflow/broken anchors. |
| Generated shell own typecheck                                                                                                     | Passed; no false component/native claim.                                                  |
| Independent consumer exact final archive, normal locked install, public/private type contracts, Android and iOS Simulator Release | Passed; actual render/interaction/host scope recorded.                                    |
| Showcase Android and owner-signed physical iPhone Release                                                                         | Passed; recovered watcher failures explicitly retained.                                   |
| Hosted CI, VoiceOver/TalkBack                                                                                                     | Not Executed / Not Tested, not passed.                                                    |

## State and stop boundary

See [release checklist](release-checklist.md) for Gates A/B/C. Local automated quality passes; real physical touch/motion/text scope passes on one phone each, full device/readers gate partial. Critical reader completion/focus/speech blocks public release. High documentation dev-server advisories remain unresolved but are not native npm runtime dependencies; stable supported upgrade path absent in queried metadata. Owner approved identity/MIT/Issues plan, not exact artifact publication. No npm publish (including dry-run), GitHub repository/release/tag, commit/push/deploy/store action. Stop after Iteration 7.

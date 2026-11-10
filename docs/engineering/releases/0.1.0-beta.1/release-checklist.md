> Historical Iteration 7 decision. The maintainer superseded its automatic reader-only beta blocker in Iteration 7.1; see the [current report](../iteration-7.1/final-report.md). Original measurements and artifact hashes below remain historical.

# Release checklist

Target 0.1.0-beta.1. This checklist is evidence-based, not publication authorization.

## Gate A — Automated quality

- [x] Clean lock installs; library strict types/lint/format, 153 tests/6 suites, Bob build, reviewed pack dry-run/actual pack and contents/export verification.
- [x] Self-contained showcase lock/vendor/runtime integrity, types/lint/format, 10 tests/5 suites.
- [x] Docs types/lint, 3 inventory/link/release tests and production build; landing types/lint/format/build and 1 built-HTML branding/catalog test.
- [x] Own generated-shell config/typecheck; independent consumer actual public/negative type contracts.
- [x] Final candidate deterministic archive, no accidental dev/native/secret/local-path payload; four Git roots/staged/remotes checked.
- [x] CI workflows statically reviewed/pinned/least privilege; hosted execution explicitly Not Executed.

## Gate B — Native / consumer / physical

- [x] Real packed install in clean independent Community CLI app outside repositories; Android/iOS Simulator Release compilation/runtime within recorded scope.
- [x] Showcase Android Release and owner-signed physical iPhone Release builds/install/launch; recovered Watchman environment fault, final builds rechecked.
- [x] Both physical devices: six guided real-touch scenarios confirmed by owner, including iOS real swipe/sheet pans; motion/larger text confirmed and restored.
- [x] Reproduced Android arrow defect fixed and physically rechecked; input/cleanup fixes and prior regressions retained.
- [x] Bounded six-scenario Release window capture, disclosed noisy repeat and memory snapshot; no FPS/latency attribution.
- [ ] Critical TalkBack/VoiceOver completion, focus/restore/order and spoken status: Not Tested, owner deferred. **Blocks public release.**
- [ ] Remaining broad device/multitouch/RTL/font/advanced keyboard/navigation/endurance/trace gates: explicit beta limitations or further required checks, never silently Passed.

## Gate C — Governance

- [x] Owner changed identifier to @manueldev25/react-native-reusable-interactions; authenticated personal scope verified, exact registry 404 and GitHub name search recorded, no legal clearance claim.
- [x] 0.1.0-beta.1 exact prerelease version, intended beta tag/public access, no latest promotion. All private repository manifest/lock roots aligned.
- [x] Owner explicitly retained existing MIT license and selected repository Issues for reports, with private follow-up for sensitive details; no contact URL invented.
- [x] Community contribution/proposal/RFC/acceptance/maturity/review, Code of Conduct/Security and release notes/known issues/runbook prepared.
- [ ] Owner-approved actual public repository/Issues location and hosted CI; only future separately authorized setup.
- [ ] Explicit owner approval of the exact candidate and release gates before any publication. No request to publish is implied by license/channel confirmation.

Implementation Complete: **Passed** within supported scope. Physical Device Validated: **Partial**, real touch/motion/text passed on both; critical readers pending. Release Ready: **No — NOT READY, BLOCKERS REMAIN**. No npm publish/dry-run publish, remote/tag/release/deploy/store operation performed. Stop after Iteration 7.

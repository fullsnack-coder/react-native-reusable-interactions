# Experiments

No benchmark or spring comparison experiment was performed. Defaults are engineering choices pending device evaluation, not measured winners.

Actual validation: Jest exercised 0, 1, 3, 5 and 10 cards, selection requests, expansion callbacks, duplicate prevention, controlled ownership and removal/reordering. All ten library tests (including Iteration 1) passed. Mocked animation does not establish native smoothness.

## Iteration 2.1 actual investigations

- Compared full and compressed Android UIAutomator trees. Hypothesis of collapsed accessibility leakage was rejected: default dumps include non-important views; filtered dumps show only the primary card. A temporary defensive patch was reverted.
- Investigated stale local-package Release code using Hermes sourcemap sourcesContent and APK asset comparison. Forced the bundle task and documented the artifact replacement procedure.
- Captured two 20-cycle Android Release gfxinfo samples; the first overlapped host builds, the second followed completed builds. Results and confounders are in [performance report](performance-report.md).
- Full device matrix, procedures and limitations: [Iteration 2.1 validation](validation-iteration-2.1.md).

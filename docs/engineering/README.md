# Engineering Journal

This journal records how the Android and iOS React Native library is designed, built, tested, and revised. It is part of the library repository, alongside the code it explains. The [architecture decisions](decisions/) below describe the Iteration 0 foundation; component records start only when component work begins.

Raw evidence directories are retained locally and excluded from the public repository because they can contain device or environment information. References to files under `evidence/` identify local records and are not public links. The written validation results remain available here.

## Where records go

- `decisions/`: numbered architecture decision records (ADRs). Copy [the ADR template](decisions/_template.md) for a new decision. Link superseding decisions instead of rewriting prior records.
- `experiments/`: dated, reproducible investigations. Copy [the experiment template](experiments/_template.md). A failed experiment is still a useful record.
- `components/<component-name>/`: copy the five files in [`components/_template/`](components/_template/) when a component is proposed. Keep the proposal, implementation history, experiments, performance report, and lessons together.

## Recorded investigation

- [Metro connectivity and Fast Refresh on iOS Simulator](experiments/2026-11-08-metro-fast-refresh.md) (Iteration 0.1).

## Release hardening

- [0.1.0-beta.1 release audit](releases/0.1.0-beta.1/release-audit.md), [checklist](releases/0.1.0-beta.1/release-checklist.md) and [full final report](releases/0.1.0-beta.1/final-report.md): scoped package/consumer/CI/community audit, real owner-guided physical results and deferred reader gates.

## Component validation

- [InteractivePurchaseSheet — Iteration 6](components/interactive-purchase-sheet/validation.md): controlled root-host sheet, handle-only pan/scroll contract, real keyboard defects and bounded native validation. ADR 0009 supersedes the Modal presentation in ADR 0008.

- [HoldToConfirm — Iteration 5](components/hold-to-confirm/validation.md): native timed recognition, interruption/operation guards, actual Android/iOS holds and Release measurements.

- [Cumulative release validation matrix](release-validation-matrix.md): current readiness policy and outstanding gates across all six components.
- [AnimatedBalance — Iteration 4](components/animated-balance/validation.md): exact decimal presentation, native rendering fixes, layout checks and measured Android Release workload.

- [SwipeToPay — Iteration 3](components/swipe-to-pay/validation.md): controlled confirmation, native validation matrix, Release evidence and remaining checks.
- [SwipeToPay — Iteration 3.1](components/swipe-to-pay/validation-iteration-3.1.md): Android RTL/orientation and interruption follow-up, iOS lifecycle, repeat Release sample and unresolved touch/screen-reader gates.

## Recording rules

1. Write a proposal before implementing a component. State the user need, Android and iOS behavior, proposed typed API, accessibility, reduced motion, technical alternatives, and open questions.
2. Update the implementation journal as work occurs. Record dates, changes, validation, failures, and links to code or evidence. Enter development time only when it was actually measured; state the measurement method and scope.
3. Record experiments with a hypothesis, setup, variables, observations, raw evidence location, conclusion, and limitations. Mark unrun plans as **planned**.
4. Report performance only from measurements. Include device, OS, build type, sample size, capture method, raw data, and interpretation. Use **not measured** for missing results. Never infer a frame-rate claim from an animation's target refresh rate.
5. Close a component iteration with lessons learned and follow-up work. Distinguish observed facts from interpretation.
6. Create or update an ADR when a cross-component architectural decision changes. Documentation should match the public package API and the actual native code.

The templates are prompts, not evidence. Do not invent past meetings, experiments, benchmarks, dates of work, or time spent. Existing ADRs are retrospective records of configuration and requirements established in Iteration 0; they do not assert that a separate decision review occurred.

[Iteration 7.1 — landing, security and communications](releases/iteration-7.1/final-report.md) records the current beta policy and supersedes the historical reader-only blocker without changing test results.

[Iteration 7.2 — npm beta publication and documentation sync](releases/iteration-7.2/publication-report.md) records the verified immutable release, public consumer, current docs and remaining npm tag-management incident.

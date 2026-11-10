# Contributing to React Native Reusable Interactions

Use Node 24 (validated 24.21.0) and npm. Android/iOS Community CLI, Hermes and New Architecture are the supported context. No Expo, React Native Web, backend/payment SDK or monorepo migration.

Start with a bug report or [component proposal](docs/contributing/component-proposal.md). State use cases, why existing interactions do not cover them, typed API, controlled ownership, gestures/cancellation, scroll arbitration, accessibility alternatives, supported platforms and risks. Larger API/architecture changes use the [RFC](docs/contributing/rfc.md). The initial maintainer is the project owner; no committee or additional maintainers are appointed.

Run npm ci, npm run typecheck, npm run lint, npm run format:check, npm test, npm run build and npm run package:verify. Do not commit generated lib, dependency directories, native binaries, credentials or personal device logs. npm pack builds a local artifact through the reviewed prepack hook; it does not publish.

Before component implementation copy the five Engineering Journal templates in docs/engineering/components/_template/. Maintain the proposal, implementation history, real experiments/failures, performance report and lessons. Record actual commands/device/OS/build and measured time only when measured. Mark missing work Not Tested/not measured. New architecture decisions require ADRs; supersede existing records instead of rewriting history. Match public docs and native evidence to the actual API.

Tests must cover meaningful state transitions, controlled updates, cancellation, duplicates, reset, unmount and accessible alternatives. Mocked gestures do not prove native gesture behavior. Add regression tests for reproduced defects; preserve old APIs unless an explicitly reviewed migration is necessary. Provide Android/iOS native evidence and document unavailable hardware honestly. Never fabricate benchmarks or screen-reader validation.

Review [acceptance criteria](docs/contributing/acceptance-criteria.md) and [maintainer guidance](docs/contributing/maintainer-review.md). Existing six components are Beta candidates, not Stable. Maturity is separate from the package version. Submit a focused change with test results, journal/docs updates and unresolved limitations. No automatic publication.

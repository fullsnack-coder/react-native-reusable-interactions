# Agent instructions

## Responsibility and architecture

Own the reusable React Native package and its generated development example. Keep the public root entry point minimal. Each future component must be independently configurable, interruptible, accessible, and free of business coupling. Preserve Android and iOS support under the New Architecture. Keep Reanimated, Worklets, and Gesture Handler as peer dependencies.

## Skills

Use `vercel-react-native-skills` first for native architecture, rendering, gestures, and animation. Its Expo and monorepo rules do not apply here. Use `ui-ux-pro-max` only when visual or interaction design decisions are needed; do not apply web-only guidance to native components.

## Checks

Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, and `npm run pack:check`. Validate native behavior in the separate example app when a component exists.

## Engineering Journal requirement

Maintain `docs/engineering/` in every future Codex iteration that changes library behavior or architecture. Before implementing a component, create its design proposal from `components/_template/`; update its implementation journal while work happens; record actual experiments, failures, validation, measured development time when available, performance evidence, and lessons learned. Create or supersede an ADR for cross-component architectural decisions. Mark unrun work as planned and missing measurements as not measured. Never invent timestamps, benchmarks, experiments, or historical events. Keep journal claims aligned with code and commands actually run.

## Conventions and validation

- Use strict TypeScript, npm, and this repository's own lockfile and scripts.
- Keep changes small and public contracts typed. Add meaningful tests for behavior and integration points.
- Measure performance on release builds before making frame-rate or latency claims.
- Support screen readers, reduced motion, adequate touch targets, and platform conventions.
- Explicit project requirements take precedence over advisory skill recommendations.

## Forbidden

- Do not add Expo, Expo Router, Expo build services, monorepo tooling, cross-repository workspaces, fabricated component APIs, payment flows, or mock banking functionality.
- Do not add a navigation, state, or design-system dependency without a component-level reason.

## Iteration readiness and validation policy

Distinguish between:

1. Implementation readiness.
2. Native runtime validation.
3. Release readiness.

A microinteraction may be considered implementation-complete when its public API, functionality, automated tests, documentation, and available native checks pass without known blocking defects.

Unavailable hardware, inaccessible screen-reader tooling, or unsupported simulator automation must be documented as validation limitations rather than automatically treated as implementation failures.

Do not repeatedly attempt validation using a mechanism already demonstrated to be unreliable unless a meaningful alternative is available.

Maintain a cumulative release validation matrix covering all implemented microinteractions.

Do not declare a component production-validated or release-ready while critical native interactions, accessibility requirements, or platform compatibility remain unverified.

Future iterations may proceed with documented non-blocking limitations, provided no reproducible critical defect remains.

Preserve all outstanding validation requirements for the release-hardening phase.

## Beta release hardening records

Keep Implementation Complete, Physical Device Validated and Release Ready distinct. Record tool-observed versus owner-confirmed physical results and deferred VoiceOver/TalkBack checks. Preserve the release journal and cumulative matrix; no reader pass follows from semantics/unit tests. Current owner-selected identity/version live in package metadata and release notes. Replacing an unpublished same-version tarball requires an explicit install and artifact/runtime integrity check. Future public release requires owner approval of exact artifact/license/contact/gates; no automatic publication, tags or deployment.

## Iteration 7.1 beta policy override

Deferred by maintainer for beta — manual screen-reader validation pending. This maintainer decision supersedes the earlier automatic reader-evidence blocker for this beta only. Do not mark deferred checks Passed, infer full compliance, delete coverage, or confuse unverified behavior with known defects. Known critical usability defects must still be fixed. Keep later reader hardening objectives and require separate authorization for publication, deployment, repositories and posts.

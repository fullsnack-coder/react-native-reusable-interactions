# ADR-0003: Minimal public package API and peer dependencies

- Status: Accepted (retrospectively recorded from Iteration 0 requirements and package configuration)
- Recorded: 2026-11-08
- Supersedes: None
- Scope: Library and showcase integration

## Context

The library must be reusable across applications without requiring navigation, state management, or a design system. It has no components in Iteration 0. The showcase is a separate consumer.

## Decision

Expose only the package root until real components exist. Publish built JavaScript and TypeScript declarations through package exports. Keep React, React Native, Reanimated, Worklets, and Gesture Handler as peer dependencies; retain matching development dependencies for local builds. Future showcase integration must use a packed package artifact and public exports.

## Alternatives

Direct source imports and hardcoded local paths for the showcase were rejected by the project brief. No component API alternatives have been evaluated yet.

## Consequences

Consumers supply compatible native dependencies. Package peer ranges require deliberate review when React Native support expands. No nonexistent component API is promised.

## Verification

`npm run build`, `npm run pack:check`, TypeScript, lint, and the current public-entry test passed in Iteration 0. A showcase package-consumer test awaits the first component.

# ADR-0002: Android and iOS Community CLI baseline

- Status: Accepted (retrospectively recorded from Iteration 0 requirements and configuration)
- Recorded: 2026-11-08
- Supersedes: None
- Scope: Library example and showcase

## Context

The project brief requires React Native Community CLI, Android and iOS, Hermes, and the supported New Architecture. React Native 0.88.1 is used in both native apps. The library targets Android and iOS only; React Native Web is outside its support scope.

## Decision

Use Community CLI native projects with the New Architecture and Hermes enabled. Maintain Android and iOS configuration and test both platforms. Do not add Expo, Expo Router, Expo build services, or a React Native Web target.

## Alternatives

Expo and web-specific native adaptations were excluded by the project requirements. No platform benchmark was performed.

## Consequences

The project owns Android and iOS toolchain setup and native build validation. A generic iOS Simulator build and Android debug build do not replace runtime or release-build testing.

## Verification

Both native apps report only `android` and `ios` from `react-native config`; Android properties enable `newArchEnabled` and `hermesEnabled`. Debug Android and unsigned iOS Simulator builds passed in Iteration 0. Device-level behavior remains to be tested as components are implemented.

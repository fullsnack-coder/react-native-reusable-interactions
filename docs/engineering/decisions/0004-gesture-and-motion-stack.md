# ADR-0004: Gesture and animation dependency baseline

- Status: Accepted (retrospectively recorded from Iteration 0 requirements and native configuration)
- Recorded: 2026-11-08
- Supersedes: None
- Scope: Android and iOS native apps

## Context

The project requires interruptible, gesture-driven interactions. The selected baseline is React Native 0.88.1, Reanimated 4.7.1, Worklets 0.13.1, and Gesture Handler 3.4.0. The [Reanimated compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/) and [Gesture Handler compatibility table](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/getting-started/) list this combination as supported.

## Decision

Use Gesture Handler for native gestures and Reanimated with Worklets for future UI-thread animation work. Put `react-native-worklets/plugin` last in app Babel configuration and wrap app content in `GestureHandlerRootView`. Keep version upgrades coherent across native apps and library peers.

## Alternatives

No animation implementation or comparative experiment has been performed. Alternative libraries and animation designs remain unassessed for individual components.

## Consequences

Native rebuilds are required after dependency changes. Future components must handle interruption, reduced motion, accessibility alternatives, and release-build performance measurement. Do not claim a frame rate from configuration alone.

## Verification

The native apps expose the expected modules through Community CLI autolinking. Android and iOS debug builds passed in Iteration 0. Gesture behavior is untested because no microinteraction exists yet.

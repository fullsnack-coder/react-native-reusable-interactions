# Jest setup for the first component

- Date: 2026-11-08
- Status: Completed
- Hypothesis: The installed native animation and gesture packages can be exercised in Jest with their documented test resolver and mocks.

## Procedure and environment

On Node 24.21.0, Jest 29, React Native 0.88.1, Reanimated 4.7.1, Worklets 0.13.1, and Gesture Handler 3.4.0, ran `npm test -- --watch=false` in `microinteractions-native` after adding the component tests. Adjusted the test configuration in response to each actual failure. Re-ran the same command after the final setup.

## Observations

1. Jest could not parse Gesture Handler's ESM entry until it was included in `transformIgnorePatterns` and its `jestSetup.js` was loaded.
2. Jest then could not parse Reanimated's ESM entry. Reanimated's Jest resolver and `setUpTests()` allowed the test implementation to load.
3. Gesture Handler 3 scheduled a UI runtime binding that called Worklets' unsupported web `getUIRuntimeHolder`. Mocking `react-native-worklets` before the Gesture Handler setup removed that error.
4. Reanimated's Jest web implementation required a dependency array on `useAnimatedStyle`. The production component now supplies one.
5. Gesture Handler required the test tree to include `GestureHandlerRootView`.
6. Final result: three library component behavior tests passed. The separate showcase test passed after using the same resolver and Worklets mock.

## Decision and limits

Retain the documented test configuration. These tests verify state requests, callback semantics, accessibility props, and package integration. They do not prove native spring smoothness, frame timing, or screen reader focus behavior. The observed errors were test environment integration issues, not evidence of an Android or iOS runtime failure.

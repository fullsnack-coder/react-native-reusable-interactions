# Lessons learned

Stable keys and explicit request callbacks fit the existing package and test infrastructure without a shared animation framework. Common expansion and selection values keep geometry coordinated. Clamp selection interpolation after collection shrinkage. Uniform height avoids measuring hidden content, at the cost of requiring consumers to size for dynamic text.

The docs props table needed code formatting to avoid Vue parsing type syntax. Jest tests validate request semantics, not frame timing or native focus. Native screen readers, reduced motion, large text and Release profiling remain explicit validation work. Swipe is deferred; native accessible buttons support the complete selection flow. No performance measurements were made.

Android runtime confirmed expansion, parent scrolling, selection of Reserve and automatic collapse with correct selected-card layering. Both native Debug builds succeeded. Replacing package artifacts during Metro hot reload can produce transient undefined exports; validate a fresh launch after replacement.

## Iteration 2.1 observations

Use the accessibility-filtered hierarchy when assessing screen-reader exposure; a full view dump can create false positives. Verify local tarball contents in generated Release sourcemaps: Gradle may reuse an old node_modules bundle. Simulator name lookup failed while attaching via Simulator.app's full Xcode path worked. Actual iOS selection and collection changes now pass. Android window-level timings are available, with 2.93% janky frames in the warm sample; device profiling and screen-reader speech/focus remain open. Do not infer production FPS or gesture latency from these counters.

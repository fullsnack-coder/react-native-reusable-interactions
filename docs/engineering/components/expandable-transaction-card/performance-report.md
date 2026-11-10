# ExpandableTransactionCard performance report

- Status: **not measured**
- Code revision: Iteration 1 local working tree, no commit
- Measurement date: **not measured**

## Reproducible procedure

1. Build the independent showcase with the packed library artifact in a Release configuration on an iPhone and a representative lower-end Android device. Record exact hardware, OS, refresh rate, build identifiers, package archive hash, and thermal state.
2. Render one card in a scrolling screen with a multiline compact region and a detail tree containing interactive controls. Also test several cards in a list. Warm the app before capture.
3. Capture at least 20 expansion and collapse cycles, including rapid reversals and a detail-height change, using Instruments Core Animation on iOS and Android Studio System Trace/Perfetto on Android. Record frame times, dropped frames, JS and UI thread activity, and method of capture. Save raw traces outside the Git repository and link them here.
4. Compare steady collapsed/expanded rendering and animation intervals. Repeat with system Reduce Motion enabled. Document sample size and variability, not only a single average.

## Results

| Platform and device | Scenario | Metric | Runs | Result | Raw evidence |
| --- | --- | --- | --- | --- | --- |
| Not measured | Not measured | Frame time, dropped frames, memory, latency | 0 | **not measured** | None |

## Interpretation and limits

The component animates height to reflow following content, which may trigger layout work. It does not update React state every animation frame. Debug builds and screenshots cannot establish production frame rate or latency. No performance target or comparison is claimed until the procedure above is run on Release builds.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

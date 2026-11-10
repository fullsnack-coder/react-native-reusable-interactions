# CardStackSelector performance report

## Iteration 2.1 — Android Release capture, 2026-11-08

Device: Medium_Phone_API_36.1 Android emulator, Android 16, arm64, 1080×2400, reported display renderFrameRate 60.000004 Hz. React Native 0.88.1, Reanimated 4.7.1, Hermes/New Architecture. Build: Gradle assembleRelease, debug keystore signing from existing configuration, arm64-v8a final APK. SHA-256: 6d7cb3c39814a62313534129f6bc7c46fd5c52bde33a170fb1793b7b42d858c0.

Scenario: three styled cards in the showcase ScrollView, collapsed selector scrolled into view. Warmed with an initial 20-cycle sample. Reset `adb shell dumpsys gfxinfo com.microinteractions.showcase reset`, then sent 20 pairs of native taps to the expansion control at (400,1380), waiting 0.5 seconds after each tap. Captured `adb shell dumpsys gfxinfo com.microinteractions.showcase framestats`. No deliberate builds ran during the final sample. The first exploratory capture overlapped host builds and is kept only to document that confounder.

| Capture                      | Frames rendered | Janky frames (current metric) |   p50 |   p90 |   p95 |   p99 |
| ---------------------------- | --------------: | ----------------------------: | ----: | ----: | ----: | ----: |
| Exploratory, host build load |            1182 |                    47 (3.98%) | 16 ms | 17 ms | 20 ms | 32 ms |
| Warm final sample            |            1196 |                    35 (2.93%) | 16 ms | 16 ms | 17 ms | 17 ms |

Final sample also reported 35 frame deadline misses, 1 missed vsync, 6 slow UI-thread frames and 29 slow draw-command frames. These Android window counters are not a direct attribution to the selector or a measurement of gesture latency. Do not interpret the high-input-latency counter as a measured tap latency.

Raw evidence: [final gfxinfo](evidence/android-release-gfxinfo-final.txt), [confounded exploratory gfxinfo](evidence/android-release-gfxinfo-build-load.txt). Framework timings show some missed deadlines on this emulator. This is not a physical-device benchmark, a proof of a target FPS, or a before/after optimization comparison. GPU emulation, host scheduling, other application content and system overhead are confounders. Profile representative physical devices before release performance claims.

## Architecture and unmeasured metrics

Card transforms derive from common shared progress; React does not receive per-frame state updates in the implementation. Height animation performs sibling layout work. Native React render counts, JS-thread trace attribution, memory, gesture latency, iOS frame timing and physical-device data are **not measured**. Functional interruption tests do not substitute for those measurements.

For a production follow-up, capture Instruments Core Animation on iOS and Perfetto/System Trace on lower-end Android hardware for expansion, selection, rapid reversals, collection changes and 3/5/10-card scenarios. Save raw traces and compare distributions against the same device/build/scenario baseline.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

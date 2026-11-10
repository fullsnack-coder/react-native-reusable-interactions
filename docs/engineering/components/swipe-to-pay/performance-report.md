# SwipeToPay performance report

## Android Release sample — 2026-11-08

Device: Medium_Phone_API_36.1 emulator (`emulator-5554`), Android 16 API 36.1, arm64, 1080×2400, reported display refresh 60.000004 Hz. RN 0.88.1, Hermes/New Architecture, Reanimated 4.7.1, Worklets 0.13.1, Gesture Handler 3.4.0. Build: standalone showcase Release, arm64-v8a, existing debug-keystore signing, nondebuggable. No dependency upgrades. APK SHA-256: `6616834364bfcc09396f208f415fdb59168018f3c8796e44c1b5d59421e32054`.

Forced `:app:createBundleReleaseJsAndAssets --rerun-tasks` after tarball installation, assembled Release, verified final release-event logic and labelAnimation in the sourcemap, installed APK. Warmed the control with a partial return and successful confirmation/reset. No deliberate builds or test suites ran during the capture.

Reset `adb shell dumpsys gfxinfo com.microinteractions.showcase reset`. Ran 10 partial drags (450 ms injection, 450 ms wait), 5 confirmation drags (650 ms injection), each followed by another 150 ms drag while processing, a 1.4-second wait, reset and 550 ms wait. Captured `framestats` immediately afterward. Measured workload wall time with Python monotonic: **23.974331625 seconds**. Initial counter 1 from warmup; final counter 6 and idle. Exactly five accepted operations; ten partial returns and five additional pending-operation drags did not add operations. Input durations are requested injection durations, not measured gesture latency.

| Frames rendered | Janky frames (current) |   p50 |   p90 |   p95 |   p99 |
| --------------: | ---------------------: | ----: | ----: | ----: | ----: |
|            1024 |             31 (3.03%) | 16 ms | 17 ms | 19 ms | 22 ms |

Also reported: 31 frame deadline misses, 0 missed vsync, 1 slow UI-thread frame and 26 slow draw-command frames. Legacy jank counter: 58 (5.66%); use the current metric above consistently. The high-input-latency counter is not interpreted as a latency measurement.

Evidence: [raw gfxinfo](evidence/android-release-gfxinfo.txt), [workload metadata](evidence/android-release-workload.json), [reproduction script](evidence/profile-android.py), [final hierarchy](evidence/android-release-after-profile.xml). Script assumes the documented full-width portrait bounds and a warmed/reset demo; it is not a general UI test runner.

## Interpretation and limits

Some frame deadlines were missed on this emulator. These are Android window counters, including other showcase content, GPU emulation and host scheduling. No direct comparison with the selector's different workload, no before/after optimization comparison, no physical-device benchmark, no target-FPS or finger-latency claim. No per-component cause was established; a rewrite based only on these counters is not justified. Follow up with Perfetto/System Trace on representative Android hardware and Instruments on iOS.

Handle position, instruction opacity and progress use shared values and animated transforms. JS is scheduled on acceptance, not on each update. React state tracks layout and discrete confirmation; the consumer owns result state. Processing uses static text. Code inspection supports this architecture; native React render counts, memory, JS/UI trace attribution, finger latency, iOS timings and physical-device profiling are **not measured**. Development time: **not measured**.

## Iteration 3.1 — repeat Release sample

Same emulator, OS, nondebuggable Release APK hash and workload as above; no production code changed. Rebuilt Release successfully and verified the APK hash remained identical. Restarted the app, warmed with partial/success/reset, then repeated the ten partial pans and five confirmation/pending-attempt/result/reset cycles with no deliberate build/test load.

Measured workload duration **24.072089792 seconds**. Final status idle/count 6, starting after warmup count 1: exactly five additional confirmations. gfxinfo: **1019 frames**, **27 janky (2.65%)**, p50/p90/p95/p99 **16/17/18/22 ms**. Also 27 deadline misses, 0 missed vsync, 6 slow UI-thread frames and 14 slow draw-command frames; legacy jank 30 (2.94%). [Raw capture](evidence/iteration-3.1/android-release-gfxinfo.txt), [metadata](evidence/iteration-3.1/android-release-workload.json), [repeat script](evidence/iteration-3.1/profile-android.py), [final hierarchy](evidence/iteration-3.1/android-release-after-profile.xml).

The repeat does not show a new window-level slowdown requiring an animation rewrite. It is one additional emulator sample, not a statistically established improvement over the earlier 3.03% sample: the component/APK is unchanged. Existing attribution, physical-device, render-count, latency and iOS timing limitations still apply. No FPS or per-component profiling claim is made.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

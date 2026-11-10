# AnimatedBalance performance report

Recorded 2026-11-09. Android Release measured; iOS visual recording only. Development time not measured.

## Environment and procedure

Medium_Phone_API_36.1 Android emulator, model sdk_gphone64_arm64, Android 16 / SDK 36, arm64, 1080×2400 portrait. Standalone showcase Release, nondebuggable, existing signing configuration, Hermes/New Architecture. RN 0.88.1, Reanimated 4.7.1, Worklets 0.13.1, Gesture Handler 3.4.0; no upgrades. APK SHA-256 `d6daea6543bcd852e9b13f5866d4d3fdb8d98145af19a5c52a15a1193450c02b`. Forced fresh JS bundle and verified the model/strip-height fixes in generated source-map content before runtime validation.

Full-width default-font LTR demo; font_scale=1.0, user_rotation=0, transition_animation_scale=1.0, accessibility_enabled=0. Three warmup bursts, then reset gfxinfo. Injected 30 presses at the freshly measured Rapid updates button (794,1495), waiting 950 ms after each command. Each press requests four snapshots at 0/100/200/300 ms: 1200.00 → 1350.25 → 1100.10 → 1875.75, default 450-ms transitions. Thus **120 requested snapshots**, with interruptions. Actual React commit/render count is **not measured**. Six digit columns in this workload; maximum supported 21-column case was visually/semantically checked but not profiled as a sustained animation workload.

Monotonic workload duration **30.128325458 seconds**, including input-command overhead and waits. Captured adb dumpsys gfxinfo framestats immediately after the workload; final native accessible amount verified as S/ 1,875.75. No deliberate builds, test suites or video decoding ran during the sample. Other emulator/host scheduling remains a confounder.

| Rendered frames | Janky frames (current metric) |   p50 |   p90 |   p95 |   p99 |
| --------------: | ----------------------------: | ----: | ----: | ----: | ----: |
|            1409 |                    32 (2.27%) | 16 ms | 17 ms | 17 ms | 17 ms |

Also reported: 32 frame deadline misses, 1 missed vsync, 0 slow UI-thread frames, 1 slow bitmap upload and 22 slow draw-command frames. Legacy jank: 1 (0.07%). The high-input-latency counter is not interpreted as measured latency.

Evidence: [raw gfxinfo](evidence/android-release-gfxinfo.txt), [metadata](evidence/android-release-workload.json), [reproduction script](evidence/profile-android.py), [final hierarchy](evidence/android-profile-final.xml). The helper requires the standalone demo already open, default font/portrait and measured button bounds; it establishes width explicitly before capture.

## Interpretation and limits

These are Android window counters, not per-component costs or a measured FPS. Some deadlines were missed. No direct comparison with previous components' different workloads and no optimization/improvement claim. Native JS/UI trace attribution, React render counts, heap/memory stability, input latency, iOS frame timings and physical-device profiling remain **not measured**. Zero slow-UI-thread counts do not prove zero component UI work.

One shared cyclic offset and one transform per digit; fixed repeated Text strip, bounded columns/history. Formatting and React update only on snapshots/configuration, not animation frames. Measurements/glyph layout and discrete insertion/removal are separate from rolling. These are code-level properties, not native render-count or heap measurements.

## iOS visual recording

[Authentic rapid-update recording](evidence/ios-rapid-updates.mov), 20.9116667 seconds total including idle time. Sampled images requested at 0.1-second intervals via AVFoundation with ±50-ms tolerance; sample positions are not frame-time measurements. Reviewed [before](evidence/ios-rapid-0000.png), [interrupted motion](evidence/ios-rapid-0092.png), [retargeted motion](evidence/ios-rapid-0094.png), [approaching target](evidence/ios-rapid-0096.png) and [settled](evidence/ios-rapid-0099.png). They show vertical glyph movement, static locale tokens and the final latest amount. Source snapshot captions change independently from the visual intermediate glyphs, as intended. This sampled review does not establish absence of every flicker or production smoothness. Exact presentation timestamps were not recorded. [Extraction helper](evidence/extract-ios-frames.swift); the initial sandboxed zero-tolerance attempt returned no frames, corrected by valid tolerance and decoder access without installing packages.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

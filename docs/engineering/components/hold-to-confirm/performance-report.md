# HoldToConfirm performance report

Recorded 2026-11-09. Android standalone Release measured; iOS Debug visual samples. Development time not measured.

## Environment and reproducible procedure

Medium_Phone_API_36.1 emulator, sdk_gphone64_arm64, Android 16 / SDK 36, arm64, 1080×2400 portrait. Hermes/New Architecture; RN 0.88.1, Reanimated 4.7.1, Worklets 0.13.1, RNGH 3.4.0, no upgrades. Nondebuggable Release, existing signing. APK SHA-256 `800fe09414a51e02bd3e15456a30fa22261bf6a59de8bac1cae7ddfbe1f114be`. Fresh JS bundle forced before install; final package audit checks profiled compiled code against installed/tarball code.

Font scale 1.0, rotation 0, transition animation scale 1.0, accessibility_enabled=0. Demo in its existing vertical ScrollView, native hold coordinates (540,1299), reset (200,1727). Configured duration 1200 ms. Three warmup complete holds. Reset gfxinfo, then 20 actual adb touch holds alternating 1500 ms (complete) and 600 ms (cancel), wait 250 ms, reset interaction, wait 150 ms. Ten valid confirmations and ten cancellations; owner reset invalidates the simulated pending operation after each attempt. Verified confirmation counter increased from 7 to 17 and ended idle.

Monotonic workload duration **30.950716917 seconds**, including adb overhead/waits. Captured dumpsys gfxinfo framestats immediately afterward. No deliberate tests, builds or video extraction ran during this capture; emulator/host scheduling still affects results. [Reproduction script](evidence/profile-android.py), [metadata](evidence/android-release-workload.json), [raw counters and framestats](evidence/android-release-gfxinfo.txt), [final hierarchy](evidence/android-profile-final.xml).

| Rendered frames | Janky frames (current metric) |   p50 |   p90 |   p95 |   p99 |
| --------------: | ----------------------------: | ----: | ----: | ----: | ----: |
|            1211 |                    33 (2.73%) | 11 ms | 16 ms | 25 ms | 31 ms |

Also reported: 33 frame deadline misses, 14 slow UI-thread frames, 16 slow issue-draw-command frames, 0 missed vsync and 0 slow bitmap uploads. Legacy jank is 78 (6.44%); this is a different metric. Histogram includes two frames in the 121-ms bucket. These misses are retained, not hidden by an average. The high-input-latency counter is not a measured gesture latency.

## Findings and limits

This capture shows missed deadlines in the **whole Android window**, including gesture input, React label/status updates and demo resets. It does not attribute stalls to HoldToConfirm. No comparable before/after workload was measured, so this is not proof of a regression or improvement versus prior components. No speculative animation rewrite was made. Trace-based UI/JS/GPU attribution, per-component costs, actual React render counts, memory/heap growth, maximum-duration endurance, physical devices and iOS Release timings remain **not measured**. No FPS or touch-latency claim.

Code inspection: one time-driven shared value and transform-only fill, no per-frame React state/JS callbacks or formatting. Begin/cancel/confirm/status/layout events can render React. Native timing is authoritative; visual completion never dispatches confirmation. These properties do not constitute a measured render-count or heap profile.

## iOS visual evidence

Actual iPhone 17 Pro Simulator / iOS 26.2 Debug coordinate hold recording, **39.775 seconds total including idle and later hide action**: [video](evidence/ios-hold.mov). AVFoundation extracted requested 0.1-second sample positions with ±50-ms tolerance. Reviewed [idle](evidence/ios-hold-0000.png), [partial fill](evidence/ios-hold-0118.png), [later fill](evidence/ios-hold-0123.png), [near completion](evidence/ios-hold-0126.png), and [processing after native activation](evidence/ios-hold-0130.png). These show increasing fill under Keep holding, followed by one accepted confirmation and processing. The text does not scale with fill.

Some decoded samples contain missing glyph patches elsewhere in the screen as well as the control; their origin was not isolated between recording/decoding/compositor. Clean still screenshots and adjacent samples do not establish a component rendering defect or prove every frame is intact. Keep this capture limitation explicit. No exact contact timestamps, frame pacing, FPS or latency were measured from the video. [Extraction helper](evidence/extract-ios-frames.swift); initial sample-inspection helper used an unsupported bitmap initializer and was corrected to load image Data. This was an evidence-tool error, not a runtime defect.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

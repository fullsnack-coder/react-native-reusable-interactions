# InteractivePurchaseSheet performance report

Recorded 2026-11-09. Final **root-host Android Release** measured; superseded Modal prototype is not the profiled implementation. Development time not measured.

## Environment and procedure

Medium_Phone_API_36.1 emulator, sdk_gphone64_arm64, Android 16 / SDK 36, arm64, 1080×2400 portrait. Nondebuggable Release, Hermes/New Architecture, RN 0.88.1 / React 19.3 / Reanimated 4.7.1 / Worklets 0.13.1 / RNGH 3.4.0. APK SHA-256 `2db99411387f45cf4a5306ac62be5ae1b4489fc7d008582ea971c6c967eda8c3`. Final package audit checks local build, tarball, installed package and embedded Release source map match.

Font scale1.0, rotation0, transition animation scale1.0, accessibility_enabled0. Fictional demo, standard [.42,.75,.95] points. Three real warmup pans (1→2→3→2), then reset dumpsys gfxinfo. Ten actual handle cycles 2→3→2, **20 touch swipes**, 800 ms input duration plus 200 ms wait per leg. Handle centers measured before capture: (444,695) middle, (444,240) high; translations ±450 physical pixels. Monotonic measured workload **21.175404458 seconds**, including adb overhead/waits. Capture framestats immediately after workload, then verify final native handle remains2/3. No deliberate builds, tests or video extraction ran during capture; host/emulator scheduling still affects results.

[Reproduction script](evidence/profile-android.py), [device/workload/artifact metadata](evidence/android-release-workload.json), [raw counters/framestats](evidence/android-release-gfxinfo.txt), [final hierarchy](evidence/android-profile-final.xml).

| Rendered frames | Janky frames (current metric) | p50 | p90 | p95 | p99 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1156 | 39 (3.37%) | 17 ms | 19 ms | 20 ms | 21 ms |

Also reported: 39 frame deadline misses, 7 slow UI-thread frames, 22 slow issue-draw-command frames, 0 missed vsync and 0 slow bitmap uploads. Legacy jank15 (1.30%) is a different metric, not interchangeable. Histogram includes one frame in the125-ms bucket; misses/tail are retained, not hidden by percentiles. The high-input-latency counter is not measured gesture latency and is not converted into a touch-latency result.

## Interpretation and limits

These are **whole-window Android rendering counters**, including body layout, backdrop, native gesture work and discrete React status updates. They do not establish per-component FPS, dropped-frame attribution, JS-thread cost, touch latency, memory growth or React render counts. No equivalent before/after or Gorhom workload was captured, so no regression/improvement ranking is justified. No measured regression was isolated to an animation path and no speculative animation rewrite was made.

Code inspection: continuous pan translation and body viewport height run on UI; React state is limited to discrete phases/layout/keyboard/preference and consumer snap/status updates. Animated body height intentionally performs layout to keep the footer/scroll bounds reachable. This is an inspected architecture property, not a measured zero-render/zero-JS-cost claim.

Separate keyboard, orientation, font, long-content and scroll QA is functional evidence, not independently profiled cost. Trace-based JS/UI/GPU attribution, unnecessary-render counts, heap/native memory/leak endurance, floating/split keyboard cost, physical devices, maximum content endurance and **iOS Release** timing remain **not measured**. Native iOS AX/keyboard observations are Debug only and do not establish frame pacing. Representative hardware and focused tracing remain release-hardening work.

## Iteration 7 follow-up

[Release performance summary](../../releases/0.1.0-beta.1/performance-summary.md) adds the current bounded six-scenario Android Release suite, noisy disclosure repeat and one whole-process memory snapshot. Earlier values above remain historical and are not comparable workloads or physical-device benchmarks. No per-component FPS/latency/render-count/leak claim.

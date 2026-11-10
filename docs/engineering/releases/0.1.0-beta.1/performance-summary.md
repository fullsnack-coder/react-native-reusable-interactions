# Performance hardening summary

2026-11-10. Android Medium_Phone_API_36.1/sdkgphone64arm64 emulator, Android16/SDK36, arm64,1080×2400 portrait, Hermes/New Architecture. Final source with arrow correction in standalone Release test APK. Identity/settings and exact input procedure: [metadata](evidence/release-profiling.json), [reproduction](evidence/profile-release.py). Font1.0/rotation0/transition scale1.0/accessibility0. No deliberate builds/tests/video decoding ran during captures. Host/GPU/emulator scheduling remains a confounder. No physical-device profiling claim.

Each scenario resets whole-window gfxinfo after setup. Disclosure12 taps/6 rapid expand-collapse cycles; stack6 expand/select cycles with alternating EveryDay/Reserve; swipe3 partial+3 complete+3 processing attempts+3 resets; balance6 increase/decrease/rapid-update sequences; hold3 early+3 full native holds with6 resets; sheet10 handle pans plus4 body-scroll swipes. Setup/warmup is excluded. Requested input duration is not measured latency. Final trees verified Reserve selected, swipe/hold idle with3 accepted confirmations, exact1,875.75 balance and sheet2/3.

| Scenario   | Input actions | Monotonic workload | Rendered frames | Current janky frames | p50/p90/p95/p99 |
| ---------- | ------------: | -----------------: | --------------: | -------------------: | --------------- |
| disclosure |            12 |         4.585798 s |             246 |           24 (9.76%) | 28/46/53/65 ms  |
| stack      |            12 |         4.960183 s |             291 |            7 (2.41%) | 26/31/34/48 ms  |
| swipe      |            12 |         9.892818 s |             299 |           15 (5.02%) | 7/17/17/29 ms   |
| balance    |            18 |         6.457442 s |             381 |            2 (0.52%) | 16/16/17/21 ms  |
| hold       |            12 |        10.530956 s |             362 |           10 (2.76%) | 7/16/17/21 ms   |
| sheet      |            14 |        12.619225 s |             720 |            9 (1.25%) | 16/17/18/18 ms  |

Raw per-scenario gfxinfo/framestats and final native XML are beside metadata. The counters describe the **whole app window**, not component FPS, drop attribution, touch latency or React render counts. Workloads differ: do not rank components or compare against earlier iterations as equivalent tests. Missing vsync and high-input-latency counters do not supply end-to-end gesture latency.

## Investigating the disclosure tail

Initial disclosure sample had 24 janky/246 frames (9.76%), p95=53ms. Retained all raw evidence. Repeating the same 12-tap sequence on unchanged APK/settings after the suite yielded 1/248 (0.40%), p50/p90/p95/p99=7/16/16/18ms, duration 4.176986375s. [Repeat](evidence/disclosure-repeat.json), [raw](evidence/disclosure-repeat-gfxinfo.txt). This is a warmer later sample, not a controlled optimization or proof of a speed improvement. Persistent slowdown was not established; no animation rewrite was made from one noisy tail. Trace-based attribution and representative hardware remain follow-up. A reproduction script for the repeat uses the same helper/setup/cycle in profile-release.py.

## Historical evidence retained

Earlier per-component reports remain unmodified historical evidence: selector 1196 frames/35 janky (2.93%); SwipeToPay3.1 repeat 1019/27 (2.65%); balance 1409/32 (2.27%); hold 1211/33 (2.73%); sheet 1156/39 (3.37%). Each has its own device/build/workload/date/raw logs. Disclosure previously had no measured report. Different workloads/dates are not a performance ranking or valid before/after baseline; this release suite adds a reproducible bounded workload, not an isolated benchmark.

## Architecture and unmeasured work

Continuous swipe/hold/sheet work is on UI shared values; React state is discrete configuration/layout/phase/status. Balance shares progress and retains exact native text/formatting; measurement can trigger React layout work. Disclosure/stack/sheet height updates intentionally incur layout, not only GPU transforms. These are inspected properties, not measured zero-render/zero-JS assertions.

Per-component JS/UI/GPU traces, native React render counts, heap/leak endurance, physical memory/thermal behavior and exact gesture latency remain not measured. iOS independent consumer Release was built/run functionally; no Instruments frame pacing measured. No guaranteed 60/120 FPS, comparative Gorhom result, or invented development time. Consumer-specific large content/fonts/navigation and sustained interactions require further profiling.

## Numeric memory snapshot

A separate whole-process dumpsys meminfo snapshot at idle after the disclosure repeat recorded total PSS 101235 KB and RSS 196908 KB. [Raw snapshot](evidence/release-app-meminfo.txt), [scope/limits](evidence/release-app-meminfo.json). This is a single process snapshot, not per-component allocation, a before/after trend, GC-normalized heap measurement or leak/endurance proof; none of those claims is made.

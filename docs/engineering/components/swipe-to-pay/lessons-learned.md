# SwipeToPay lessons learned

## Observed during implementation

The installed Gesture Handler hook and controller APIs work with the existing Reanimated resolver and Worklets mock. Callback delivery must be guarded on both runtimes: UI locking prevents repeated scheduling, and a JS latch plus generation checks reject stale delivery. Operation state remains an application responsibility.

A pan's activation tolerance must not subtract meaningful confirmation travel; test threshold=1 as well as the default. Interrupted return tests must account for the current handle position instead of assuming the spring settled. Explicit typed style bounds avoid an obsolete alias missing from RN strict types.

Native results and explicit gaps are recorded in validation.md and performance-report.md. No spring or latency benchmark is claimed from Jest. Haptics are deferred; no mandatory dependency was added.

The release event can contain translation not delivered by the final update. Test both a newly crossed threshold and a reversal at release. Accessible activation verified the same controlled lifecycle on iOS, but does not prove physical dragging or spoken feedback. Android screenshots made a visual overlap visible that mocked tests could not reveal.

Replacing a packed dependency does not reliably invalidate Gradle's JS bundle input tracking; force the bundle task and check sourcemap content before profiling. A persistent Metro file map missed a new file until a reset-cache restart; no native configuration change was justified.

No shared animation framework or new cross-component architectural rule was needed, so no ADR was added. Controlled async ownership and deferred haptics are documented in this component's proposal. Follow-up: real touch on iOS, complete screen-reader focus/speech runs, native RTL, and physical-device traces before broad quality/performance claims.

## Iteration 3.1 observations

Successful builds, native accessible activation and actual touch pans are separate kinds of evidence. A tool that performs AX actions can validate operation ownership while failing to generate a drag. Missing input capability does not justify changing gesture configuration. On Android, slow parent scrolling exposed the landscape control after faster attempts had overshot it; fresh measured bounds were essential after unmount/remount.

Never trust a previous UIAutomator XML after an idle error: the command can leave the prior file on disk. Verify capture success and observe actual intermediate handle movement before classifying cancellation/reversal/prop-interruption as tested. A successful callback after an invalid disable attempt is not enough to establish a component bug. Native background cancellation and pending-reset screenshots supplied useful direct evidence without test hooks or API changes.

The unchanged APK's second Release sample did not establish a performance regression or an improvement. Keep window counters separate from frame attribution and perceived finger latency. Real touch on iOS, full assistive-technology focus/speech, active-pan prop/layout interruption and physical-device traces remain the useful follow-up work.

# HoldToConfirm experiments

## Native authority and interruption

Hypothesis: native LongPress minDuration can own completion while a UI-thread visual estimate never authorizes an intent. Inspected installed RNGH hook mapping and Android native recognizer source: minDuration maps to native timing, maxDistance and shouldCancelWhenOutside supply cancellation, one pointer is required. No alternate timer-only implementation or comparative benchmark was run. Controller tests exercise discrete events; they do not simulate native elapsed time. Actual Android/iOS short and complete holds provide separate native observations.

Setup: Android 16 arm64 Release and iPhone 17 Pro / iOS 26.2 Debug. Native input procedure and observations are in validation.md and evidence. Timed configuration interruption controls schedule only a demo prop update; they are not part of hold timing. Android Home interrupts before threshold. iOS exposed accessibility activation is immediate and independent of physical hold. Live gesture and operation guards share one latch until explicit rearm. No per-frame JS callback or animation completion path invokes onConfirm.

## Platform lifecycle capability — failed then fixed

Actual iOS runtime threw unsupported appStateFocusChange on initial launch. AppState change listeners work on both platforms, but Android focus/blur subscriptions must be conditional. Before-fix screenshot retained; targeted regression checks iOS subscriptions and Android synchronous blur rejection. Native retest passed. No native configuration or dependency upgrade was necessary.

## Reduced motion and visual progress

Reduced-motion feedback uses quarter-step fill and static holding instruction, retaining native minDuration. Android OS transition scale zero was actually tested: 600-ms press cancelled and 1600-ms hold confirmed at the configured 1200-ms contract. Original setting restored and recorded. iOS native reduced motion was not executed in this iteration; mock/event coverage does not close that gate. Genuine iOS recording supports sampled visual review only, not a frame-rate/latency guarantee. Timing-vs-spring, haptics, usability study, maximum-duration endurance and hardware performance comparisons were not performed.

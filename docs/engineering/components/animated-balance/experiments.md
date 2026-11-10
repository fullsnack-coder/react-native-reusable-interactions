# AnimatedBalance experiments

## Exact integer-pattern formatting

Actual Node Intl probes covered PEN/es-PE, USD/en-US, EUR/de-DE, JPY/ja-JP and Arabic digits. Unit tests verify 15-digit integer plus six-digit exact fraction, negative subunits, trailing zeros, invalid/excess precision, carries, positional identity and decimal ordering without float interpolation. The initial native iOS execution failed on absent formatToParts. The corrected formatter uses Intl.format and validates its decoded numeric template before exact fraction substitution. A test removes formatToParts to reproduce that engine capability. No locale/engine compatibility is inferred solely from Node.

## Native strip layout

After the Intl correction, iOS showed the expected complete accessible amount but the visible face contained only currency/group/decimal tokens. Native screenshot saved before the fix. Explicit full-strip and Text height (30 cells) replaces an unconstrained auto-height. Regression checks the full height after measurement. Native retest on both platforms confirmed visible digits after the fix; before-fix and iOS retargeting images are retained in evidence/.

## Retargeting and lifecycle

Controller-free component tests retain actual Reanimated hooks with wrapper spies and the installed Worklets mock. Deferred UI work is advanced explicitly. Pure worklet target tests cover positive/negative cyclic positions, reversal and less-than-one-revolution bounds. Component tests cover no-change, carries, rapid value/sign updates, reduced-motion changes, zero duration, style/format remount and cancellation/listener cleanup. No test is claimed as a finger-latency or native smoothness experiment.

No count-mode, spring-comparison, ergonomic study or alternative font benchmark was performed. Timing duration is a documented engineering default, not a measured optimum.

## Native layout, preference and interrupted updates — 2026-11-09

Setup: Android 16 arm64 emulator, standalone Release; iPhone 17 Pro Simulator / iOS 26.2 Debug through Metro. Full procedure/outcomes are in validation.md. Rapid bursts request four authoritative snapshots 100 ms apart; Android unmounted after the first snapshot and remounted after the final owner update, exposing 1875.75. iOS sampled video shows interrupted rolling settling at 1875.75. No touch-driven iOS drag claim is made.

Android width was explicitly measured as 860 px then 619 px (72%); real adb horizontal pans exposed the final .123456 of the maximum-length value. Earlier filenames containing “narrow” were insufficient proof of width and are not used for this conclusion. Font scale 2.0 preserves the complete accessible amount; the visible viewport shows only the fitting prefix, requiring horizontal scrolling by design. Landscape shows the complete default amount without vertical clipping. RTL keeps Latin numeric order and aligns to the logical end. Reduced motion (transition_animation_scale=0) shows complete early/final snapshots; this is a functional result, not measured snap latency. Initial layout automation used coordinates before layout settled and missed the amount; a retry waited for layout and resolved fresh button bounds. This was an automation failure, not an established component defect. All settings were restored and compared against the baseline.

On iOS, enlarged Dynamic Type retains visible glyph height; RTL-context Latin amount order and logical-end alignment are preserved. Maximum values remain complete in the accessibility label, but native overflow touch scrolling was not reliably exercised. No screen-reader speech, largest-font or custom-font conclusion follows from those checks. Release gfxinfo methodology and actual counters are in performance-report.md; render counts and per-component timing were not measured.

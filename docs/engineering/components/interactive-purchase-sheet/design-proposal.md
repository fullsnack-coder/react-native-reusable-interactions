# InteractivePurchaseSheet design proposal

Historical initial proposal below; the final presentation revision is recorded at the end and in ADR 0009. Modal keyboard resizing was a hypothesis rejected by native Android evidence, not a final supported contract.

Recorded 2026-11-09 before implementation. Proposed; development time not measured.

## Scope and architecture

A custom transparent RN Modal, no portal/provider/navigation or new dependency. Choose bounded handle-only pan plus an internal standard vertical ScrollView. Body scrolling never moves the sheet, even at scroll top; lift and drag the handle to collapse. No arbitrary nested vertical scrollables, FlatList virtualization, automatic scroll-to-pan transfer or dynamic content sizing in version one. Arbitrary non-vertical-scrollable consumer content and optional footer/custom handle are supported. This deliberately avoids recreating a full bottom-sheet engine. ADR 0008 contains the mandatory current official Gorhom evaluation; no unmeasured speed advantage or incompatibility claim.

## Proposed controlled API and snap geometry

Required visible, snapPoints (1..4 strictly increasing fractions 0.2..1 of usable viewport), snapIndex, onSnapIndexChange (request), onDismissRequest (reason), safeAreaInsets (measured consumer top/bottom/left/right, e.g. existing safe-area-context), children. Optional onSnapChange (settled index, deduplicated per presentation), onDismiss (closed animation completed), dismissible/backdropDismissible (both true), handle/footer, sheet style/contentContainerStyle, accessibilityLabel/handleLabel/closeLabel, returnFocusRef and testID. No imperative/shared-value API or initial/uncontrolled index. Consumers acknowledge/reject requests through controlled props; application-controlled false always closes regardless of dismissible.

Fractions convert from measured modal viewport after provided safe areas and native keyboard avoidance. Resolve heights with a 96-point floor bounded by available space; points can coalesce on constrained viewports, retaining logical indices. Keyboard show requests largest snap, remembers prior index and requests restoration on hide. Caller may reject requests. Changed points/index/viewport or external visibility cancels old transitions. Invalid fractions/index/insets throw. No hardcoded device or keyboard height.

## Motion and state

UI shared top position and generation guards; discrete React state only for modal presence, geometry and phase. Handle captures current progress, follows bounded vertical translation, uses release position plus capped velocity projection to choose nearest point/closed. Cancellation returns to current controlled snap. Dismissal selection occurs on release, not threshold crossing. Snap/close uses clamped spring and supports interruption. Body viewport height must match visible sheet height during drag: animate that layout height on UI alongside sheet translation; this is a justified exception to transform-only advice, to prevent inaccessible bottom actions. Measure actual Release cost, do not claim GPU-only rendering. Backdrop opacity follows position.

## Lifecycle, keyboard and accessibility

Keep modal mounted only through close animation; hidden content cannot intercept after closure. Generations reject obsolete callbacks and unmount work. Modal root supplies its own GestureHandlerRootView for Android dialogs. iOS KeyboardAvoidingView uses native keyboard frames; Android initially proposes dialog viewport resize; this hypothesis requires actual visible-IME validation. After viewport/snap settles, scroll the native focused input into the internal ScrollView with the public responder helper. No guarantee for nested/custom input wrappers or third-party keyboard engines.

Use native modal isolation, accessibilityViewIsModal, an adjustable 48-point handle with increment/decrement/dismiss actions, visible 48-point close control when allowed, and discrete settled announcements. Send native focus to the handle on open; best-effort caller ref restoration after close. Disabled dismissal removes backdrop action/close action and labels constraint; closing from props still works. OS reduced motion snaps, including live changes. No per-frame accessibility announcements. Native screen-reader focus/speech remains a release gate until actually exercised.

## Acceptance and validation

Preserve five components/source hashes/tests/public demos/docs. Unit tests: geometry/projection/config rejection, controlled requests/completions, hidden state, rapid updates, callbacks/lifecycle invalidation, keyboard requests, dismissal lock, accessible alternatives and cleanup. Native Android Release: actual handle drags, content scroll at top without transfer, controls/TextInput/keyboard/backdrop/back, dynamic points, rotation/font/reduced motion where feasible and gfxinfo workload. iOS Debug: build, actual supported input/keyboard/accessibility paths; previous unreliable drag tooling will not be retried without a meaningful alternative. Document unexecuted gates, no invented performance or elapsed development time.


## Revision before root-host implementation — 2026-11-09

The native Modal prototype built and passed gesture checks, but real standard Android 16 keyboard input still overlapped the focused field after the bounded window-prop fix. Therefore supersede only the presentation shell with a scoped PurchaseSheetHost at the application root, not a native Dialog. No new dependency or navigation coupling. The host owns one active overlay, hides/disables its background subtree while presented and removes the slot on close/unmount. Main-root KeyboardAvoidingView and keyboard events can then handle standard input. Existing controlled sheet API, geometry, gestures, body scroll, accessible alternatives and native close host remain; integration adds one required host wrapper. This is an implementation revision driven by real blocking evidence, not a fabricated comparison against Gorhom. See ADR 0009. Revalidate both platforms and profile only the final implementation.

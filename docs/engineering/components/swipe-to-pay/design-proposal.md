# SwipeToPay design proposal

Date recorded: 2026-11-08. Status: implemented; native touch and assistive-technology validation gaps remain (see validation.md). Proposal was recorded before implementation. Development time: not measured.

## Need and interaction

A native horizontal confirmation primitive with a handle that follows a single finger. The consuming app supplies the operation; no payment, currency, network, authorization or backend belongs in the package. Preserve both existing components and the four independent repositories.

## API proposal

Required `label`, controlled `status` (`idle | processing | success | error`), and `onConfirm: () => void`. Optional `disabled`, normalized `threshold` (default 0.85, validated 0.5..1), `resetKey`, `height`, `accessibilityLabel`, root/track/handle/text styles and physics spring configuration. `resetKey` explicitly rearms an idle control when a consumer intentionally leaves status idle after confirmation. Error/success/processing must return to idle before retry. Consumer-provided status labels can localize feedback.

## State and async contract

Gesture states are idle, dragging, returning and confirmed. Controlled operation states are processing, success and error; disabled overrides interaction. Shared values track position and locking, not React frame state. On acceptance, latch on UI and JS, emit one callback, and remain confirmed until the consumer supplies operation status or reset. Returning from a non-idle status to idle rearms. Changes to disabled, status, reset key, threshold, direction or geometry invalidate an active gesture/queued confirmation. Unmount cancels animation and ignores scheduled JS confirmation. No completion callback implies operation success.

Evaluated Promise ownership: convenient for single operations, but couples rejection/success/reset policy and late unmount results to the control. Chosen controlled status: the application owns cancellation, async results and retry, while a local latch closes the gap before parent updates. Supporting both contracts would introduce competing authorities. `onConfirm` return values are ignored; consumers handle their own Promise rejection and stale responses. No automatic retry.

## Gesture and motion

Use installed Gesture Handler 3 `usePanGesture` and Worklets `scheduleOnRN`, avoiding deprecated Reanimated thread-bridge APIs. Capture current handle position at touch begin, cancel any return spring, follow horizontal translation on the UI runtime and clamp to measured travel. Require distance threshold on release; velocity cannot bypass it. Vertical failure tolerance preserves parent scrolling. Single-pointer gestures only; cancellation returns without callback. Pan applies only to the handle, not the whole screen. Resize cancels/reset an incomplete attempt rather than interpreting a new width as confirmation. RTL mirrors handle start and drag direction.

Physics spring: stiffness 260, damping 30, mass 1, clamped overshoot, ReduceMotion.System. Use transforms for handle/fill; no React updates on gesture frames. Processing is static text rather than a perpetual animation. Haptics deferred; the consumer may provide them once in onConfirm or its result handler.

## Accessibility and layout

Expose one native button element with label, status value, disabled/busy state and activation action through the exact same latch as drag. Announce discrete operation changes, not continuous progress. Minimum handle 48 points; default track minimum height 64, expandable text layout. Measure parent-constrained width. For travel under 48 points, disable dragging and retain accessible activation if the control has at least a 48-point width. Too-small/unmeasured controls cannot confirm. Style overrides must preserve geometry. Test LTR/RTL, large text and narrow tracks.

## Validation

Unit/component tests: threshold boundary, clamp/reversal, cancellation, duplicate protection, controlled status, reset, resize, disabled changes and unmount. Public artifact integration with deterministic local async demo, both native toolchains and available runtimes. Reuse Android Release gfxinfo methodology from Iteration 2.1, force local-package bundle refresh and verify sourcemap. Record actual results only. VoiceOver simulator unavailability, TalkBack speech/focus gaps and physical-device performance remain open until independently verified.

## Iteration 3.1 validation status

The implemented design/API was preserved. Follow-up native evidence closes Android RTL/orientation and several operation-lifecycle cases; actual iOS touch and complete screen-reader validation remain open. See [Iteration 3.1 matrix](validation-iteration-3.1.md). No cross-component architecture decision or ADR change was needed.

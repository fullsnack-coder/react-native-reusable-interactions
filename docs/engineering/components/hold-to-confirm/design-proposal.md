# HoldToConfirm design proposal

Recorded 2026-11-09 before implementation. Final status: implemented; release validation pending. See validation.md for actual executed coverage. Development time not measured.

## Need and API

Reusable Android/iOS confirmation of intent, independent from external operation results. Follow the local flat component structure, without coupling to SwipeToPay or rewriting its contract. Proposed API: optional label (Hold to confirm), holdDuration (1200 ms, integer 500..10000), required status (idle/processing/success/error) and onConfirm, optional disabled/resetKey/labels/style/progressStyle/labelStyle/accessibilityLabel/testID. The application owns retry: change resetKey while idle, or transition from a non-idle status back to idle. No Promise interpretation, implicit retry, network or financial operations.

## Gesture and timing

Installed RNGH 3.4 hook useLongPressGesture supplies native minDuration activation, maxDistance and outside cancellation. Choose native activation as the only physical confirmation rule. On begin animate a shared value linearly to 1 over the configured duration; this is visual only, has no completion callback and is capped at 0.99 until native activation. On activation clamp to complete and schedule the guarded RN acceptance. Native timing may be delivered after a delayed frame; never infer authorization from visual progress. Touch-down/timer-only or manual composition requires duplicating native cancellation rules and is rejected for this scope.

One pointer; 12-point radial movement tolerance and shouldCancelWhenOutside. Early release/finalize before activation cancels and returns fill over 160 ms, interruptible by a new hold. Multitouch invalidates. Layout/duration/status/disabled/reset changes and AppState/background/Android blur invalidate the generation and progress; unmount invalidates queued work. Resuming cannot revive an old hold. UI lock plus synchronous RN latch prevent duplicate accessible/native acceptance while parent state is pending. A callback exception does not unlock the intent; consumer must explicitly reset.

## Visual design and accessibility

Single rounded minimum-56-point button, textual state plus muted horizontal fill. Transform translation/scale, not animated width. Fill starts at logical start in RTL. Default high-contrast dark text on pale neutral/green surfaces; no particles/icons or built-in haptics. Custom styles must preserve contrast and target bounds. Event-level onConfirm can trigger consumer haptics; activation/error haptics deferred.

One accessible button with complete instruction/value, disabled/busy semantics, activate action and iOS accessibility tap sharing the same guard. No progress announcements or duplicate accessible descendants. Discrete confirmation/operation announcements; speech remains native validation pending. Reduced motion retains native hold duration and uses quarter-step fill plus static Holding text; cancellation snaps. It must never shorten authorization time. Support live OS preference changes.

## Validation plan and risks

Use installed gesture test controller for begin/activate/finalize, with explicit distinction from elapsed-time native recognition. Cover cancellation, queued callbacks, config/lifecycle invalidation, latch resets, rapid/repeated accessible activation, statuses, cleanup, styles and reduced motion. Build/package/consume public API, preserve previous source hashes and tests, native adb real long holds and movement, accessible iOS inspection where reliable, Release gfxinfo capture, docs/journal/matrix updates. Native hold/progress synchronization and scrolling interference require actual runtime observation; no mocked test proves them. Existing screen-reader/iOS input limitations remain documented rather than repeatedly exercised with unreliable tooling.

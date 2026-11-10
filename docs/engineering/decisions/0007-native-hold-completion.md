# ADR 0007: Native recognition owns HoldToConfirm completion

- Status: Accepted
- Recorded: 2026-11-09
- Scope: HoldToConfirm; no changes to previous component APIs

## Context

A timed hold needs cancellation, progress and exactly-once intent acceptance without interpreting an external operation result. Reanimated can animate elapsed progress, but its completion may change under reduced motion or interruption. Gesture Handler already supplies native duration, movement and outside cancellation.

## Decision

Use installed RNGH useLongPressGesture minDuration activation as the sole physical completion rule. Begin a UI-thread linear visual clock without a completion callback. Cap visible progress below complete until recognition, then settle to one. Reduced motion changes feedback to quarter steps and preserves the native hold interval. Native gesture and accessible activation share a synchronous RN latch; UI lock prevents duplicate native scheduling. Generation tokens reject stale queued work after configuration/lifecycle changes and unmount.

Keep operation status controlled (idle/processing/success/error) and resetKey semantics conceptually aligned with SwipeToPay, using an independent type/implementation rather than extracting an unneeded shared framework. No Promise inspection, implicit success, automatic retry or operation ownership. AppState change works on both platforms; focus/blur subscriptions are Android-only, confirmed by an actual iOS runtime failure and subsequent regression fix.

## Alternatives and consequences

A Reanimated completion callback as authorization risks conflating visual reduction with intent. A JS timer duplicates native timing/cancellation and is sensitive to JS scheduling. Manual touch composition increases scope and must reproduce native rules. Neither is implemented. Native activation can be delivered after delayed UI work; visual progress never overrides that authority. Reset/lifecycle signals crossing JavaScript are interaction safeguards, not security guarantees. Consumers must coordinate external operation identities when rearming.

Native accessibility bypasses prolonged contact deliberately; confirmation is not a security factor. Full screen-reader focus and speech remain release validation. No haptics dependency is added; consumers can trigger completion feedback from onConfirm.

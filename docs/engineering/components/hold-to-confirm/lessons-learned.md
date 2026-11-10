# HoldToConfirm lessons learned

Native recognition owns intent; a visual clock can approximate elapsed time but must not independently authorize. Reduced motion should modify presentation without shortening required contact. Completion and operation success remain separate, including when the parent updates asynchronously or throws.

Read platform implementations and validate both runtimes: a typed AppState event can still be unsupported by the actual iOS native module. Platform-scoped subscriptions plus a native retest and regression are necessary. A synchronous RN interruption flag closes the gap before the React state commit.

Distinguish input mechanisms precisely. Coordinate holds can validate iOS LongPress even where previous Simulator drag automation was unreliable; exposed accessibility actions exercise a separate path. Neither proves VoiceOver speech/focus. Record actual progress visuals, not only correct accessible labels.

A hidden demo control does not own or cancel the operation. Capture result choice before scheduling and retain operation identity across hide/remount; owner unmount/reset cancels stale simulation timers. Native test scripts must select the expected result explicitly: the first success assertion failed because error was still selected, not because the component changed its result.

Keep profiling window-scoped and report real misses without inventing component FPS, render counts or latency. Carry unavailable release gates forward without marking them passed or rewriting previous component history. Full validation and measurement limitations are recorded alongside the evidence.

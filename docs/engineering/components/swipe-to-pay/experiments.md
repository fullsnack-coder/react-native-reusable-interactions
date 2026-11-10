# SwipeToPay experiments

## Full-travel threshold and gesture activation

- Hypothesis: a threshold of 1 must remain reachable by dragging the handle to its measured destination even when the pan activates after a dead zone.
- Setup: installed Gesture Handler controller, Reanimated/Worklets Jest setup, 300-point track, 56-point handle, 236-point travel.
- Procedure: begin, activate at translationX=9, update to translationX=236, end; threshold=1.
- Finding: subtracting activation translation loses the initial distance. Capturing position at touch begin and retaining full translation makes the accepted-intent callback fire once at full travel.
- Decision: retain full translation and use the current position when interrupting a spring. A failed/canceled pre-activation gesture returns any interrupted position. Regression test passes.
- Limit: mocked gesture lifecycle does not prove native finger responsiveness.

## Operation latch and queued callback

Actual component tests hold scheduleOnRN delivery, then unmount or change controlled status before releasing the callback. No onConfirm is emitted after invalidation. Accessible activation, repeated activation and drag use the same latch; status reset/key changes explicitly rearm it. Tests cover error/processing/success ownership, resize and disabled behavior. No network or real operation was performed.

No spring-comparison or ergonomic threshold study was performed. Defaults are engineering choices pending representative device use, not measured winners. Haptics were evaluated as consumer-owned feedback and deferred from the public API.

## Coalesced release event

With a 236-point travel, activate at 9 points and end at 220 without an update event. The previous implementation failed to confirm; using the final event translation passes. Conversely, update at 230 then release at 100 must return without confirming; that regression test also passes. The authoritative value is the release event, not the last delivered update.

## Native instruction overlap

The Android Release mid-drag screenshot showed the handle covering the instruction. Fade only the idle instruction as shared progress advances, keeping operation and accepted-intent feedback fully visible. This is a UI-runtime opacity style; the accessible value is unchanged. No timing, contrast or ergonomic superiority was inferred from the screenshot. Final artifact and native results are recorded in validation.md.

## Iteration 3.1 — native RTL, orientation and interruption

Actual Android Release per-app ar-EG session showed right-anchored handle/left arrow. A leftward partial swipe returned; a rightward swipe did not confirm; a leftward full swipe accepted once, with fill progressing from the right. A continuous above-threshold pan interrupted by Home returned on foreground without another confirmation. Landscape partial/full tests and completed-state portrait rotation preserved bounds. Native screenshots/XML and coordinates are in [3.1 validation](validation-iteration-3.1.md).

CUA iOS drag/scroll attempts left the viewport unchanged or activated a different control. Native AX activation verified operation semantics/lifecycle but cannot replace those missing touch tests. Android separate motionevent MOVE did not visibly move the handle, so unchanged counters were excluded as reversal/CANCEL evidence. A keyboard-focused Disable experiment hit UIAutomator's idle error and reused old XML; the stale file is labeled explicitly and not treated as proof of an active-pan prop change.

Remounting changed content height/scroll offset, making earlier screen coordinates invalid. Re-reading track/control bounds produced verified processing/reset/disabled sequences. An 80% release screenshot showed an intermediate returning handle before Reset; no confirmation fired. TalkBack bound, but ten injected next-item commands left the focus on earlier selector content. Spoken output was not recorded. No Spring/threshold optimization or haptic study was performed.

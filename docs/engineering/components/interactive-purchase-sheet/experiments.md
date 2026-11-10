# InteractivePurchaseSheet experiments

## Architecture inspection

Actual read-only official documentation/source/manifest review and npm metadata for Gorhom 5.2.14. Findings, compatible peer ranges, empirical compatibility limits, size and custom-scope tradeoffs are in ADR 0008. No custom-vs-Gorhom runtime benchmark was performed. No package was installed merely to assert compatibility.

## Handle-only arbitration

Android native touch injection moved the handle through all three levels. Vertical body scrolling and continued downward movement at scroll top retained the same handle bounds/snap; control transfers only after lifting and using the handle. This intentionally does not implement automatic handoff. A Home interruption during actual handle movement canceled and retained the controlled point. Pure/controller cases cover clamped velocity, release reversal, cancellation/multitouch rejection, configuration changes and stale callbacks. Native multitouch remains unexecuted.

## Keyboard coordinates — failed then fixed

iOS software keyboard was initially hidden by Simulator hardware-keyboard behavior; used the exposed Toggle Software Keyboard menu action, not a project setting change. A visible keyboard then demonstrated focused-input overlap. Native ScrollView's helper calculates against screen Y while input layout is content-local; adding measured modal scroll origin fixed the actual case. Before/after images and strict regression retained. Android standard soft keyboard required temporary show-with-hardware setting plus a handwriting-disabled retry; original values restored in finally blocks. Its subsequent real overlap persisted after disabling navigation translucency. This rejected the Modal resize approach for the available configuration and motivated the root-host experiment in ADR 0009. The final host must be tested with visible standard IME before text injection, because adb input text can itself hide that keyboard.

## Close semantics under reuse

Fresh initial iOS role was button; after lock/unlock/close/rapid reopen a full native AX snapshot exposed the Close control as slider. Explicit modern roles failed to improve it, so were reverted. Direct Text onPress had nested button semantics; Text does not support onAccessibilityTap in installed strict public types. Installed RNGH Touchable supplied a separate native button host. Native retest after the same sequence exposed one Close button, working activation, correct adjustable handle and one dismissal per actual close. This is an AX/activation result, not VoiceOver speech/focus validation. No native RN patch or dependency upgrade.

No unrun spring-comparison, usability study, arbitrary nested-list compatibility, physical-device benchmark or measured development duration is asserted. Release observations and limitations belong in performance-report.md and validation.md.

## Root host revalidation and Release capture

The root-host standard Android software-keyboard screenshot and input_method show the focused input above the visible IME; Back was tested before text injection and preserved the sheet. Text entry was checked separately because adb input text can hide IME. Final host also passed the actual native pan/scroll/state matrix. iOS final host repeated software-keyboard visibility, Q entry, Done and native close/rapid/unmount. Prototype results are not substituted for host checks. See validation.md for exact scope.

Android font-scale 2 recreated the Activity; the demo was reopened to inspect native wrapping, close and scrollable footer. Landscape and return to portrait retained bounded geometry. Combined script's later offscreen reopen failed, so an independent fresh-catalog transition-scale 0 open/expand/close/reopen check was executed and passed. Original settings restored in finally blocks. This is functional preference coverage, not measured zero-duration transitions.

Actual final Release workload 20 handle pans produced whole-window counters in performance-report.md. No spring-comparison or alternative-engine benchmark was performed.

A further actual Android Release check focused the note after scrolling the collapsed1/3 body. Standard IME was visibly open and the controlled sheet expanded to3/3; first Back hid IME and restored prior1/3 without closing. Field bounds [52,1338,1027,1475] were above IME viewport bottom1517. Log and settings restoration are retained. This specific lower-snap restoration was not run on iOS.

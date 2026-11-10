# ADR 0009: Root-host presentation for the purchase sheet

- Status: Accepted, supersedes ADR 0008's native Modal presentation during Iteration 6
- Recorded: 2026-11-09
- Existing five components and dependencies unchanged

## Evidence and context

The custom Modal prototype successfully built and handled Android real handle drags/scroll/dismissal and iOS keyboard after coordinate correction. Android 16 standard soft keyboard nevertheless covered the focused field. Native input_method reported visible IME and screenshots showed overlap; disabling navigation translucency did not resolve it in the available API 36 environment. Hardware/handwriting modes were separated from this actual failure and all temporary settings restored. Before-fix source, screenshots and logs are retained in the component evidence.

This is a blocking keyboard requirement for the new component. Preserve the bounded handle-only contract and move the overlay into the application root instead of adding a native keyboard-management module or patching RN/native project configuration.

## Decision

Add a component-scoped PurchaseSheetHost wrapping the application screen subtree. It renders one active sheet in a root overlay slot, disables background touch and hides that subtree from accessibility while presented. The sheet remains controlled and navigation-independent. It uses the existing main-root keyboard context with iOS padding/Android height KeyboardAvoidingView and native input reveal. Back is handled while the overlay is present; keyboard dismissal takes priority. Safe-area insets apply consistently to the measured host viewport. Completed close/unmount removes the slot and listeners; no hidden intercepting overlay remains.

Only one active sheet per host; a second simultaneous owner fails explicitly. No general portal API, arbitrary view registration or generic interaction framework. No new runtime dependency. The consumer must place the host above SafeAreaView/ScrollView content at the screen/application root inside the existing GestureHandlerRootView. It cannot overlay unrelated native Modal windows or arbitrary navigation-native presentations; no such compatibility is promised.

## Consequences and validation

Integration adds one explicit wrapper and manual background isolation replaces native Modal isolation. Keyboard, focus, Back, touch cleanup and both native platforms must be revalidated. Body geometry/gesture tests remain applicable, presentation tests are updated to the host contract, and prior component tests remain preserved. The Gorhom review in ADR 0008 still stands: compatible peer ranges are not native compatibility proof and no comparative performance conclusion is made. Final Release profiling must identify the root-host artifact, not the prototype.

## Observed result

Final root host passed Android actual handle/scroll/state validation and the visible standard-IME field/Back check; iOS Debug revalidated background AX isolation, software keyboard/typed input, native close and rapid/unmount lifecycle. Automated library 143/showcase 10 tests pass. Android final Release was profiled and its embedded runtime matched the tarball/install/build. Full screen readers, real iOS sheet pans, physical devices and broader native layering remain release gates. See the component validation/performance records; this decision does not claim universal keyboard/navigation compatibility.

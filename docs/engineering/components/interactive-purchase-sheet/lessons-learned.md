# InteractivePurchaseSheet lessons learned

A smaller, explicit gesture contract can avoid stealing content interactions without pretending to reproduce a mature bottom-sheet engine. Handle-only pan means scroll-at-top does not collapse; document and test that behavior as a deliberate limit.

Exact installed peer ranges and official feature descriptions are useful evidence, but are not native compatibility or performance proof. Preserve uncertainty rather than calling an untested alternative incompatible.

Keyboard coordinate systems matter in modal overlays. A helper that works at screen origin may under-scroll inside a translated sheet. Inspect its installed implementation, measure actual origin and reject stale asynchronous measurements. Disabling Android navigation translucency did not solve the actual standard-keyboard failure in the prototype. Moving a focused overlay into a scoped root host was justified by that evidence; it adds explicit background isolation and integration requirements. Do not patch unrelated activity settings or claim that adb text injection proves visible-IME avoidance.

Check native semantics after interrupted presentation, not only first mount. A role supplied in JSX was insufficient in the observed reused iOS View; modern-role and direct-Text alternatives had different problems. A distinct installed native button host preserved a single working close control. Native AX correctness still does not prove speech, focus restoration or full screen-reader usability.

Keep footer/actions scrollable at constrained snaps; a fixed full-height content viewport can hide them below screen. Matching viewport height on UI incurs layout work and must be measured instead of described as GPU-only. Final performance observations and release gates remain in adjacent reports; no comparison to unrelated workloads is justified.

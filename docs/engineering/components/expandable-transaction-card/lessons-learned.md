# ExpandableTransactionCard lessons learned

## What worked

The public package artifact loaded in both native debug builds. The iOS Simulator and Android emulator displayed the collapsed showcase. Controlled and uncontrolled request semantics passed component tests.

## What failed or changed

The first Android runtime check showed that the details did not appear after a tap or controlled state change. The child measured zero inside a zero-height clipped parent. Moving the measurement view to absolute positioning fixed expansion and collapse in the Android emulator. A separate failed retest loaded Metro from the library example on port 8081; after starting Metro from the showcase, the corrected interaction was visible. Reanimated warned that the dependency array used for Jest was ignored on native, so the test Babel plugin was configured and the array removed.

## Accessibility and platform findings

The toggle exposes a button role, expanded state, label, hint, and activation action in code and tests. VoiceOver and TalkBack focus behavior and reduced-motion behavior were not manually verified.

## Performance findings

**Not measured.** See [performance report](performance-report.md).

## Follow-up

Repeat iOS interaction checks and Android rapid reversal, dynamic detail height, reduced motion, and screen reader checks with the final artifact. Run Release profiling before performance claims.

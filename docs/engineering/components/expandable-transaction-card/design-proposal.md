# ExpandableTransactionCard design proposal

- Status: Implemented; native accessibility and release performance checks remain open
- Date recorded: 2026-11-08
- Related ADRs: [native-only package](../../decisions/), existing foundation decisions

## User need and behavior

Give an Android or iOS screen a reusable card that reveals arbitrary detail content in place. The compact region is the toggle target; details remain separate so their buttons can receive touches. The latest tap or controlled prop change wins during an interrupted spring. No navigation or financial behavior belongs in the package.

## Proposed public API

`ExpandableTransactionCard` accepts `collapsedContent` and `expandedContent` React nodes, `expanded?`, `defaultExpanded?`, `onExpandedChange?`, `springConfig?` (physics parameters), `style?`, `accessibilityLabel?`, and `testID?`. Controlled mode is selected when `expanded` is defined. The callback reports user requests only, once per activation, before an animation completes. External controlled updates do not emit it. `defaultExpanded` applies only to uncontrolled mode. Spring defaults should avoid overshoot; device reduced-motion preference should take precedence.

The name remains `ExpandableTransactionCard` for this iteration. The behavior is domain agnostic, so `ExpandableCard` may be a clearer future name; changing it now would depart from the requested provisional export. Reconsider with an ADR before a public stable release.

## Animation and gesture choice

Measure the detail content with `onLayout`. Animate the clipped detail container height with Reanimated `withSpring`, allowing the parent and following siblings to reflow. Retargeting the same shared value should preserve current position on rapid reversal. A small derived opacity softens the reveal. Height animation is a layout cost, accepted because transforms would leave a gap or overlap following content. Reanimated's system reduced-motion setting should remove movement. Use a tap gesture only on the compact toggle region; omit drag because it would compete with screen scrolling and interactive children.

## Accessibility and layout

Expose a button role, expanded state, label, hint, and activation action on the toggle. Hide clipped details from the accessibility tree and touch input when collapsed. The consumer owns labels for arbitrary content and must provide a meaningful card label. Keep a minimum 48 dp toggle height. Content owns its colors and typography. Re-measure on text, width, and orientation changes without fixed screen dimensions.

## Alternatives and risks

- Layout transitions: less manual measurement, but conditional detail mounting and interruption behavior need native verification.
- Transform-only reveal: cheaper compositing, but following content would not reflow correctly.
- A drag gesture: deferred because tap is sufficient and has fewer scroll conflicts.
- Height animation: may cost layout work for complex detail trees; release profiling is required before performance claims.

## Acceptance and validation plan

Test controlled and uncontrolled requests, rapid requests, accessibility props, custom nodes, styling, and details visibility. Build the package, pack it, install the packed artifact in the independent showcase, then exercise iOS and Android runtimes where available. Record build variants and any unmeasured performance results.

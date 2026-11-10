# React Native Reusable Interactions 0.1.0-beta.1

Unpublished first public-beta candidate. Owner-selected package @manueldev25/react-native-reusable-interactions. Android/iOS only, six Beta candidate components: ExpandableTransactionCard, CardStackSelector, SwipeToPay, AnimatedBalance, HoldToConfirm and InteractivePurchaseSheet with PurchaseSheetHost.

Physical Android validation reproduced a vertically low SwipeToPay glyph. The decorative arrow now uses centered native geometry independent of font metrics; RTL and confirmation contracts are preserved.

Release hardening narrows peers to the verified native stack, validates disclosure/stack spring parameters before native animation, cancels disclosure motion on unmount, inspects actual tarball exports/declarations/content and removes the showcase's sibling-repository dependency. Public scoped imports, community templates, compatibility/physical-device guidance, known issues and publishing procedure are included. Existing valid component APIs and application-owned intent/result semantics are preserved. Invalid nonpositive/nonfinite spring parameters now throw intentionally.

The earlier technical local package name was not published; consumers of old local examples must update imports to the scoped name and install the fresh candidate artifact. No migration of a published version is implied. Public release remains blocked by documented critical device/accessibility and governance gates. No new interaction/dependency upgrade, publication or deployment.

SemVer progression is 0.1.0-beta.1→beta.2/beta.3 only after justified changes/release decisions, then 0.1.0. Package version identifies immutable content; npm dist-tag is a movable registry label. Future owner-authorized prerelease distribution uses beta, never automatic latest promotion. Pre 1.0 can intentionally change APIs with migration notes; patches fix compatible defects, minors may introduce documented changes. Stable 1.0 requires an explicit compatibility/API policy and critical native/accessibility validation.

Guided real-touch validation of all six components passed on Android 13 / Xiaomi 2201117SL and iOS 27 / iPhone 16 Pro Max by explicit owner confirmation. Larger-text/reduced-motion checks were also confirmed and restored. TalkBack/VoiceOver were deferred and remain release gates; no reader pass or production validation is claimed. MIT was explicitly retained by the owner; reporting uses repository Issues with private follow-up for sensitive details, real remote/Issues URL pending.

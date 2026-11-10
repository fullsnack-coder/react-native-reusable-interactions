# Changelog

## 0.1.0-beta.1 — published beta (2026-11-10)

- Owner selected @manueldev25/react-native-reusable-interactions; project display name React Native Reusable Interactions. Existing repository names remain unchanged.
- Six Beta candidate components plus PurchaseSheetHost; no Stable claim.
- Validate disclosure/card-stack spring parameters and cancel disclosure animation on unmount. Existing valid APIs remain unchanged; nonfinite/nonpositive spring inputs now throw.
- Fix owner-reproduced Android SwipeToPay arrow vertical alignment using native decorative geometry, preserving RTL and accessible confirmation.
- Narrow compatible peers without upgrading installed versions; deterministic prepack build and package export/content/type audit.
- Scoped imports and self-contained showcase artifact, independent Community CLI consumer, community templates, guided physical device checks and explicit release gates.
- Published the exact owner-approved archive to npm after interactive 2FA. Registry timestamp 2026-11-10T20:49:12.897Z; public beta tag verified. MIT and documented beta validation limitations retained. No GitHub/deployment/LinkedIn action. The immutable published archive preserves its earlier prepublication README/CHANGELOG; this checkout documents current status.

## Unreleased

- Add HoldToConfirm: native timed hold, cancellation, guarded accessible confirmation and application-controlled operation status. Native runtime evidence and release gates are recorded in the Engineering Journal.

- Local public components: ExpandableTransactionCard, CardStackSelector, SwipeToPay and AnimatedBalance. No npm release has been published.

- AnimatedBalance accepts exact decimal strings (15 integer / 6 input fraction digits), uses locale-aware native formatting and interruptible rolling columns, and exposes one complete accessible amount. No dependency upgrade or prior component API change.

## Iteration 6 (unpublished)

- Add InteractivePurchaseSheet and PurchaseSheetHost with typed controlled visibility/snap requests, interruptible handle pan, accessible sizing/close alternatives, safe-area and standard-keyboard handling.
- Add a fictional public-package showcase, regression tests, architecture records and native validation evidence. No new dependency or previous-component API change. Release validation remains pending documented gates.

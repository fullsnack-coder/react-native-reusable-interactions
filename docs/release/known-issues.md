# Known issues and release gates

0.1.0-beta.1 is published on npm. [View on npm](https://www.npmjs.com/package/@manueldev25/react-native-reusable-interactions). Implementation Complete, Physical Device Validated and Release Ready are separate. All six components retain Beta maturity; none is Stable.

Guided touch scenarios for all six components passed on physical Android 13 (Xiaomi 2201117SL) and iOS 27 (iPhone 16 Pro Max), explicitly confirmed by the owner; the scoped real iOS swipe/sheet pan gaps are closed by those confirmations. Owner-selected larger-text/reduced-motion checks also passed and preferences were restored. Exact largest text tiers, every orientation/RTL/multitouch/advanced-keyboard combination and long endurance remain unverified.

**Deferred by maintainer for beta — manual screen-reader validation pending.** Accessible completion, spoken state, focus order/containment/return remain unverified objectives for later beta hardening. This explicitly accepted beta validation gap is not a known critical defect or a Passed result; known critical usability defects still block release. Semantics trees/direct AX activation/unit tests cannot substitute for actual reader usability. Physical touch results are owner-confirmed, not an instrumented gesture/latency trace.

Existing MIT file/metadata are preserved; the owner explicitly confirmed retaining MIT. Reporting uses repository Issues per owner decision; its real location awaits a separately authorized public repository, with private follow-up for sensitive details. No GitHub/docs deployment URLs or contact addresses are invented. Package identity is @manueldev25/react-native-reusable-interactions per explicit owner update, with registry/account recheck required at publication time.

Only the measured narrow native stack is advertised. Window-level emulator profiling is not per-component FPS/latency or a physical-device benchmark. Detailed trace/memory/render-count and advanced native keyboard/navigation breadth remain pending. Default English labels/announcements and consumer themes/custom fonts need application review. Sheet body scroll never hands off to pan; use the handle or accessible sizing. No vertical nested-list or multiple simultaneous-sheet support.

See the release audit for exact automation/native/security findings; a passing mocked suite does not make this production-ready. UI confirmation components communicate intent only and do not authorize payments.

The published tarball is immutable and includes its prepublication documentation snapshot. Repository README/release docs now describe verified publication independently; no same-version replacement or additional release was made. Pin @0.1.0-beta.1 when installing; no-tag resolution is not a Stable maturity promise.

Registry tag incident: npm assigned latest in addition to beta despite --tag beta. Owner-authorized removal of only latest returned E400 twice after 2FA. Both tags remain at 0.1.0-beta.1 at verification; npm-side follow-up is pending. The package is a prerelease regardless of that mutable tag. Pin the exact beta; do not publish another version or weaken authentication to work around tag management.

# Beta compatibility

| Layer                 | Candidate baseline        | Evidence/status                                                                                          |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| React Native / React  | 0.88.1 /19.3.0            | Native baseline; beta consumer rebuild recorded in release journal.                                      |
| Reanimated / Worklets | 4.7.1 /0.13.1             | Official compatibility and installed compatibility.json pair 4.7 with Worklets 0.13 and RN 0.88.         |
| Gesture Handler       | 3.4.0                     | Current v3 hooks; explicit direct app dependency and root wrapper required.                              |
| Architecture / engine | New Architecture / Hermes | Required beta configuration; Old Architecture unsupported.                                               |
| Node                  | 24.21.0 validated         | Package engine follows RN: ^22.13.0 or ^24.3.0 or >=26; other permitted versions untested.               |
| Platforms             | Android / iOS             | Simulator/build/runtime scopes and physical-device gates are separate. No React Native Web/Expo support. |

Peer ranges use patch-compatible tilde ranges around the validated stack. Later patches are expected-compatible, not empirically verified; other minors/React Native versions are untested and not advertised as supported. In particular ^4.7 previously admitted Reanimated 4.8, which requires a different Worklets minor; narrowed before first beta without upgrading the installed stack.

Install all three peers directly in the app, put react-native-worklets/plugin last in Babel, wrap the root in GestureHandlerRootView, run iOS pods and rebuild native binaries. PurchaseSheetHost belongs above inset/clipped screen content, inside safe-area/provider context; one active owner per host. Sheet children consume providers above the host, not local declaring-screen providers. Advanced keyboards, arbitrary native Modal/navigation layering and nested vertical lists are unsupported/unverified as documented in its public reference.

[Official Reanimated compatibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/), [Gesture Handler installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/). Version admission is not proof of device accessibility/performance.

Physical functional evidence: Android 13 / SDK 33 Xiaomi 2201117SL and iPhone 16 Pro Max / iOS 27, signed standalone Release, guided cases confirmed by owner. Android 16 / SDK 36 emulator and iOS 26.2 Simulator builds/runtime are separately recorded. Motion/larger-text preferences passed within owner-selected scope, not largest-tier coverage. Deferred by maintainer for beta — manual screen-reader validation pending. Xcode 26.2 prepared usable DDI services for the actual iOS 27 device; no blanket forward-OS guarantee.

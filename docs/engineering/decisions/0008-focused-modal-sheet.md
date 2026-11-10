# ADR 0008: Focused custom modal sheet

- Status: Superseded during Iteration 6 by [ADR 0009](0009-root-host-sheet.md) after native Android keyboard validation
- Recorded: 2026-11-09
- Scope: InteractivePurchaseSheet, existing five components unchanged

## Context and official compatibility review

Installed RN 0.88.1 / React 19.3.0 / RNGH 3.4.0 / Reanimated 4.7.1 / Worklets 0.13.1, Hermes and New Architecture. Reviewed current official Gorhom v5 documentation, release 5.2.14, version-tagged source and npm metadata before deciding; no dependency installed.

| Criterion | Gorhom evidence | Custom bounded scope |
| --- | --- | --- |
| RN / React | Wildcard peers admit our versions; dev baseline RN 0.76 / React 18.3.1. This is not verified coverage of RN 0.88 / React 19.3 | Uses installed RN primitives; native validation required |
| Reanimated | Current manifest admits >=3.16 or >=4 prerelease; landing page still describes v1–3 | Uses installed 4.7 APIs directly |
| RNGH | Peer >=2.16.1 admits 3.4, source uses Gesture builder/composition APIs | Uses current v3 usePanGesture only on handle |
| New Architecture | No manifest exclusion; release history includes recent layout fixes; not a guarantee on our exact stack | Existing New Architecture/Hermes app builds are required |
| Android / iOS | Documented native support | RN Modal on each platform, independently exercised |
| Keyboard | Integrated keyboard behaviors and BottomSheetTextInput | Native iOS KeyboardAvoidingView / Android resized dialog; standard inputs/internal ScrollView only |
| Scroll arbitration | Integrated ScrollView/FlatList/SectionList wrappers, content pan and handoff | Body scroll never drives sheet; handle-only pan, no handoff, no nested vertical lists |
| Accessibility | Documented accessibility/reduced-motion support; actual screen-reader checks still necessary | Adjustable handle, close control, modal isolation and best-effort focus restoration; native release gates |
| Dependencies / size | npm 5.2.14: 1,328,755 unpacked bytes, 808 files; manifest adds @gorhom/portal 1.0.14 and invariant. Unpacked size is not app bundle size | No new runtime packages; caller supplies measured safe-area insets |
| Maintenance / API | Mature broader engine, updates and upstream constraints; thin renaming wrapper adds little value | Smaller explicit controlled lifecycle, close request vs completion and scoped content; ownership of cancellation/keyboard/focus bugs remains ours |
| Performance | Feature claims are not comparable benchmark evidence | No assumed speed advantage; actual Android Release window capture required |

## Decision and consequences

Choose custom transparent native Modal, controlled visibility and snap index, 1..4 fraction snap points, handle-only pan, internal standard ScrollView, arbitrary non-scrollable children and optional footer. Distinctive contract is predictable request/completion semantics, consumer-rejectable controlled presentation, bounded viewport fractions and explicit isolation from body scrolling. No portal or provider. No automatic content-to-sheet transfer, dynamic sizing, FlatList virtualization or arbitrary navigation stack compatibility claim.

The body viewport height follows visible height on UI to keep scroll bounds/footer correct while dragging. This intentionally requires animated layout in addition to sheet translation/backdrop opacity; do not claim GPU-only animation or superior performance. Parent supplies measured safeAreaInsets (e.g. existing safe-area-context in showcase), keeping library dependencies unchanged. Do not use deprecated core SafeAreaView as a substitute for measured cross-platform insets.

Gorhom is **not declared incompatible**: its peer ranges admit our stack, but exact native compatibility was not empirically tested. No adaptation, downgrade or speculative dependency upgrade is justified for the smaller supported scope. Revisit this decision if reliable content pan/scroll handoff, virtualization or advanced keyboard interaction becomes required; those are not silently promised here.

## Primary sources consulted

- [Versioned manifest](https://github.com/gorhom/react-native-bottom-sheet/blob/v5.2.14/package.json), [official npm version metadata](https://registry.npmjs.org/@gorhom%2fbottom-sheet/5.2.14).
- [Current releases](https://github.com/gorhom/react-native-bottom-sheet/releases), [props](https://gorhom.dev/react-native-bottom-sheet/props), [scrollables](https://gorhom.dev/react-native-bottom-sheet/scrollables), [keyboard input](https://gorhom.dev/react-native-bottom-sheet/components/bottomsheettextinput).
- [Versioned gesture implementation](https://github.com/gorhom/react-native-bottom-sheet/blob/v5.2.14/src/components/bottomSheetDraggableView/BottomSheetDraggableView.tsx).
- [RN Modal](https://reactnative.dev/docs/modal), [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview). Exact installed public types/source were inspected as well.

No comparative benchmark, complete compatibility matrix or screen-reader session is fabricated by this architecture review.

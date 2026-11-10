# React Native Reusable Interactions

An open-source collection of reusable, accessible, and performant interactions for React Native, built with the community.

**0.1.0-beta.1 — published beta.** Package: @manueldev25/react-native-reusable-interactions. Android and iOS only, Community CLI, Hermes and New Architecture. Owner-confirmed physical touch checks passed on both platforms; Deferred by maintainer for beta — manual screen-reader validation pending. The owner approved this exact npm beta publication; this is not a Stable release. No production or guaranteed-FPS claim.

## Components

All six remain Beta, not Stable: ExpandableTransactionCard (measured disclosure), CardStackSelector (small identity-based collection), SwipeToPay (swipe intent), AnimatedBalance (exact decimal-string presentation), HoldToConfirm (native timed intent) and InteractivePurchaseSheet (controlled handle-only bottom sheet), with PurchaseSheetHost. Applications own business logic, operation results, retry and authorization. No payment/network backend is included.

## Installation

Install the exact public beta in a compatible React Native Community CLI app. [View on npm](https://www.npmjs.com/package/@manueldev25/react-native-reusable-interactions), [exact version](https://www.npmjs.com/package/@manueldev25/react-native-reusable-interactions/v/0.1.0-beta.1).

```sh
npm install @manueldev25/react-native-reusable-interactions@0.1.0-beta.1
npm install react-native-reanimated@4.7.1 react-native-worklets@0.13.1 react-native-gesture-handler@3.4.0
```

The @version suffix belongs in npm installation specifiers, never in imports. Pin the beta explicitly; do not rely on a no-version install as a stability guarantee.

Baseline RN 0.88.1/React 19.3.0; [compatibility and limits](docs/release/compatibility.md). Add react-native-worklets/plugin **last** in the app Babel plugins, wrap the root in GestureHandlerRootView, run pod install in ios and rebuild Android/iOS. No Expo, Web or old-architecture support. Existing app safe-area handling remains application-owned.

```tsx
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExpandableTransactionCard } from '@manueldev25/react-native-reusable-interactions';

export function Example() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpandableTransactionCard
        accessibilityLabel="Request details"
        collapsedContent={<Text>Review details</Text>}
        expandedContent={<Text>Your application owns this content.</Text>}
      />
    </GestureHandlerRootView>
  );
}
```

InteractivePurchaseSheet requires PurchaseSheetHost at the root inside GestureHandlerRootView/SafeAreaProvider, above SafeAreaView/ScrollView/clipped screen content, plus measured safeAreaInsets. One active sheet per host. Content providers must wrap the host; no arbitrary native Modal/navigation stacking, nested vertical list or body-to-pan handoff. Pass controlled visible/snapIndex and acknowledge request callbacks. Full component references are maintained in the separate microinteractions-docs repository.

## Accessibility and beta quality

Accessible alternatives, state semantics, system motion and scalable text are implemented within each documented contract. Native screen-reader focus/speech and physical-device checks must be observed, not inferred from tests. Read [known issues](docs/release/known-issues.md), [physical-device guide](docs/release/physical-device-testing.md) and [release notes](docs/release/notes.md). Consumer themes/labels/fonts and device configurations require integration review.

## Development and community

Use Node 24.21.0/npm. Run typecheck, lint, format:check, test, build and package:verify scripts. For a separately approved future version, npm pack rebuilds via the reviewed prepack hook and does not publish. Do not regenerate or overwrite the preserved published 0.1.0-beta.1 archive. Do not commit lib/native build output. The standalone showcase consumes a vendored tarball through public exports, without a sibling dependency at runtime. The generated example uses a local built artifact; prepare artifacts before installing its lockfile.

[Contributing](CONTRIBUTING.md), [component proposals](docs/contributing/component-proposal.md), [acceptance/maturity](docs/contributing/acceptance-criteria.md), [Code of Conduct](CODE_OF_CONDUCT.md) and [Security](SECURITY.md). The initial maintainer is the project owner; community proposals can extend beyond the six initial interactions. Engineering Journal records are required for future behavior/architecture changes. Package version and component maturity are separate.

Existing repository license is [MIT](LICENSE); the owner confirmed retaining it for this candidate. Reporting uses repository Issues per owner decision, with sensitive details reserved for private follow-up; reports can be opened on the repository Issues page. The exact approved beta was published on npm on 2026-11-10. Its tarball is immutable; this repository README can evolve independently from the prepublication README snapshot already inside that archive. No same-version replacement or extra version is permitted. See [publishing runbook](docs/release/publishing.md). GitHub releases, Git tags, deployments and LinkedIn posting require separate authorization.

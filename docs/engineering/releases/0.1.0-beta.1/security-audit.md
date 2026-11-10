> Historical Iteration 7 record. See [Iteration 7.1](../iteration-7.1/final-report.md) for the patched docs toolchain and explicit beta reader deferral. Original findings below are preserved as evidence.

# Security and reliability audit

2026-11-10. Registry npm audit queried without applying automatic fixes. Raw reports in evidence/*-npm-audit.json. Counts include propagated dependency nodes, not independent exploitable issues.

- microinteractions-native: {"info": 0, "low": 6, "moderate": 8, "high": 0, "critical": 0, "total": 14}
- microinteractions-showcase: {"info": 0, "low": 9, "moderate": 6, "high": 0, "critical": 0, "total": 15}
- microinteractions-docs: {"info": 0, "low": 0, "moderate": 2, "high": 1, "critical": 0, "total": 3}
- microinteractions-web: {"info": 0, "low": 0, "moderate": 7, "high": 0, "critical": 0, "total": 7}

## Reachability / severity

- **High, documentation development tooling:** VitePress 1.6.4 locks Vite 5.4.21; registry reports path/filesystem handling, editor-related and other Vite dev-server advisories. Windows-only paths do not establish exploitation on this Mac, but cross-platform contributors are relevant. Installed VitePress explicitly requires Vite ^5.4.14; a forced 6.4.4 override is outside its supported range. No unverified major migration or prerelease VitePress upgrade applied. Dev/preview scripts now explicitly bind 127.0.0.1; do not expose to untrusted networks and stop when unnecessary. This reduces exposure, **does not fix/close the advisories**. Static generated docs and the native npm library do not ship a Vite dev server. A supported upstream docs-tool migration/security retest remains an unresolved High maintenance risk; approve it before exposing any dev service.
- **Moderate/Low, build/test/lint tooling:** minimatch glob-part amplification, glob cancellation traversal and deepmerge prototype poisoning flow through eslint/TypeScript parsing, Bob and Jest. Trusted repository/config inputs are current use; no network API in the native library supplies arbitrary globs/objects. No known native-runtime reachability through these UI components. Still track untrusted contributor/CI inputs and supported upstream fixes. npm's proposed Jest downgrade to 25.1 and Bob version change are not safe automatic fixes; npm audit fix --force was not run.
- **Moderate esbuild:** advisory concerns its development server; VitePress uses transformation/build APIs here, not a directly exposed esbuild serve endpoint. Retain reported finding; do not call the entire toolchain vulnerability-free.
- **No High/Critical reported** in native/showcase/landing lock reports; this is not proof of no vulnerabilities. Pure JS package has no additional runtime dependencies and includes native peers by declaration, not bundled copies of React/RN. Consumers must audit their own peers/app graph.

## Own-source reliability/security

Inspected six components for requests/logging/eval/credentials/permissions. No own business-network request, consumer-data console logging, dynamic execution or native permission/module added. RN Debug/Metro development traffic and peers' worklet runtime are separate from a business-network operation. SwipeToPay/HoldToConfirm report intent only; app owns authentication, authorization, idempotency, outcomes, retry and async error handling. Decimal-string display does not perform financial arithmetic.

Reviewed generation/latch/reset and unmount/keyboard/AppState cleanup. Add finite-positive springs to disclosure/stack and explicit disclosure cancellation; no observed memory leak/crash is fabricated. Physical Android arrow defect was reproduced and fixed. Existing callback/lifecycle regressions remain passing; invalid props intentionally throw, and consumer callback errors remain consumer-owned. Native gesture/reader validation is separate from mocks.

Expected Android example debug keystore/signing is a public test fixture, not production signing material, and is excluded from the library package. Owner selected iPhone Development Team in Xcode for local testing; no agent-created production credentials, tokens/account settings, App Store/TestFlight upload or remote action. Owner explicitly confirmed MIT and chose repository Issues for reports. Use minimal non-sensitive issue descriptions and private follow-up for sensitive details; actual repository/Issues availability awaits separate owner-authorized remote setup. No contact URL was invented.

[Official Vite advisory example](https://github.com/advisories/GHSA-4w7w-66w2-5vf9), [VitePress tagged manifest](https://github.com/vuejs/vitepress/blob/v1.6.4/package.json), [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249), [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). No exploit attempt against personal data or device was performed.

Upstream metadata recheck: npm latest VitePress is still 1.6.4 with Vite ^5.4.14; next is 2.0.0-alpha.21. No patched stable supported path was found in that lookup. Vite 6.4.4 exists, but a forced unsupported major or alpha migration is not silently applied. Unresolved dev-server findings remain explicit.

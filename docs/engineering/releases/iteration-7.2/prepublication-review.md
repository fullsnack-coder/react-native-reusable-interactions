# Iteration 7.2 prepublication review

Status: **Prepublication review completed; beta publication is now independently verified.** The checks and recovered authentication failures below are historical steps. See [current publication report](publication-report.md) for the published version, integrity, installation evidence and remaining E400 tag-removal incident. The exact archive was never regenerated.

| Field                      | Reviewed value                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Package                    | @manueldev25/react-native-reusable-interactions                                                    |
| Version                    | 0.1.0-beta.1                                                                                       |
| Registry                   | https://registry.npmjs.org/                                                                        |
| Intended dist-tag / access | beta / public                                                                                      |
| Artifact                   | microinteractions-native/artifacts/manueldev25-react-native-reusable-interactions-0.1.0-beta.1.tgz |
| SHA256                     | e0a552fc3fb0d475b09e255653c244d33fe19fda831ae04d0dee190856648be5                                   |
| Size / file count          | 78428 bytes / 68 files                                                                             |
| Previous validation        | Exact SHA256/SHA512 match to Iteration 7.1 artifact-final-verification.json                        |

## Actual archive review — Passed

Root ESM entry lib/module/index.js, React Native conditional entry to that same file, TypeScript lib/typescript/src/index.d.ts, all six native components and PurchaseSheetHost. All 52 source/lib payload files match current checkout. Package metadata, README and existing approved MIT present. No additional runtime dependency; native animation/gesture stack remains peers. Ranges: React ~19.3.0, RN ~0.88.1, RNGH ~3.4.0, Reanimated ~4.7.1, Worklets ~0.13.1. Android and iOS only.

68 files contain the intended source/build/types/public release/contribution docs, no native binaries, dependency directories, Engineering Journal, communications/media, .env or credential files. Twenty source maps have relative source paths and no detected sensitive/absolute-path markers. Marker review does not guarantee detection of every possible secret. Lifecycle scripts were inspected; local installed npm publish implementation runs directory lifecycle hooks only for directory publishes. No publish/dry-run-publish command was used for this review.

Reused existing native evidence; no native rebuild or archive recreation. Fresh TypeScript, ESLint, format and 153 tests/6 suites passed before final approval. The four Git roots remain independent and have no remotes. No website/doc copy claims publication.

## Initial registry and identity check — recovered authentication failure

npm config get registry returns the official registry. npm whoami returns E401, so publishing identity/permission is not yet confirmed. Exact public version lookup returns E404; independent anonymous public registry lookup also returns 404. This does not guarantee name availability or publishing authorization. Dist-tag lookup using expired credentials returns E401, not evidence that any specific tag exists/does not exist. Do not overwrite a published version or alter an existing tag without the separately required authorization.

Owner must perform npm login --registry=https://registry.npmjs.org/ interactively in their terminal. Never send passwords, tokens, OTP or recovery codes in chat. After login recheck whoami, exact version and tags; require manueldev25 for the personal scope. Immediately before publication, present these values/limitations and request the exact final confirmation required in the Iteration 7.2 brief. If 2FA is subsequently required, the owner handles npm's normal trusted flow.

## Known beta limitations to approve explicitly

- Deferred by maintainer for beta — manual screen-reader validation pending. VoiceOver/TalkBack are not Passed and no complete compliance is claimed.
- No established physical-device performance benchmark or per-component FPS evidence; existing Release profiling is scoped.
- VitePress 1.6.4 uses the locally tested Vite 6.4.6 override and requires future maintenance.
- Noncritical showcase CLI/deepmerge development-tooling findings remain documented.
- Public GitHub/Issues location and deployed docs/landing URLs do not exist. Do not invent them; setup/deployment remain outside this iteration's authorization.

Expected installation **after authoritative registry verification**:

```sh
npm install @manueldev25/react-native-reusable-interactions@0.1.0-beta.1
```

Imports keep the package name without @version. Publication to beta does not promote stable/latest. Source README can later change independently; the published archive/version must remain immutable. Preserve the current vendored showcase dependency; verify registry installation in an isolated consumer instead.

## Pending postpublication work

Only after confirmed npm success and independent registry integrity/tag verification: clean registry-only consumer install; synchronize landing/copy/npm links/SEO, complete VitePress install and reference copy, repository README and showcase release references; preserve media/design/API/peer versions and reader deferral. Update the tests which currently assert unpublished copy, run affected checks/builds/browser verification and record actual npm timestamp/URLs/files. Do not touch LinkedIn drafts or posting. No remote/push/tag/deployment or additional version authorized.

## Recovered owner step — 2FA was required

The final publication was explicitly approved. npm rejected the first exact-tarball attempt with E403 and read-only account inspection confirms tfa=false. The owner must personally enable npm 2FA through the trusted account flow, store recovery material privately and refresh login if needed. Do not request secrets in chat or automatically create bypass tokens. Recheck registry/hash/identity before a justified retry; no second approval of the unchanged operation is required.

## Final result

Owner enabled 2FA, completed the normal browser challenge and the approved tarball was accepted. Registry timestamp 2026-11-10T20:49:12.897Z; public beta tag, downloaded bytes and registry-only consumer are verified. Publication is complete; only the separate latest-tag cleanup remains failed after two owner-authorized attempts.

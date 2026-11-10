# Iteration 7.2 — npm beta publication and documentation sync

**Published and independently verified.** Local landing/docs/README are synchronized. **Remaining failed operation: removing the registry-assigned latest tag**, rejected twice with E400 despite owner authorization and completed 2FA. No additional automatic mutations/retries will run.

## Exact release

| Field                    | Confirmed value                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Package                  | @manueldev25/react-native-reusable-interactions                                                 |
| Version                  | 0.1.0-beta.1                                                                                    |
| Registry                 | https://registry.npmjs.org/                                                                     |
| Required tag             | beta → 0.1.0-beta.1, verified                                                                   |
| Unexpected remaining tag | latest → 0.1.0-beta.1, removal failed                                                           |
| Published at UTC         | 2026-11-10T20:49:12.897Z, registry timestamp                                                    |
| Archive                  | artifacts/manueldev25-react-native-reusable-interactions-0.1.0-beta.1.tgz                       |
| SHA256                   | e0a552fc3fb0d475b09e255653c244d33fe19fda831ae04d0dee190856648be5                                |
| SHA512 integrity         | sha512-p7/Je1SfCVwEiskFjM/3aN5Hm6EH5vIko/yoSr95cSKvZP5yTvrFe/b2ulvQhj3mVgHHlXamQio8EXN9TxcEwA== |
| Payload                  | 78428 bytes, 68 files; exactly the validated Iteration 7.1 archive                              |
| npm page                 | https://www.npmjs.com/package/@manueldev25/react-native-reusable-interactions                   |
| Exact version page       | https://www.npmjs.com/package/@manueldev25/react-native-reusable-interactions/v/0.1.0-beta.1    |

```sh
npm install @manueldev25/react-native-reusable-interactions@0.1.0-beta.1
```

Imports omit @version. This is a prerelease, not Stable; pinning is recommended regardless of mutable registry tags.

## Approval, publication and independent verification — Passed

The user explicitly approved the presented exact artifact/identity/registry/tag with “si dale”. Initial E401 login and E403 missing account 2FA were recovered by owner-completed normal npm authentication. No password/token/OTP/recovery material was requested in chat or included in evidence. The first attempt was rejected; the second used the same approved .tgz, `--registry=https://registry.npmjs.org/ --access public --tag beta`, completed owner browser verification and exited 0. Neither command used latest, force, a directory publish or another version.

A CLI success notice did not establish availability. Initial public metadata was 404, then only npm's server-generated 0.0.0-stage placeholder appeared. Exact-version lookup remained 404 until processing completed. Read-only stage list returned no actionable stage; no stage publish/approve or placeholder installation was performed. The exact beta subsequently appeared with the timestamp above. The server placeholder is not a separately released library version authored by this task.

Registry name/version, beta pointer, peers, license, SHA512 and tarball URL were independently verified. The downloaded public tarball matches the local approved archive **byte for byte**. Root ESM/React Native entry, declarations, six components/host and intended public files are intact. Twenty relative source maps were inspected; no detected credentials/absolute local path markers, .env/native binaries/Engineering Journal/communications payload. Archive was never regenerated or replaced.

[Registry metadata](evidence/registry-verification.json), [public artifact comparison](evidence/registry-artifact-verification.json), [publication receipt](evidence/publication-receipt.json), [final CLI version](evidence/cli-version-final.json), [final tags](evidence/tags-final.json).

## Clean public-registry consumer — Passed

Created /private/tmp/rnri-public-beta-verification outside all four repositories, with its own manifest/lock/node_modules and exact published specifier/validated native peers. First install encountered ETARGET from preceding registry/cache propagation; a new disposable cache with prefer-online installed 294 packages successfully. This consumer's install audit reported 0 findings; it does not supersede other repositories' tooling audits.

Lock resolution is the official registry URL, installed package is not a symlink, and all **68 installed files** match the published approved archive. Strict TypeScript compiles all-six public usage fragments against these installed declarations. The fixture uses static inset values for type checking only; no native safe-area/runtime test is inferred. Native source/lib/types match the already native-tested archive, so no unnecessary native build was run.

[Consumer result](evidence/registry-consumer-install.json), [fresh installation log](evidence/iteration72-registry-install-fresh.log), [typecheck log](evidence/iteration72-public-consumer-types.log). Inert manifest/lock/fixture snapshots are retained as .txt so they do not enter future library compilation or npm payload.

## Landing, documentation and README sync — Passed

- Landing retains design, server/client boundaries, native media, themes, responsive layout and existing accessibility behavior. Hero/copy command/Getting Started/footer/social metadata now say published beta. Verified “View on npm” destinations added; all six local component references remain real routes. No invented GitHub/deployed-docs URL.
- Independent VitePress installation/Getting Started, six references, requirements, introduction/catalog/examples, changelog/release/troubleshooting and README reflect actual publication. Pinned install and versionless imports are distinguished. Published peers match registry metadata: React ~19.3.0, RN ~0.88.1, Reanimated ~4.7.1, Worklets ~0.13.1, RNGH ~3.4.0. Existing Babel/root/Pods/native rebuild/sheet host/insets guidance preserved.
- Native repository README now includes pinned install, public npm links, quick start, beta warning, supported platforms, contribution/MIT and actual release state. Repository public release notes/known issues/runbook/changelog updated without rewriting historical component records. Current cumulative matrix adds publication evidence without new native/reader claims.
- Showcase README explains published identity and public consumer installation; its exact validated vendor archive, lock/dependencies and app behavior are **unchanged**. Future updates must not overwrite the now immutable beta archive. No registry switch was made to that app.
- Historical Engineering Journal references and LinkedIn drafts remain historical. No LinkedIn draft or posting action was performed. No native public API/source or project dependency/version upgrade.

**Immutable README limitation:** the already published archive, and npm's displayed README derived from it, preserve the prepublication documentation snapshot. It still describes a local candidate and has repository-relative document links that are not hosted npm documentation URLs. The repository README is corrected independently. This iteration will not overwrite/re-publish the same version, change the public README through an undocumented metadata mutation, or create another version. A future owner-approved release can carry updated packaged documentation.

## Validation matrix

| Gate                                                                         | Status / actual result                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prepublication native TypeScript, ESLint, format, tests                      | Passed, 153 tests / 6 suites                                                                                                                                                                                             |
| Published metadata/peer/version/license, public download/checksum            | Passed, exact approved bytes                                                                                                                                                                                             |
| Clean registry-only consumer + public TypeScript contracts                   | Passed, all 68 installed files match                                                                                                                                                                                     |
| Landing types/lint/format, production build, HTML/link/media tests           | Passed, 4 tests                                                                                                                                                                                                          |
| Docs types/format/link/install consistency tests, production build           | Passed, 5 tests                                                                                                                                                                                                          |
| Browser rendered responsive regressions                                      | Passed at actual 320/390/768/1440 widths, no horizontal overflow, correct 1/2/3 columns                                                                                                                                  |
| Landing npm links + independent docs install/import/Babel/deferral rendering | Passed; npm page itself observed with exact version/Public/MIT                                                                                                                                                           |
| Copy button                                                                  | Passed scoped feedback and expected pasted prefix. Full OS readback Not verified: IAB adapter empty; native AX value capped at 64 of 72 characters. Rendered/source command is exact; no project copy defect established |
| Source runtime/dependencies/vendor/archive unchanged                         | Passed; final checksum/source audit retained                                                                                                                                                                             |
| Latest-tag deletion                                                          | **Failed**, two E400 results after explicit owner authorization/2FA; no UI removal control exposed                                                                                                                       |
| New Android/iOS native builds/devices, physical performance, hosted CI       | Not executed; no runtime/native dependency change and no remotes. Prior native results preserved, not expanded                                                                                                           |
| Manual VoiceOver/TalkBack                                                    | **Deferred by maintainer for beta — manual screen-reader validation pending.**                                                                                                                                           |

Scoped browser logs had no warnings/errors. Clipboard verification-tool limitations and recovered auth/cache/processing failures are in the implementation journal; none was silently converted into a pass. The earlier showcase 10-test/native device evidence remains prior evidence, not a newly executed Iteration 7.2 suite. No development hours, FPS or latency fabricated.

[Browser evidence](evidence/browser-publication-sync.json), [actual docs rendering](evidence/documentation-browser-verification.json), [native preflight](evidence/native-preflight.log), [landing checks](evidence/iteration72-web-checks.log), [docs checks](evidence/iteration72-docs-checks.log), [final preservation checks](evidence/final-preservation-checks.json).

## Remaining npm tag incident — Failed / requires npm follow-up

npm exposed both beta and latest even though publication explicitly specified beta. Owner separately authorized removing only latest. Both `npm dist-tag rm ... latest` attempts completed owner browser 2FA but returned E400. The second was bounded after install metadata stabilized. Versions/Settings UI exposed no tag-removal control; no package security/access/trusted-publisher setting was changed. Official npm 12.2.2 code uses the same DELETE request shape (apart from OIDC support); no speculative global CLI upgrade was made.

Final observed state remains beta and latest at 0.1.0-beta.1. Cause of the registry rejection is unresolved; do not claim it is a project/native defect or that cleanup succeeded. No further blind retries, raw packument overwrite, republish, deprecation, unpublish or additional version. No support message was sent. [Incident record](evidence/dist-tag-removal-incident.json) is ready for maintainer/npm support follow-up. The required beta and pinned installation work, but the requested beta-only tag state is not achieved.

## Beta limitations and launch boundaries

Manual readers remain deferred, not Passed; no complete accessibility certification. Physical-device performance metrics and per-component FPS are not established. Existing Release profiling has its documented whole-window/emulator scope. VitePress's Vite 6.4.6 compatibility override needs maintenance. Existing noncritical showcase development-tooling advisories remain documented. Publication does not upgrade any component to Stable.

[Exact files changed](files-changed.md). All four Git repositories remain independent, with no new commits/remotes/pushes/Git tags/GitHub Releases. MIT and package/native dependency versions preserved. No Expo, React Native Web, new microinteraction or deployment.

Public website next steps require separate owner authorization: choose real approved hosting/domain and GitHub/Issues locations; run hosted CI after repository setup; configure real SITE_URL/HTTPS and deployed docs links; build/deploy landing/docs and verify actual public routes/media/metadata. Currently only local previews exist at http://127.0.0.1:3010 and http://127.0.0.1:4174. LinkedIn publication belongs to the owner and was not touched. Stop after Iteration 7.2.

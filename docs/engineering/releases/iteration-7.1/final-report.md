# Iteration 7.1 — landing experience, security and community launch preparation

**Candidate prepared locally; public launch requires owner approval.** Package `@manueldev25/react-native-reusable-interactions@0.1.0-beta.1` remains unpublished. This report supersedes Iteration 7's reader-only automatic beta blocker under the explicit new maintainer policy; it does not rewrite historical measurements or convert missing checks into passes.

## Landing architecture and sections — Passed

Independent Next.js 16.4.5 App Router, React 19.3.0, TypeScript and Tailwind; no new web runtime dependency. Static server content with only menu/clipboard client islands. System light/dark forest/paper palette, original ri. identity, system fonts without external font fetches, semantic landmarks, dimensions reserved for media, local next/image optimization and opt-in videos. Native runtime is not rendered in the browser.

Implemented navigation/mobile menu, hero/beta/installation preview, six-component catalog, genuine media, actual features, typed Getting Started example, Engineering Journal introduction, contribution/proposal/RFC/acceptance/reporting guidance, six local companion reference pages, documentation index and MIT/version/maintainer footer. The companion pages are intentionally narrower than the independent full VitePress reference; no public docs/GitHub URL exists yet, so every landing action resolves to a real local route or anchor. Both surfaces require maintenance for API changes. Normal builds/tests have no sibling-repository dependency.

SEO includes page titles/descriptions, viewport, Open Graph/Twitter metadata and original typographic social image. Local preview is noindex and uses localhost:3010; a future authorized deployment must set its real SITE_URL and rebuild. No fake screenshot, endorsement, adoption metric or canonical domain.

## Native media inventory — Passed / recording gaps Deferred

[Inventory](../../../../../microinteractions-web/docs/media-inventory.json) contains original source paths/hashes, output hashes/bytes, platform/context and export parameters. Two genuine silent iOS Simulator clips: AnimatedBalance 0–9.5 s excerpt (ends during motion), HoldToConfirm 10.5–14.5 s source excerpt (four seconds, Debug). Two optimized JPEG captures cover Android physical stack/swipe and iOS Simulator sheet, plus two actual-frame posters. Total native web media: 545479 bytes at inventory generation. JPEG longest edge 1100; MP4 fast-start and metadata stripped; no retiming or synthesis.

Earlier hold capture artifacts are disclosed, not disguised as component failures or clean performance footage. Sampled visual privacy review found fictional app content/system time/icons, no account/UDID/signing/personal text. No audio tracks. All video starts paused with controls and preload=none; alt/descriptions explain content. Disclosure has an explicit recording-pending placeholder; stack/swipe/sheet gesture recordings remain pending. [Recording checklist](../../../../../microinteractions-web/docs/media-recording-checklist.md).

## Responsive and accessibility review

| Check                                                                                  | Status / actual evidence                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Small phone 320×740, standard 375×812 / 390×844, tablet 768×1024, desktop 1440×1000    | Passed: rendered screenshots; actual innerWidth checked; no page horizontal overflow; 1/2/3 catalog columns                                                                    |
| Mobile keyboard menu                                                                   | Passed: Enter opens, Escape from link closes, focus returns to visible outlined toggle                                                                                         |
| Skip/focus and clipboard feedback                                                      | Passed: skip moves active focus to main; copy reports Copied; missing default-404 target fixed                                                                                 |
| Native video controls                                                                  | Passed within scope: keyboard starts playback, ended with readyState 4/no media error; no autoplay; not reader validation                                                      |
| Color                                                                                  | Passed for eight selected opaque text pairs, ratios 5.98–15.37; not every composite/consumer theme                                                                             |
| Light/dark                                                                             | Rendered evidence for both appearances; system media-query tokens retained                                                                                                     |
| Reduced motion                                                                         | Passed source/CSS review: smooth scrolling disabled, hover transforms/transitions/animations suppressed; videos opt-in. Forced OS/browser reduced-motion runtime: Not executed |
| Complete manual VoiceOver/TalkBack                                                     | Deferred by maintainer for beta — manual screen-reader validation pending.                                                                                                     |
| Full browser/assistive matrix, field Core Web Vitals and certified accessibility audit | Not executed; no scores/FPS/latency invented                                                                                                                                   |

[Browser evidence](evidence/browser-checks.json), [contrast pairs](evidence/contrast-pairs.json). No new native tests on phones/emulators were needed: source/APIs/native peers did not change. Iteration 7 physical confirmations and Release-build results remain preserved, not rerun or expanded here.

## Security — Passed targeted remediation; lower-priority debt retained

VitePress **1.6.4**, scoped Vite override **6.4.6** (previously 5.4.21), esbuild **0.25.12** (previously 0.21.5), Vue plugin **5.2.4** unchanged. Clean npm ci and full docs audit return **0 findings**, replacing 1 High + 2 Moderate affected nodes. No force upgrade or suppression. The plugin admits Vite 6; VitePress itself declares Vite 5, so this is a locally validated compatibility override with explicit future maintenance, not an upstream supported-range claim.

Production build, actual dev HMR/navigation and production search all pass. Original filesystem/editor/esbuild findings and the separate 6.4.4 query bypass are outside the chosen patched path. [Official query-bypass advisory](https://github.com/vitejs/vite/security/advisories/GHSA-8g5g-mxqh-grgj), [Vite release](https://github.com/vitejs/vite/releases/tag/v6.4.6). [Full advisory/reachability report](security-review.md) links every relevant advisory and before/after evidence. Localhost remains defense in depth, not the fix. Docs development tooling is separate from the distributed React Native runtime.

Production-only audits: native 0, docs 0, landing 0; showcase 4 Low affected CLI/deepmerge nodes, not a demonstrated mobile user-input path. Full native 14 low/moderate, showcase 15 low/moderate, landing 7 moderate tooling nodes remain tracked; no newly confirmed reachable critical production issue was identified. Audit counts are dependency nodes, not independent exploits or proof of future safety.

## Automated validation

| Repository / gate                                                                         | Status                                                                                         |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Native TypeScript, ESLint, format, 153 tests/6 suites, Bob build                          | Passed                                                                                         |
| Actual pack, package:verify, pack:check and payload review                                | Passed; initial default npm-cache permission failure recovered using existing disposable cache |
| Showcase explicit tarball install, vendor integrity, types/lint/format, 10 tests/5 suites | Passed                                                                                         |
| Generated example own typecheck                                                           | Passed                                                                                         |
| External consumer all-six landing snippets/public types                                   | Passed after final archive install; required sheet props included                              |
| Docs clean npm ci, TypeScript, Markdown formatting, 4 tests, VitePress build              | Passed                                                                                         |
| Landing TypeScript, ESLint, format, Next production build, 4 HTML/link/media tests        | Passed                                                                                         |
| Hosted CI, new native builds/device sessions, formal penetration test                     | Not executed; prior native evidence preserved                                                  |

No ESLint warnings in native/showcase/landing checks. Remaining optional fsevents/esbuild install-policy notices did not prevent a clean docs install/build; no global script approvals changed. Optional Node 24 direct TypeScript helper reports a module-type inference warning; not production browser code. No warnings/errors observed in the scoped browser checks. Earlier failed exploratory checks and recoveries remain in the journal/logs.

## Documentation consistency — Passed

Package/version, all six exports, Android/iOS-only baseline, Worklets-last Babel setup, root host/safe-area contract, proposal/RFC workflow, beta maturity and reader deferral aligned. Snippets compile against the installed public package in the disposable consumer; actual built local routes/fragments/media and independent docs Markdown links are tested. Public docs are separate from Engineering Journal raw evidence. ADR 0010 records the maintainer policy. Historical Iteration 7 reports retain original decisions with supersession notices.

## Communications — Passed as drafts, Requires owner approval to post

[Spanish LinkedIn article](../../../../../microinteractions-web/docs/communications/0.1.0-beta.1/linkedin-article.es.md): approximately 1045 words. [Feed post](../../../../../microinteractions-web/docs/communications/0.1.0-beta.1/linkedin-feed.es.md): approximately 212 words. [Genuine-asset suggestions/review](../../../../../microinteractions-web/docs/communications/0.1.0-beta.1/assets-and-review.es.md). Editorial counts exclude Markdown-only syntax and vary slightly by word counter.

Covers CLI scope, gesture/motion tools, all six patterns, intent versus operation outcome, precision/Hermes, native hold recognition, Android keyboard/root host, actual native evidence, Journal/ADRs, contribution process and local beta status. No development hours, user/adoption counts, certified accessibility or invented benchmark. No claim of publication or institutional endorsement. Drafts/media live in web, outside npm payload.

## Candidate and remaining launch gates

The unpublished candidate was repacked only for five Markdown policy files. SHA256 **e0a552fc3fb0d475b09e255653c244d33fe19fda831ae04d0dee190856648be5**, 78428 bytes / 68 files. [Artifact/consumer verification](evidence/artifact-final-verification.json), [docs-only archive comparison](evidence/package-docs-only-comparison.json). All 42 generated files match archive/installed copies in showcase, example and independent consumer; source/lib/types are byte-identical to the native-tested previous artifact. Native source changes: zero. Previous artifact hash is preserved in history. No unnecessary native rebuild.

- Deferred: full manual readers and broader fonts/RTL/keyboard/device/endurance validation; no successful result inferred.
- Remaining debt: scoped Vite override maintenance; low/moderate tooling advisories; historical media quality and missing clips; no field CWV/component performance attribution.
- Requires owner approval: exact artifact release; actual public repositories/Issues location; site/docs deployment and real SITE_URL; LinkedIn posting. No public launch action is authorized here.
- Known critical usability defects: none newly identified in this scope. Any reproduced critical defect still blocks beta release. Unverified reader behavior is explicitly accepted as a beta limitation, not a defect diagnosis or complete compliance.

MIT, package/version/APIs/native dependencies and four independent repositories retained. No Expo, React Native Web, new microinteraction, remote, commit, push, release tag, npm publication, deployment or post. Stop after Iteration 7.1.

## Exact files and local preview

[Exact modified/added/removed file inventory](files-modified.md) separates source deliverables from evidence and ignored candidate artifacts. Temporary consumer fixture is outside the four repositories; normal builds do not depend on it.

From the workspace, with Node 24.21.0 and each repository's own npm install:

```sh
cd microinteractions-web
npm ci
npm run build
npm run start -- --hostname 127.0.0.1 --port 3010
```

Landing: http://127.0.0.1:3010. Development alternative: npm run dev -- --hostname 127.0.0.1 --port 3010 (stop production preview first).

```sh
cd microinteractions-docs
npm ci
npm run build
npm run preview -- --port 4174
```

Documentation: http://127.0.0.1:4174. Development/HMR alternative: npm run dev -- --port 4173. All are local previews, not deployments. If the shell injects incompatible NODE_OPTIONS, unset it per command; use a writable npm cache if the known default cache ownership problem recurs. No sudo/chown/global settings required.

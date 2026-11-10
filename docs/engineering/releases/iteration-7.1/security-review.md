# Iteration 7.1 security remediation

Status: **Passed** for removal of the reported documentation-tooling findings from the installed/locked dependency path. This is not a claim of universal vulnerability freedom. Raw before/after and production-only audit responses are in evidence/.

## Exact chain and targeted change

Before: docs → VitePress 1.6.4 → Vite 5.4.21 → esbuild 0.21.5; Vue plugin 5.2.4. The audit reported Vite High plus esbuild Moderate and propagated VitePress Moderate (three affected nodes, not three independent exploits).

After: VitePress **1.6.4 unchanged**, scoped `overrides.vitepress.vite = "6.4.6"`, Vite **6.4.6**, esbuild **0.25.12**, Vue plugin **5.2.4 unchanged**. Package/lock candidate version remains 0.1.0-beta.1. No automatic force upgrade, alpha migration, audit exclusion or finding suppression.

VitePress latest stable still declares ^5.4.14; next is 2.0.0-alpha.21. No safe in-range Vite 5 patch was available. The Vue plugin explicitly permits ^5 || ^6. We chose the nearest patched stable major/maintenance branch, rather than VitePress alpha or Vite 8. This is a deliberate locally tested compatibility override **outside VitePress's declared range**, not upstream certification. Keep its regression coverage and remove it when upstream supplies a secure supported range.

## Advisories and fixed branches

| Advisory                                                                                                                                                                                                                     | Exposure                                                                                                                        | Fixed Vite 6 / esbuild line                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [GHSA-4w7w-66w2-5vf9](https://github.com/vitejs/vite/security/advisories/GHSA-4w7w-66w2-5vf9)                                                                                                                                | Optimized dependency source-map path traversal; advisory requires network-exposed dev server and predictable sensitive map path | Vite 6.4.2                                                                             |
| [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3)                                                                                                                                                     | Windows editor UNC credential exposure                                                                                          | Official current entry: Vite 6.4.3; earlier npm audit range was narrower, retained raw |
| [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)                                                                                                                                                     | Windows alternate-path filesystem deny bypass                                                                                   | Vite 6.4.3                                                                             |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv), [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw), [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | Editor argument/escaping/path checks; some platform/editor conditions                                                           | Vite 6.4.4                                                                             |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw)                                                                                                                                                     | Cross-origin script execution through custom middleware                                                                         | Vite 6.4.4                                                                             |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22)                                                                                                                                                     | Non-Windows project/system path collision may serve files outside allowlist                                                     | Vite 6.4.4                                                                             |
| [GHSA-8g5g-mxqh-grgj](https://github.com/vitejs/vite/security/advisories/GHSA-8g5g-mxqh-grgj)                                                                                                                                | Separate query deny bypass affects 6.4.4; do not stop at that version                                                           | Vite 6.4.5                                                                             |
| [GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)                                                                                                                              | esbuild development-server cross-origin response access                                                                         | esbuild >=0.25.0                                                                       |

Chosen [Vite 6.4.6 release](https://github.com/vitejs/vite/releases/tag/v6.4.6) exceeds these patched versions. [Vite 5-to-6 migration](https://v6.vite.dev/guide/migration) reviewed; this project has no custom Sass preprocessing or experimental Environment API integration. Production build and actual browser navigation/search validate the used integration, not every VitePress extension.

## Actual validation

- Clean npm ci with updated lock: Passed.
- npm ls: single Vite 6.4.6, plugin peer deduped; esbuild 0.25.12. Exact manifest facts in evidence/docs-dependency-versions.json.
- Full npm audit after update: **0 findings**; no nested Vite 5 chain remains. Production-only docs audit: 0 (VitePress is a development dependency).
- TypeScript, Markdown formatting, four tests and VitePress production build: Passed.
- Development page navigation and HMR: actual temporary probe appeared without reload; restored source removed it; no observed browser errors/warnings.
- Production local MiniSearch: SwipeToPay results/section anchors displayed; keyboard Enter opened the real reference; no observed browser errors/warnings.
- Exploit execution, Windows/editor attack reproduction and penetration testing: **Not executed**. No sensitive files or credentials were requested to prove a vulnerability.

Loopback binding remains defense in depth, not a replacement for the patch. These findings affected developer tooling, not bundled React Native runtime code. Static documentation and a live dev service have different exposure. Do not expose development services to untrusted networks.

## All four repositories

| Repository | Full audit before docs patch | Production-only audit | Disposition                                                                                             |
| ---------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| native     | 6 Low + 8 Moderate           | 0                     | Tooling advisories retained; no new native-runtime path demonstrated                                    |
| showcase   | 9 Low + 6 Moderate           | 4 Low affected nodes  | deepmerge 4.3.1 under CLI/config/doctor, not a proven mobile user-input path                            |
| docs       | 1 High + 2 Moderate → 0      | 0                     | Targeted path patched, no suppression                                                                   |
| web        | 7 Moderate                   | 0                     | Development lint/glob/parser tooling; production Next/React graph has no reported finding in this audit |

Counts include propagated package nodes, not independent CVEs. Showcase's [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) requires attacker-controlled merge input; current CLI works on developer-owned configuration. Treat untrusted PR/config processing carefully and track a supported CLI fix, without changing native peers or claiming runtime immunity. Existing low/moderate dev findings remain debt; no npm audit fix --force or major Jest/Bob downgrade was applied. Audit results depend on advisory data and cannot guarantee future safety.

# ADR 0010: Explicit manual reader validation deferral for the initial beta

- Status: Accepted by maintainer instruction in Iteration 7.1
- Scope: Release validation policy for 0.1.0-beta.1; no runtime or API changes
- Supersedes: Earlier automatic beta publication blocker based solely on missing full manual VoiceOver/TalkBack evidence

## Decision

Use the status: **Deferred by maintainer for beta — manual screen-reader validation pending.** Preserve existing semantics, accessible alternatives, reduced-motion behavior and automated regressions. Keep full reader testing as a later beta-hardening objective. Never record deferred checks as Passed or claim complete accessibility compliance.

## Reason and consequences

The owner explicitly accepts the unverified behavior as a beta limitation. That does not demonstrate a defect or establish usability. Known critical defects affecting use must still be fixed and block release. Existing physical touch results remain scoped owner confirmations, not reader results. Stable/production accessibility claims require actual evidence. Publication/deployment/remote setup/posting remain separately authorized actions; this decision authorizes none of them.

## Alternatives

Continue treating missing reader evidence alone as an unconditional beta blocker: superseded by owner instruction. Treat deferral as successful validation: rejected because it would misrepresent evidence. Remove accessibility coverage: rejected and out of scope.

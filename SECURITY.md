# Security

This unpublished 0.1.0-beta.1 candidate contains UI primitives. SwipeToPay and HoldToConfirm report intent; applications own authentication, authorization, idempotency, validation, networking and execution. No UI animation authorizes a financial transaction.

Do not put consumer data, device identifiers, account credentials, npm tokens, signing keys or provisioning profiles in issues/logs. A minimal fictional reproduction is sufficient. Report ordinary non-sensitive defects through the bug template once the owner publishes a repository.

The owner selected the repository **Issues** section for security/conduct reports. The repository is currently local; the actual Issues URL will be provided only after an owner-authorized remote exists. Start with a minimal non-sensitive report describing impact and requesting maintainer follow-up. Do not post credentials, personal data or exploitable details in a public issue; request a private follow-up channel for those details. No private inbox/URL is invented or claimed configured. The initial owner handles triage; no response SLA or additional security team is invented. There is no published supported release yet; beta patches/advisories will be documented in the changelog.

Maintainers should record affected version, reachability, impact, reproduction and mitigation privately, then prepare a regression test and release note. Apply dependency fixes after compatibility checks rather than blind npm audit fix --force. Never add credentials to the repository or publish automatically.

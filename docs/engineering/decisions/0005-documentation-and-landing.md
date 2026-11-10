# ADR-0005: Separate documentation and landing projects

- Status: Accepted (retrospectively recorded from Iteration 0 requirements and repository state)
- Recorded: 2026-11-08
- Supersedes: None
- Scope: Cross-repository

## Context

The project brief assigns reference documentation to VitePress and the public landing page to Next.js. Both are separate from the native library and showcase.

## Decision

Keep Markdown API documentation in the independent VitePress repository and product presentation in the independent Next.js repository. Mark planned components as planned. Do not render native React Native components in the web landing site.

## Alternatives

A combined web repository and browser-rendered native showcase were outside the requested architecture; no comparative evaluation was performed.

## Consequences

Cross-repository links will be added when public destinations exist. Documentation must track actual package exports rather than anticipated APIs.

## Verification

The VitePress and Next.js production builds passed in Iteration 0. No component preview or native web target was added.

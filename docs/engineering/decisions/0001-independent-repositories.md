# ADR-0001: Independent repositories and npm lockfiles

- Status: Accepted (retrospectively recorded from Iteration 0 requirements and repository state)
- Recorded: 2026-11-08
- Supersedes: None
- Scope: Cross-repository

## Context

The Iteration 0 brief explicitly requires four sibling Git repositories and rejects monorepo tooling. The native library, showcase, docs, and landing site now each have a `.git`, `package.json`, npm lockfile, and CI workflow. The library's generated example is an internal development app with its own npm lockfile.

## Decision

Keep the four repositories independent. Use npm and `npm ci` in each repository. Do not add a root package, shared workspace, or cross-repository build orchestrator.

## Alternatives

A monorepo and shared package workspaces were explicitly rejected by the project brief. No comparative build benchmark was performed.

## Consequences

Dependencies and CI must be maintained per repository. The showcase will validate the library through a package tarball and public exports, not direct source imports or absolute paths.

## Verification

Repository inspection found four separate Git directories and lockfiles, with no root package or monorepo configuration. Hosted CI remains unrun until repositories are committed and connected to remotes.

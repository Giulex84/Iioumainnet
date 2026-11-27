# Portfolio handoff — 2026-11-27

Owner: Giulex84. This cycle establishes safe autonomous engineering for IIOU, Arena, Sticker.pi, LaunchNest and Idle Realm. The full available chat history was reconciled with current source and provider metadata; unavailable prior messages/private metrics are not reconstructed.

| App | Repository | Host / store |
| --- | --- | --- |
| IIOU | Giulex84/Iioumainnet | Vercel / Redis |
| Arena | Giulex84/giulex-hub-mainnet | Vercel Next.js / Redis |
| Sticker.pi | Giulex84/sticker-pi-mainnet | Vercel / Redis |
| LaunchNest | Giulex84/launchnest-mainnet | Vercel / Neon PostgreSQL |
| Idle Realm | Giulex84/idle-realm-mainnet | Cloudflare Pages Functions / D1 |

Read each repository's AGENTS.md and docs/operations. Until owner-approved integration, the new handoff is on branch `ops/quality-20261127`, not main. Do not assume documents from different apps describe the same payment, database or authentication flow.

## Ordered plan
1. Establish durable instructions/checklists and verified source/deployment baselines (this cycle).
2. Prepare security dependency updates on candidates, run regression/build checks and make reviewable PRs. Do not auto-merge or deploy.
3. Establish isolated CI, browser and dependency checks. Browser failure to launch is an environment blocker, never a passing UI test.
4. Verify Preview source alignment using provider metadata; do not exercise an inherited production backend.
5. Obtain read-only provider capability or owner-provided screenshots for Cloudflare configuration, current Portal/PiNet and private metrics only when actually required.
6. After owner-approved production release, verify exact SHA, public GETs and sanitized errors, with a recorded rollback target. No automatic production rollback.
7. Extend authenticated E2E and adversarial coverage in independent cycles. Product changes, especially Idle Realm paid value, need a concrete proposal before any Mainnet release.

A weekly read-only review is scheduled Monday 09:00 Europe/Rome from 2026-11-30. It compares deploys/PR checks and official Pi policy changes, does not merge or modify production, and does not replace CI. GitHub Actions schedule starts only once the workflow reaches the default branch.

## Current operational limits
GitHub and Vercel integrations are available. No Cloudflare management connector was found in the available plugin catalog; GitHub Pages check-runs supply only build evidence. No tool for provisioning a saved Codex Cloud environment is exposed; setup commands are prepared, not a claimed created environment. Production DB health, Portal status and actual notification delivery require separate evidence. Browser binary downloads in this workspace are restricted; preserve sandbox and report the blocker.

# Context, requirements and architecture — IIOU

Recorded 2026-11-27. Owner instruction: autonomous engineering with explicit approval before any production/Mainnet change. This supersedes older broad deployment authorizations.

## Goal
Professional, stable, accessible mobile Pi application; preserve achieved functionality. Evidence must be reproducible, not inferred from a prior completion claim. Avoid unrelated tuning during judging/review.

## Current architecture
Static HTML/JS frontend, Vercel API functions, Pi identity verification with /v2/me, Upstash Redis ledger and receipts.
Host: Vercel. Public entry: https://iioumainnet-theta.vercel.app.
Audited main baseline: `3aada14b46fd7f4cd8d7302c942f3570b41b5855`. This is a dated reference, not a permanent current SHA.

## Functional requirements and preservation
- Participant-only agreements; counterpart identity verified server-side; no custody or automatic repayment.
- Create/accept/decline, split 2–12 other participants, recurrence, installments, notes, partial/complete settlement and shared history.
- Optional notifications with verified scope and explicit consent; private generic messages; saved preference does not guarantee delivery.
- Support purchase and incomplete payment recovery must remain idempotent; no new real transfers in testing.
- Eight UI languages; never translate usernames/user content.

## Dependencies and boundaries
See root package.json/lockfile, API/lib modules and deployment configuration. Test tooling lives in tools/qa with its own pinned lockfile. Runtime and QA dependency audits are distinct. Database assertions use disposable local Redis, PGlite or SQLite fixtures only. Production variables/bindings are intentionally not recorded here.

## Historical evidence
Repository documentation contains prior Portal screenshots and user reports, not a live Portal check. Public demos exist for Arena, Sticker, IIOU, LaunchNest and Idle Realm; the revised IIOU demo is approved but its new YouTube URL has not been supplied. Never expose the second participant name. Do not change candidature links, pending logo/version requests or wallet associations implicitly.

## Pi compliance references
Reviewed 2026-11-27:
- https://developers.minepi.com/docs/build-first-app/MainnetListing
- https://developers.minepi.com/docs/build-first-app/PiNet
- https://developers.minepi.com/docs/api-reference/SdkReference
- https://developers.minepi.com/docs/api-reference/PlatformAPI
- https://minepi.com/pi-next/

Check current official text before implementing a policy-sensitive change. Required review topics: Pi-only authentication and transactions, server identity/payment validation, necessary data only, independent branding, professional working UI, developer KYC/Portal listing, accurate PiNet mapping and external-link necessity. Source-code compliance is not Pi approval. Do not confuse PiNet configuration with auction-domain ownership. Notifications require actual verified consent; DataLab is not evidence of access to app analytics.

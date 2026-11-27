# IIOU — instructions for every agent

Read `docs/operations/CONTEXT.md`, `docs/operations/STATUS.md`, `docs/operations/CHECKLIST.md`, and `docs/operations/RELEASE.md` before working. These are the durable handoff; chat history alone is not evidence. Repository scope: `Giulex84/Iioumainnet`. Owner: Giulex84.

## Authority and safety — owner instruction of 2026-11-27
- Work autonomously on reversible technical decisions, isolated branches, local fixtures, tests, documentation and pull requests.
- **Do not change Mainnet, production branches/deployments, wallets, secrets, production databases, DNS, live payments or Portal submissions without explicit owner approval for the concrete action.** Earlier deployment permissions do not override this newer restriction.
- A PR/branch can auto-create a Preview. Never exercise an authenticated API there unless its database and credentials are demonstrably isolated. Use local API mocks for browser tests. A Preview URL does not mean Testnet.
- Do not merge merely because CI is green. Record exact head SHA, risks, tests and rollback; leave the production-changing decision to the owner.
- Never request, print, store or rotate wallet seeds/private keys. Do not copy production credentials into test environments. Minimize collection of personal data and redact the second Pioneer in demo material.
- Preserve historical records and paid entitlements. No destructive reset, backfill, migration or real payment to make a test easier.
- Use Pi server verification as authority, never client-supplied UID, role, price, transaction or entitlement. Payment fulfillment must be idempotent and server verified.
- Do not remove/skip security or regression tests to obtain green results. A changed requirement may update an obsolete assertion only with documented evidence and continued coverage of the original safety invariant.

## Work cycle
1. Fetch current main/tree and current deployment commit. Distinguish verified current evidence, historical screenshots, local mocks and unknowns.
2. Reproduce the issue; rank impact. Use an isolated branch. Keep implementation bounded.
3. Run `bash tools/qa/setup.sh`, then `NODE_PATH="$PWD/tools/qa/node_modules" node tools/qa/quality.cjs`. Local Redis is mandatory where configured.
4. Run `NODE_PATH="$PWD/tools/qa/node_modules" node tools/qa/quality.cjs --browser`. Browser network is mocked/blocked; no real identity/payment flow.
5. Run the security scan and dependency audit. Report scope/limitations; no result is a comprehensive security certification.
6. Inspect Preview source alignment using deployment metadata. Do not probe private data. Open/update a PR and update status/checklist.
7. After three substantially different failed approaches, document attempts, severity, repro and next dependency; proceed with independent work.

## Reporting
Do not claim a check passed unless executed. Report commands, exit/results, skipped checks, commit and environment, remaining risks, approval-ready changes and next steps. Deployment READY is build evidence only. No access/engagement/retention counts without an authorized actual data source. Technical package version, SDK version and Portal listing version are separate.

## Product invariants
- Participant-only agreements; counterpart identity verified server-side; no custody or automatic repayment.
- Create/accept/decline, split 2–12 other participants, recurrence, installments, notes, partial/complete settlement and shared history.
- Optional notifications with verified scope and explicit consent; private generic messages; saved preference does not guarantee delivery.
- Support purchase and incomplete payment recovery must remain idempotent; no new real transfers in testing.
- Eight UI languages; never translate usernames/user content.

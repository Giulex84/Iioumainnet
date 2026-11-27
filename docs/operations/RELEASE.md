# Verification, release and rollback

## Reusable Work / Codex environment
Use Node 22 and Python 3 on Linux, local redis-server for Redis suites, and Chromium through Playwright. Run `bash tools/qa/setup.sh`; install the browser with `tools/qa/node_modules/.bin/playwright install --with-deps chromium`. In a managed environment configure these setup commands through its supported settings, never by adding production secrets. Environment provisioning is not performed by these repository files. For restricted hosts, supply PLAYWRIGHT_EXECUTABLE_PATH to an installed Chromium and REDIS_TEST_SERVER to the local executable. Never disable a test because a dependency is missing.

Quality command: `NODE_PATH="$PWD/tools/qa/node_modules" node tools/qa/quality.cjs`.
Browser: `NODE_PATH="$PWD/tools/qa/node_modules" node tools/qa/quality.cjs --browser`.
Limited credential-pattern scan: `node tools/qa/security-check.cjs`.
Dependency review: `npm audit --json` for each lockfile (including tools/qa). A failed audit or unavailable registry is not a pass.

## Preview gate
Confirm candidate SHA and successful checks. Browser tests serve local files with mock APIs, block remote network and never create payments. Git-provider Preview may inherit production bindings/secrets: inspect configuration metadata without printing values, and do not call write-capable backend routes until isolation is established. Real Pi authentication needs a separately configured Testnet app and explicit sandbox settings; production SDK mode must remain false.

## Approval-ready release
Record PR URL/head SHA, changed files, tests actually run, local-vs-live limitations, migrations/config/payment implications, previous production deployment ID and rollback feasibility. Owner approval is required before merging a branch that auto-deploys to production, manual deployment/promotion or any real payment/database/DNS/wallet/secret change. Never force-push main or cancel a pending Portal request merely to match labels.

## After approval
Re-fetch main and candidate before release; stop if unexpected changes occur. Use reviewed merge/provider workflow, verify production READY/success at exact resulting SHA and intended alias. Perform public GET smoke checks and inspect sanitized errors. Authenticated/DB smoke checks require separate safe scope. No new notifications/messages to users without a consented test plan.

## Rollback
Before release record the previous successful deployment ID and commit. Do not execute rollback automatically: it also changes production and requires owner approval. Prefer reverting code through a new reviewed commit or provider rollback to the recorded build; preserve all database records. Prove schema compatibility first. If data/schema changed, stop and prepare a forward repair/backup plan; never restore/delete production data from test fixtures. Verify rollback source/alias and public smoke results, then record the incident.

## CI and monitoring
The proposed GitHub Actions workflow has read-only repository permissions, pinned action SHAs, timeouts, no deployment credentials and isolated Redis. PR workflows may need a maintainer enablement and cannot be called successful before an actual run. Weekly dependency audits are advisory findings; updates are PRs. A separate read-only scheduled review compares source/deployment health and official Pi policies; failures to access a source are unknowns, not zero incidents or zero users.

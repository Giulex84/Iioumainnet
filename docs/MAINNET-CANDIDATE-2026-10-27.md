# Mainnet candidate — 2026-10-27

Status: local candidate only; no push, deployment, payment or database change performed.
Scope: IIOU and Idle Realm Mainnet. Testnet unchanged in this work.
Languages agreed: English, Italian, Simplified Chinese, Arabic, Vietnamese, Korean, Indonesian, Nigerian Pidgin. No claim that these are an official usage ranking.

Changes: preserve concurrent saves and reject stale writes; atomic IIOU recurring-cycle/index writes with lock fencing; Idle Realm D1 compare-and-swap without schema migration. Public UI localization with normal-flow selector, remembered preference, Arabic RTL and user-authored text excluded.

Validation: 9 IIOU persistence tests using production Lua with a Redis command model; 7 Idle Realm persistence tests using SQLite with D1 adapter; 4 localization tests per app (24 total); inline JavaScript syntax valid. IIOU owner-dashboard checks passed. Full npm test does NOT pass: attendance integration requires REDIS_TEST_SERVER, unavailable locally. No real Mainnet Redis integration test or authenticated Pi Browser end-to-end test performed.

Limitations: translations require native-speaker review; legal pages remain original English. Visual mobile/RTL verification pending. Idle Realm actual Cloudflare deployment binding remains unverified. No claim of release readiness until these checks are resolved.

Release gate: inspect current remote heads and deployment mapping, finish browser checks and Redis integration, present concrete diff and risk/rollback summary, obtain explicit Mainnet publication approval. Publish each app separately; preserve prior deploy for rollback. Code rollback cannot undo legitimate user changes made after release; do not overwrite or reset user data.

Baselines: IIOU da362ffc90114349bd01542f12a55c4e4b37ba50; Idle Realm e299686825798427dad21061cbf59cc9890eb70c.
Payment handlers, network selection, Redis namespace and D1 schema intentionally unchanged. Existing prices and game rules preserved.

## Follow-up verification — 2026-10-27 Europe/Rome

Read-only approval: user said “No, ok, allora procedi” after proposal to finish remaining checks; no release approval inferred.
GitHub main heads re-read and match both recorded baselines.
IIOU production deployment verified READY: dpl_CZWrGVFmGmLBbjqEsnQFiQKvEhre; production alias iioumainnet-theta.vercel.app; project prj_GOLQsjeLvomHKDFCHGj46LDAo1hD; main commit da362ffc90114349bd01542f12a55c4e4b37ba50.
Static public-screen text coverage checked: unmatched entries are app branding, version and username placeholder; no additional static translation gaps found. This does not establish complete dynamic-message coverage or translation quality.
Payment handler files and Idle auth handler compare unchanged against local baseline.
Browser test attempted against local HTTP server: remote browser returned ERR_CONNECTION_REFUSED. No visual pass claimed. Local Chromium and Redis server executables unavailable. No Mainnet credentials fetched or database writes made.
Connector discovery found no relevant Cloudflare or Upstash integration. Idle Realm live domain, production branch and D1 binding still require an approved source or dashboard access before release.
Next possible externally hosted check: obtain explicit approval for an isolated candidate build and its test scope; do not push candidate branches because Git integration may auto-deploy. No publication performed.

## Authorized static preview — 2026-10-27
User authorized temporary IIOU preview and supplied Idle Realm URL https://idle-realm-mainnet3.pages.dev/. The live Idle UI was opened and shows Mainnet branding; Cloudflare branch/database binding still unverified.
Created Vercel preview dpl_AZAYX4pTfo58rVXb267yxvwuub1X, READY, target null, no aliases; URL iioumainnet-elq6l9opw-giulex84s-projects.vercel.app. Only static UI, 8-language catalog, demo fixtures and English legal pages uploaded. No API functions, credentials, real users, real authentication or payment SDK. Fetch fixture prevents writes and CSP connect-src none blocks outbound API requests. This verifies UI deployment only, not backend persistence.
Access blocked by Vercel Authentication. Request for 3-day shareable link rejected by automatic approval review because recipient/access authorization was insufficient. No bypass created; do not retry or work around without explicit authorization. Browser visual checks still pending. Production site and Testnet unchanged.

## Preview sharing approved
User explicitly approved a three-day shareable preview link for anyone receiving it. Vercel created a shareable-link access grant scoped to dpl_AZAYX4pTfo58rVXb267yxvwuub1X. Token deliberately omitted from this record. Expiry Unix 1793380190. Link opened successfully without Vercel login. Simulated login, all eight language selector options, Italian agreement detail and Arabic RTL verified in remote Chrome. User-authored note unchanged. No real wallet authentication or transactions executed. Screenshot captured; mobile Pi Browser check remains for user.

## Preview layout revision approved
User approved moving summary/status above actions and removing duplicate paid/remaining metrics. Updated candidate locally and static demo preview only. New preview dpl_J8i85TdLjb3PnjtkbYkJQ2hPh479 READY, target null, no production aliases; URL iioumainnet-lk88vxfqa-giulex84s-projects.vercel.app. Share access expires Unix 1793380123 (no extension beyond original approval). Token omitted. Browser confirmed detail cards: summary (2 metrics), plan (0 metrics), reminder, shared note, closure, sharing, timeline. Four localization tests and inline JS syntax checks passed. No backend or payment change; Mainnet not published.

## Compact release and payment verification — 2026-10-27
User requested shorter UI, Mainnet/Testnet alignment and payment checks. Compact details use native details/summary for secondary operations; active confirmations stay visible. One-time plan is a single line rather than a card. Testnet A2U preserved, no network progress counter reintroduced; Testnet SDK true and support 0.1 Test-Pi; Mainnet SDK false and support 0.01 Pi.
Mainnet payment candidate requires exact network/direction, rejects cancelled recovery, and validates Pi completion status, blockchain verification and txid before success. Testnet rejects non-finite payment amounts. Official payments.md and SDK_reference.md checked. No real transfer performed.
Validation: 29 Mainnet and 26 Testnet local tests passed; owner dashboard checks passed; inline scripts and backend syntax passed. Real Redis validation of both store variants executed through Testnet preview dpl_5EeiSk3KyrFTnVPFpA2WKkKm4P9K with audit:testnet:iiou:<UUID>: key remapping; both scripts logged PASS and cleanup confirmed. Subsequent static packaging failed STATIC_BUILD_NO_OUT_DIR without changing application aliases.
Testnet release commit a9d1fca7486f20531b520420daf8aed285cd0aec; READY dpl_2zA5nNe8U6h3GGXGDoVbN41py42Q; https://iiou.vercel.app/. Public page and Italian selector checked in Chrome. Authenticated detail and payment in Pi Browser require user wallet test.
Mainnet compact-preview attempt was rejected by automatic review for missing final approval on the concrete revised result. No alternative Mainnet write attempted. Mainnet remains da362ffc90114349bd01542f12a55c4e4b37ba50 / dpl_CZWrGVFmGmLBbjqEsnQFiQKvEhre.
Rollback Testnet: 7b235d092f362a6489f4adf998ba54bed043dce7 / dpl_CUXEqFTUBFv2K9zvs2WnKdcqeqof. Mainnet rollback target remains current baseline. Code rollback cannot reverse blockchain transactions or legitimate user actions. No database migrations or credential changes. Idle Realm unchanged; Cloudflare source binding remains unverified.

## Mainnet publication authorized — 2026-10-28 Europe/Rome
User explicitly authorized publication after the concrete release summary. Candidate runtime source is local commit 839a6cd60e79e6eb6bd2027fd2a20de9e6db311a; only this approval record was appended for publication. Baseline branch and production deployment rechecked unchanged. No live Pi payment authorized or performed by the agent.

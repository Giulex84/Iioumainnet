# IIOU Mainnet

## App documentation · 14 November 2026

[Privacy Policy](privacy.html) · [Terms of Service](terms.html)

The privacy notice covers participant-only IOU records and sign-in metrics. The terms distinguish recording a settlement from confirming a blockchain transfer.


Production/Mainnet codebase for IIOU — a private, non-custodial personal IOU ledger for Pi Pioneers.

## Evidence and release alignment — 2026-10-31

- Technical release: 2.2.2. This is separate from Pi SDK version 2.0 and the Developer Portal listing version.
- Production source baseline: `76b8d52bae67bb6ad679dacb7927748b3cd1a3f6`; Vercel production was READY at verification. This establishes build/source mapping, not authenticated end-to-end functionality.
- User-supplied Developer Portal screenshots: Mainnet Ecosystem Listing In Review; version 1.0.0; logo update pending; PiNet Active; outgoing and multisig connections shown as None. Current wallet-application detail has not been independently acquired.
- Auction domain: iou.pi — Claim Pending in supplied screenshots. Web URL ownership verification and PiNet activation do not establish auction-domain claim approval.
- No reviewer correction request or rejection reason has been acquired. Pending status alone does not identify a technical blocker.
- December 19, 2026 is a community-reported planning target, not an officially verified deadline.
- Portal updates require the owner's specific approval. Preserve pending requests; do not cancel them solely to equalize version labels.

## Product

IIOU lets two Pioneers create, confirm, track and settle a shared personal IOU record. The core ledger does not custody funds, lend Pi, route repayments, or arbitrate disputes.

Lifecycle:

`proposed → accepted → payment_claimed → settled`

Alternative terminal states: `declined`, `cancelled`, `closed_by_agreement`. An accepted agreement can be closed without settlement only after both participants confirm.

The Activity Center provides timeline history, private shared notes, partial-settlement records, remaining balance and settlement receipts.

## Mainnet status

The app has a Mainnet registration and production deployment. Earlier records report completion of the previous 10/10 setup checklist and a real 0.01 Pi U2A support transaction on October 28, 2026. These historical checks do not establish current listing approval or an end-to-end payment at the current price.

- Pi SDK uses `sandbox:false`
- Pi SDK authentication is the only sign-in method
- access tokens are verified server-side with Pi `/v2/me`
- U2A support payments use the Pi SDK client flow plus server-side approval/completion
- payment amount, memo, metadata, direction, network and authenticated user are checked server-side
- Mainnet persistence uses the `iiou-mainnet:` Redis namespace
- Mainnet and Testnet remain separate apps, repositories and deployments
- no Testnet simulator or `testMode` route exists in the Mainnet build
- no A2U Mainnet payout feature is enabled

## Pi payments

IIOU currently exposes one optional Pi Mainnet payment: `Support IIOU` for `1 Pi` (priceVersion 2).

Previously approved/submitted/completed 0.01 Pi payments retain legacy recovery support. No new real 1 Pi payment has been verified end-to-end in this work; do not repeat the earlier real payment as a documentation check.

This payment supports the application and does not settle, alter or validate an IOU between users. IOU settlement records remain non-custodial application records unless the product explicitly states otherwise.

## Required environment variables

- Redis-compatible REST URL/token (Upstash/Vercel KV supported)
- `PI_API_KEY` — the Server API Key for the **IIOU Mainnet** Developer Portal app

Supported storage variable families include the standard Upstash/Vercel names and the Vercel integration `STORAGE_*` variants handled by `lib/store.js`.

Wallet seeds/passphrases must never be committed to source control. The current U2A flow does not require a wallet seed in Vercel.

## Private aggregate telemetry

`/admin.html` is restricted server-side to the configured `IIOU_ADMIN_USERNAME` (default `Giulex84`). It reports daily pseudonymous users, successful logins and accounts observed on an earlier UTC day. Older operational-event counters may exist in historical data. Raw Pi UIDs, IOU notes, counterparties and amounts are not displayed or stored in telemetry.

## IIOU 2.0 agreements

Agreements may be one-time, weekly or monthly and may include a suggested installment plan. A recurring cycle is generated only after both participants complete the current settlement confirmation. Participants can record confirmed partial payments and send a private reminder at most once every 72 hours. IIOU records shared confirmations; it does not custody funds, execute peer-to-peer transfers or guarantee repayment.

## Shared requests and group splits

Every agreement has a private share link for the creator and counterparty. Authentication and server-side participant authorization remain mandatory; possession of the URL does not grant access.

`Split expense` creates 2–12 independently confirmable shares connected by common group metadata. Each participant sees only their own bilateral agreement. Creating or sharing a split never initiates a Pi payment. Implementation and API behavior are documented in `GROUP_SPLITS.md`.

## Languages

The interface language selector offers English, Italian, Simplified Chinese, Arabic, Vietnamese, Korean, Indonesian and Nigerian Pidgin. Translation completeness and native-speaker quality are not certified by the selector. The selection persists locally and affects interface copy only; user content and stored agreement data are never translated. See `LOCALIZATION.md`.

## Login bootstrap

After Pi authentication, `/api/auth` verifies the access token once, synchronizes pending agreements, records the login metric and returns both the verified user and their agreement list. The dashboard and Activity Center render this bootstrap payload directly instead of immediately repeating the same Pi and Redis work through `/api/ious`.

## Deployment

Designed for Vercel with Node.js 22.x. Production URL:

`https://iioumainnet-theta.vercel.app`

The Mainnet Pi Developer Portal app must point to the dedicated Mainnet deployment/domain, not the Testnet deployment.

## Developer Portal posture

Recommended listing metadata:

- Subtitle: `Clear personal IOUs on Pi`
- Description: `Create, confirm and settle personal IOUs with other Pioneers. Keep due dates and settlement history clear.`
- Privacy: `/privacy.html`
- Terms: `/terms.html`

Domain ownership is validated through the Mainnet `validation-key.txt`. Do not reuse Testnet validation material.


## Minimal analytics release

New analytics collect successful Mainnet Pi logins, distinct daily accounts and returning accounts only. Other analytics events are ignored without storage writes. Legacy data is preserved; missing historical return counts are not reconstructed. Reports distinguish login-only collection from older activity counters. Payment receipts and gameplay persistence are unchanged.


## Expense entry alignment · 18 November 2026

The dashboard highlights Split expense. An example is available before sign-in. The optional equal-share calculator distributes the amount to collect from other participants in seven-decimal Pi units, with review/edit before creation. Private request links are shown after successful creation. Interface strings follow the existing eight-language catalog.



## Split expense clarity · 21 November 2026

The amount-to-collect field now includes a 30 Pi / three-person example that explicitly excludes the creator's share. The equal-share calculator identifies usernames that are too short/long, use invalid characters, duplicate another participant or match the signed-in user. A calculation summary displays the number of private shares and exact total to collect. Changing calculator inputs clears unchanged generated rows; manual edits are preserved and hide the generated summary. Form reset clears the summary and validation message.

New guidance, errors and summaries use the existing eight-language catalog. Pi amounts, seven-decimal remainder allocation, agreement persistence, participant access rules and support-payment behavior are unchanged. Native date-picker buttons follow the device/browser language. Automated tests cover these UI states, translations and the existing persistence/payment paths; a fresh two-person Pi Browser demonstration remains a separate live check.

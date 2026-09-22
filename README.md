# IIOU Mainnet

Production/Mainnet codebase for IIOU — a private, non-custodial personal IOU ledger for Pi Pioneers.

## Product

IIOU lets two Pioneers create, confirm, track and settle a shared personal IOU record. The core ledger does not custody funds, lend Pi, route repayments, or arbitrate disputes.

Lifecycle:

`proposed → accepted → payment_claimed → settled`

Alternative terminal states: `declined`, `cancelled`, `closed_by_agreement`. An accepted agreement can be closed without settlement only after both participants confirm.

The Activity Center provides timeline history, private shared notes, partial-settlement records, remaining balance and settlement receipts.

## Mainnet status

The production app is live on Pi Mainnet and has completed the Pi Developer Portal 10/10 setup checklist, including a successful real User-to-App transaction.

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

IIOU currently exposes one optional Pi Mainnet payment: `Support IIOU` for `0.01 Pi`.

This payment supports the application and does not settle, alter or validate an IOU between users. IOU settlement records remain non-custodial application records unless the product explicitly states otherwise.

## Required environment variables

- Redis-compatible REST URL/token (Upstash/Vercel KV supported)
- `PI_API_KEY` — the Server API Key for the **IIOU Mainnet** Developer Portal app

Supported storage variable families include the standard Upstash/Vercel names and the Vercel integration `STORAGE_*` variants handled by `lib/store.js`.

Wallet seeds/passphrases must never be committed to source control. The current U2A flow does not require a wallet seed in Vercel.

## Private aggregate telemetry

`/admin.html` is restricted server-side to the configured `IIOU_ADMIN_USERNAME` (default `Giulex84`). It reports daily pseudonymous users and aggregate login, IOU lifecycle and completed support-payment counts. Raw Pi UIDs, IOU notes, counterparties and amounts are not displayed or stored in telemetry.

## IIOU 2.0 agreements

Agreements may be one-time, weekly or monthly and may include a suggested installment plan. A recurring cycle is generated only after both participants complete the current settlement confirmation. Participants can record confirmed partial payments and send a private reminder at most once every 72 hours. IIOU records shared confirmations; it does not custody funds, execute peer-to-peer transfers or guarantee repayment.

## Shared requests and group splits

Every agreement has a private share link for the creator and counterparty. Authentication and server-side participant authorization remain mandatory; possession of the URL does not grant access.

`Split expense` creates 2–12 independently confirmable shares connected by common group metadata. Each participant sees only their own bilateral agreement. Creating or sharing a split never initiates a Pi payment. Implementation and API behavior are documented in `GROUP_SPLITS.md`.

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

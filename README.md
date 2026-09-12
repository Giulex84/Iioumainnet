# IIOU Mainnet

Production/Mainnet codebase for IIOU — a private, non-custodial personal IOU ledger for Pi Pioneers.

## Product

IIOU lets two Pioneers create, confirm, track and settle a shared personal IOU record. The core ledger does not custody funds, lend Pi, route repayments, or arbitrate disputes.

Lifecycle:

`proposed → accepted → payment_claimed → settled`

Alternative terminal states: `declined`, `cancelled`.

The Activity Center provides timeline history, private shared notes, partial settlement records, remaining balance and settlement receipts.

## Mainnet separation

This repository is intentionally separate from the Testnet app and repository.

- Pi SDK uses `sandbox:false`
- Mainnet credentials and wallet must be separate
- Redis keys use the `iiou-mainnet:` namespace
- no Testnet simulator or `testMode` routes
- no Testnet records are imported automatically
- no A2U flow is enabled
- no optional support-payment button is exposed

## Required environment variables

- Redis-compatible REST URL/token (Upstash/Vercel KV supported)
- `PI_API_KEY` only if a future server-side Pi Platform action needs it

Pi access tokens are verified server-side using `/v2/me`.

## Deployment

Designed for Vercel with Node.js 22.x. The Mainnet Pi Developer Portal app should point to the dedicated Mainnet deployment/domain, not the Testnet deployment.

## Validation

Add the Mainnet Developer Portal validation key to `validation-key.txt` only after Pi provides it. Do not reuse the Testnet validation key.

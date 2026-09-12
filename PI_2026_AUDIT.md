# IIOU Mainnet — Pi 2026 integration audit

Audited against the current Pi Docs architecture and Platform API guidance, plus the Pi Developer Guide Mainnet/listing checklists.

## Confirmed

- Frontend loads `https://sdk.minepi.com/pi-sdk.js` explicitly.
- Mainnet frontend initializes the SDK with `Pi.init({ version: '2.0', sandbox: false })`.
- Login uses Pi SDK only and requests only the `username` scope because the current product flow does not initiate Pi payments.
- Backend independently verifies every Pi access token against `GET https://api.minepi.com/v2/me` before returning or mutating private IOU data.
- Mainnet and Testnet are separate Developer Portal apps and separate repositories/deployments.
- Mainnet persistence uses the dedicated `iiou-mainnet:` Redis namespace.
- The public Mainnet build contains no Testnet simulator, `testMode`, fake Pioneer, or sandbox-only route.
- Activity, partial-payment claims, and settlement receipts are application records; they are not represented as blockchain transactions.
- Privacy and Terms are first-party pages in the app deployment.
- API responses are marked `Cache-Control: no-store, private` and global security headers are enabled.
- `/api/health` is available as an operational readiness check for server/storage configuration.

## Before Mainnet activation

1. Finish Developer Portal hosting and Development/Production URL configuration.
2. Validate domain ownership using the exact `validation-key.txt` value issued to the Mainnet app.
3. Generate and install the Mainnet `PI_API_KEY` in Vercel; never reuse the Testnet key.
4. Connect persistent Upstash/Redis credentials to the Mainnet Vercel project.
5. Connect/apply for the Mainnet App Wallet in Developer Portal and securely retain its passphrase/seed outside source control.
6. Keep wallet seed out of Vercel unless a feature actually requires server-side wallet signing. The current IOU ledger does not need it.
7. If a U2A feature is added later, request the `payments` scope only then and implement the full Pi server approval/completion handshake with payment verification and idempotency.
8. Do not add A2U until the product has a legitimate payout/reward use case and the Mainnet app is eligible for it.
9. Run the final Mainnet review checklist in Pi Browser after all production credentials are configured.

## Listing posture

IIOU is positioned as a private shared IOU record tool for Pioneers, not as a bank, lender, escrow service, exchange, custody service, or dispute arbiter. The product should continue to avoid external login methods, non-Pi transaction rails, unnecessary data collection, and outward funnels that weaken the Pi-native user experience.

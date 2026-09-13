# IIOU Mainnet — Pi 2026 integration audit

Audited against the current Pi SDK / Platform API integration model and the live Mainnet Developer Portal state.

## Confirmed in production

- Frontend loads `https://sdk.minepi.com/pi-sdk.js` explicitly.
- Mainnet frontend initializes with `Pi.init({ version: '2.0', sandbox: false })`.
- Main login requests `username` and `payments` because the production app now exposes an optional U2A support payment.
- Backend independently verifies every Pi access token against `GET https://api.minepi.com/v2/me` before returning or mutating private IOU data.
- U2A payment approval and completion are performed server-side using the Mainnet `PI_API_KEY`.
- Payment handling verifies authenticated Pi UID, amount, memo, metadata product, direction and Mainnet network before approval/completion.
- The real `0.01 Pi` `Support IIOU Mainnet` transaction completed successfully in Pi Wallet.
- Pi Developer Portal Mainnet setup checklist is now 10/10 complete, including `Process a Transaction on the App`.
- Mainnet and Testnet remain separate Developer Portal apps and separate repositories/deployments.
- Mainnet persistence uses the dedicated `iiou-mainnet:` Redis namespace.
- Persistent storage is connected through Upstash/Vercel and the backend supports the integration variable-name variants used by the Vercel project.
- The public Mainnet build contains no Testnet simulator, `testMode`, fake Pioneer or sandbox-only route.
- Activity notes, partial-settlement claims and settlement receipts are application records; they are not represented as blockchain transactions.
- Privacy and Terms are first-party pages on the production deployment.
- API responses are marked `Cache-Control: no-store, private`; baseline global security headers are enabled.
- `/api/health` provides a non-secret operational readiness check for storage and Mainnet API-key configuration.

## Wallet status

- The Developer Mainnet App Wallet application has been re-submitted under Pi's updated requirements and is pending review.
- The selected wallet is one whose seed/passphrase is retained by the developer.
- Wallet seed/passphrase is not required for the current U2A support-payment flow and must remain outside source control.
- Outgoing wallet / A2U Mainnet functionality should not be enabled until there is a legitimate product payout use case and the relevant Pi eligibility/review is complete.
- Incoming multisig can be completed separately when all required signers are available.

## Product and security posture

IIOU is positioned as a private shared IOU record tool for Pioneers, not as a bank, lender, escrow service, exchange, custody service, debt collector or dispute arbiter.

The current payment button is an optional app-support transaction only. It must not be presented as repayment, settlement, escrow or proof that an IOU has been paid.

## Remaining pre-listing work

1. Complete Mainnet Developer Portal metadata: subtitle, Privacy URL, Terms URL and Pi Sign-In setting where applicable.
2. Run a final UI/UX review on a small set of real Pioneer accounts.
3. Harden API abuse resistance/rate limiting before materially increasing traffic.
4. Review concurrent state transitions for IOU actions if usage grows beyond low-volume community testing.
5. Prepare Mainnet-specific professional listing screenshots and hero artwork with no Testnet validation UI.
6. Keep Ads disabled unless/until ad integration has a clear product reason and the Pi Ad checklist is intentionally completed.
7. Re-audit before adding any A2U, custody-like feature, automated repayment flow or other materially different financial behavior.

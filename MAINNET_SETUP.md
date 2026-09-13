# IIOU Mainnet setup and release checklist

## Completed Pi Developer Portal setup

- Separate Mainnet app: IIOU.
- Paired with the IIOU Testnet app.
- Self-hosted production deployment configured.
- Mainnet domain ownership validated with the dedicated `validation-key.txt`.
- Persistent Upstash/Redis storage connected to the Mainnet Vercel project.
- Mainnet `PI_API_KEY` configured server-side.
- Real `0.01 Pi` User-to-App support payment completed successfully.
- Pi Developer Portal setup checklist reached 10/10.
- Developer Mainnet App Wallet application re-submitted under Pi's updated requirements and currently pending review.

## Developer Portal metadata still to normalize

- Subtitle: `Clear personal IOUs on Pi`
- Privacy URL: `https://iioumainnet-theta.vercel.app/privacy.html`
- Terms URL: `https://iioumainnet-theta.vercel.app/terms.html`
- Confirm Pi Sign-In setting reflects the production app's Pi-only authentication flow.
- Keep Ads disabled unless the Pi Ad Network integration is intentionally adopted and reviewed.

## Functional release review

1. Sign in with Pi Mainnet.
2. Create an IOU with another Mainnet Pioneer.
3. Counterparty accepts or declines.
4. For accepted IOUs, debtor can claim payment and creditor can confirm settlement.
5. Verify partial-settlement claims and creditor confirmation/rejection.
6. Open Activity Center and verify timeline, shared notes, remaining amount and settlement receipt.
7. Confirm one user cannot access another user's unrelated IOU.
8. Verify the optional `Support IIOU` payment is clearly separated from personal IOU settlement.
9. Confirm no Testnet badge, sandbox mode, simulator or fake Pioneer record is exposed.
10. Verify `/api/health` reports storage and `PI_API_KEY` readiness without exposing secret values.

## Pre-listing polish

- Produce Mainnet-specific hero and 3–5 professional preview images.
- Do not include Testnet validation UI in listing assets.
- Review all mobile layouts in Pi Browser.
- Test with a small number of real Pioneer accounts before broader promotion.
- Add API abuse/rate limiting before materially increasing traffic.
- Revisit concurrent state-transition protection if usage grows beyond low-volume community testing.

## Safety rules

- Never commit wallet seeds, passphrases, API keys or Redis tokens.
- Never reuse the Testnet validation key.
- The current U2A support payment does not require the App Wallet seed in Vercel.
- Do not enable A2U Mainnet until there is a product-justified payout/reward use case and the app is eligible.
- Do not represent an IIOU settlement record as proof of a blockchain transfer unless a future feature explicitly verifies that transaction.

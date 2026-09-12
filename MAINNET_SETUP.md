# IIOU Mainnet setup checklist

## Pi Developer Portal

- Create a separate Mainnet app named IIOU.
- Pair it with the existing IIOU Testnet app.
- Use a dedicated Mainnet App Wallet.
- Generate and store a dedicated Mainnet API key.
- Set the Mainnet app/development URL to the dedicated Mainnet deployment.
- Set Privacy URL to `/privacy.html` and Terms URL to `/terms.html`.
- Copy the Mainnet validation key into `validation-key.txt` only after the portal provides it.

## Hosting

- Create a new Vercel project connected to `Giulex84/Iioumainnet`.
- Connect persistent Redis/Upstash storage.
- Do not reuse Testnet secrets blindly.
- If the same Redis instance is reused, Mainnet remains isolated by the `iiou-mainnet:` key prefix.
- Configure Mainnet-only environment variables.

## Functional review

1. Sign in with Pi Mainnet.
2. Create an IOU with another Mainnet Pioneer.
3. Counterparty accepts or declines.
4. For accepted IOUs, debtor can claim payment and creditor can confirm settlement.
5. Open Activity Center and verify timeline, notes, partial-settlement flow and settlement receipt.
6. Confirm one user cannot access another user’s unrelated IOU.
7. Confirm no Testnet badge, sandbox mode, simulator or fake Pioneer record is exposed.

## Safety rules

- Never commit wallet seeds or API keys.
- Never reuse the Testnet validation key.
- Do not enable A2U until a product-justified Mainnet use case is explicitly designed and reviewed.
- Do not expose a payment feature merely to satisfy a checklist; the core ledger must remain honest about whether a blockchain transfer occurred.

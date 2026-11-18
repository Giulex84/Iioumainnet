# Group splits and private request links

IIOU can split one shared expense into 2–12 private bilateral shares. The creator enters a title and optional due date. The optional equal-share calculator takes the total to collect from other participants, excluding the creator, and their Pi usernames. It distributes the exact total in 0.0000001 Pi units and allows each amount to be reviewed or edited before submitting the existing `PiUsername amount` rows.

Each share is stored as a normal IIOU agreement with its own identifier, participant authorization, acceptance, reminders, partial-payment confirmations, settlement flow and closure flow. Shares carry common `split` metadata (`groupId`, title, total and participant count), but one participant cannot read another participant's agreement.

The returned total is informational and is calculated from the submitted shares. IIOU does not custody or route funds. Creating a split never initiates a Pi payment.

Agreement links use `/details.html?id=<agreement-id>`. Links contain no token or secret and do not bypass Pi authentication. The server returns the record only when the authenticated Pioneer is the creator or counterparty.

Mainnet exposes `POST /api/splits` with server-side Pi identity verification, validation, duplicate-participant rejection, rate limiting and existing metric hooks. Current analytics collect successful logins only; the split hook does not add analytics events.

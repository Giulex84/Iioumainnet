# Optional Pi Notification Center integration

Users explicitly enable notifications in the authenticated settings card on either page. Normal login scopes are unchanged. The server verifies the token with Pi /me and requires the in_app_notifications scope to enable. Disabling requires only the normal verified session. Preferences use separate UID-scoped keys.

After saving a new agreement, split share, acceptance/decline, settlement or partial-payment confirmation request/result, closure request/result or explicit reminder, the server may notify the other registered participant. Recurring proposals are included. No retroactive notifications are sent for old records. Unknown recipients cannot be notified until they have registered and enabled notifications; proposals remain available normally.

Messages contain only IIOU and generic update text, with an authenticated /details.html?id= link. No amounts, notes or usernames. Notification language is currently English. UI settings support all eight app languages.

Server API: https://api.minepi.com/v2/in_app_notifications/notify; existing PI_API_KEY, never exposed to the browser. No new secrets or cron jobs. Recipient preference plus Pi consent are required. Pi may suppress delivery. API failure/timeouts do not roll back or fail saved agreements. No automatic retry after ambiguous delivery: temporary delivery loss is possible. Daily cap 12 per recipient; deduplication reservations expire after seven days. Existing manual-reminder cooldown remains 72 hours. No scheduled due-date reminders in this release.

Validation: run npm run test:release with REDIS_TEST_SERVER pointing to a local Redis executable. Real Pi delivery must be verified by two consenting participants on Pi Browser; automated tests use a mock Pi endpoint, never send real messages. Portal listing and approval state are unchanged.

References: https://developers.minepi.com/docs/api-reference/PlatformAPI and https://developers.minepi.com/docs/api-reference/SdkReference

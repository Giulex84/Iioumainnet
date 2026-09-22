# English and Simplified Chinese interface

The Mainnet dashboard and Activity Center support English and Simplified Chinese (`zh-CN`). The language control is injected by `i18n.js`, persists the preference in local storage under `iiou-language`, and never changes agreement data, usernames, amounts, network configuration or API payloads.

English is the default. Selecting `简体中文` reloads the current page and translates static controls, forms, lifecycle labels, common due-date messages and dynamically rendered activity content. Testnet and Mainnet use the same interface dictionary while retaining their own Pi SDK sandbox setting, repository, deployment and storage namespace.

User-entered notes are never translated or sent to a translation provider. Privacy and legal meaning must not be inferred from machine translation; the canonical policy text remains the English version committed in the repository.

# CIoTA Nigeria membership prototype

A stakeholder-facing React + Vite demonstration for the Chartered Institute of Transport Administration of Nigeria. The app uses fictional records and browser-local demo state.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Choose **Demo access** and select an applicant, member, or administrator workspace. No password is needed.

## Demo flows

- Applicant: select **Applicant**, open **My Application**, complete the form, and submit it.
- Administrator: select **Administrator**, review the new application, and approve or reject it. Approval creates a linked member record.
- Member: select **Member**, view the member card and profile, request a renewal, and record a simulated payment.
- Member: open **Elections** to review upcoming, open, and closed elections. A member must have active, unexpired membership and paid applicable dues to vote in the seeded elections.
- Applicant and member: open **Billing** to view assigned charges, simulate pending/successful/failed/cancelled payment outcomes, and print a demo receipt after success.
- Administrator: review renewals, manage elections and candidates, inspect aggregate voter eligibility and turnout, publish permitted results, search charges and transactions, reconcile pending demo transactions, and reset demo records from settings.

Demo data persists in `localStorage` for this browser. Use **Workspace settings → Reset demo data** to restore the seed records.

## Verification

```sh
npm run build
npm run lint
```

Authentication and role checks are client-side demonstrations, not production security. Payments, document uploads, email, SMS, and notifications are not connected to external services. Do not enter real personal or sensitive information.

## Voting and payment prototype limits

Election participation records (election and voter identity) are stored separately from ballot selections. The UI, audit trail, and reports do not show a voter-to-choice mapping. Ballots and participation are still held in browser `localStorage`; this is not cryptographic anonymity, a tamper-resistant ballot box, or a production election service. A real election requires a secure backend, server-side identity and eligibility checks, carefully reviewed secret-ballot storage, independent security testing, and appropriate election audit controls.

The payment adapter is simulated and uses fictional NGN charges. It never requests or stores card numbers, CVVs, PINs, or other payment credentials. No live payment provider is connected. A production payment integration must create transactions through a backend and verify signed provider callbacks/webhooks server-side before marking a charge paid; a client-side success redirect must not be trusted.
"# ciotaportal" 

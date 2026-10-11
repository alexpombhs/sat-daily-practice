# PR #57 LA operator deployment checklist (first implementation)

**Do not open public registrations until this checklist is verified.**

## Launch mode (operator controlled)
The migration `20261011180000_operator_launch_mode.sql` creates a single launch configuration row with **closed** as the default. Once the operator has approved opening LA, update the row to `launch_mode='la'` and `capacity=100` through an authorized admin database action. GA is `launch_mode='ga'`; the trigger remains installed, but allows enrollment beyond the LA cap. Do not expose configuration updates to regular users.

## Waitlist removal and invitations
The `sat-waitlist-unsubscribe` function accepts a private token embedded in invitation emails; deploy with JWT verification disabled. The token is specific to a waitlist row and allows only removal.
`sat_claim_waitlist_invite` now returns the unsubscribe token for the email. Apply the migrations in filename order, including the `20261011181000` and `20261011182000` additions.


## Current implemented LA / GA architecture
- LA capacity is **100 confirmed users**, plus short-lived 24-hour provisional signup holds and invitation reservations. Pending users do not occupy a seat forever. Operator-configured LA capacity remains 100 by default; GA lifts the limit.
- Registration stays **closed** until an operator explicitly enables it. The Auth hook rejects users below 13, including direct API signups. Birthdates are stripped from persisted Auth metadata after signup.
- Joining the waitlist requires a CAPTCHA and 13+ eligibility. Resend sends an email-confirmation link. Invitations are sent only to verified waitlist addresses, reserve a place for 24 hours, and include an opt-out link. Confirmation and unsubscribe links require a deliberate button press to protect against email-scanner prefetching.
- `.github/workflows/la-waitlist-invitations.yml` schedules the operator invite endpoint every 15 minutes after the workflow secrets are configured and merged into the default branch.
- Free accounts receive **two random ten-question sessions each UTC calendar day**. Server-side counters resist user deletion of prior sessions. Free history is discarded when leaving session feedback; `sat_cleanup_launch_data` can remove older free records.
- Plus access uses one Stripe `mode=payment` checkout for **$10 / 90 days**, no recurring subscription. Signed Stripe webhooks grant idempotent, consecutively stackable passes. The app and database enforce entitlement limits.
- Payment remains disabled until `LA_CHECKOUT_ENABLED=true`, `SAT_CONTENT_RIGHTS_APPROVED=true`, and `SAT_LEGAL_APPROVED=true` are set on the backend. The frontend `VITE_CHECKOUT_AVAILABLE=true` is an additional presentation switch, not a security boundary.
- Canonical question edits and the editing-enable toggle are restricted to accounts explicitly registered in `sat_content_admins`; operator grants role only after reviewing the user ID.

## Required operator secrets and launch settings
**Supabase Edge secrets:** `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `LA_FROM_EMAIL`, `LA_OPERATOR_SECRET`, `LA_APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_LA_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.
**Payment approval flags:** `LA_CHECKOUT_ENABLED`, `SAT_CONTENT_RIGHTS_APPROVED`, `SAT_LEGAL_APPROVED`.
**Frontend build:** `VITE_TURNSTILE_SITE_KEY`, `VITE_CHECKOUT_AVAILABLE`, `VITE_OPERATOR_NAME`, `VITE_SUPPORT_EMAIL`, `VITE_LEGAL_APPROVED`.
**Operator monitoring:** `select public.sat_operator_launch_metrics();` from a privileged SQL session yields aggregate-only registration, waitlist, and paid-access indicators.
**GitHub Actions secrets:** `LA_INVITE_FUNCTION_URL`, `LA_OPERATOR_SECRET`.
Configure Stripe to deliver `checkout.session.completed` and `charge.refunded` to `sat-stripe-webhook` with the correct signing secret. Do not put Stripe secret keys or operator secrets in the frontend.

## Data retention
`public.sat_cleanup_launch_data()` is a service-role-only maintenance routine. Suggested implementation defaults: free completed/abandoned sessions 48 hours, unverified waitlist 7 days, old invited waitlist 30 days, verified waiting entries 180 days, and free daily quota counters 31 days. Schedule the `sat-launch-maintenance` operator endpoint at least daily using an approved server-side scheduler. Operator must review retention against legal requirements before deployment.

## 1. CI and staging
- Confirm PR checks `npm test` and `npm run build` pass.
- Apply the SQL migrations from PR #57 in a **staging project** before production.
- The current capacity trigger counts ALL existing `auth.users`, including unconfirmed users. It is not a confirmed-user reservation mechanism.
- Test registration with 99/100/101 users, simultaneous attempts, deletes, email confirmation and direct Auth API calls.
- Confirm Auth hook is enabled under Supabase Authentication > Hooks > Before User Created: `public.sat_before_user_created`. A migration does not enable this automatically.
- Verify the auth hook accepts exactly 13 years old and rejects younger users, including leap-day birthdays.
- Enable email confirmation, appropriate Supabase Auth rate limits, CAPTCHA on signup, and leaked-password protection in Supabase settings. Frontend CAPTCHA token is implemented, but provider configuration and live enforcement must be verified.
- Test student data access with two accounts, and run security/performance advisors.

## Public waitlist anti-bot setup
- Provision a Cloudflare Turnstile site key and secret in a real domain/site configuration.
- Set frontend environment variable `VITE_TURNSTILE_SITE_KEY` and Edge secret `TURNSTILE_SECRET_KEY`.
- Deploy `sat-waitlist-register` with `verify_jwt = false`; it validates the Turnstile response server-side before writing the waitlist.
- Deploy `20261011173000_protect_waitlist_rpc.sql` so users cannot directly bypass CAPTCHA via the public waitlist RPC.
- Load-test and add edge/provider rate controls for IP, account, and email abuse before public LA.
- Ensure the challenge works on mobile Safari and privacy-focused browsers.
- Signup frontend now passes the Turnstile challenge response as Supabase Auth `captchaToken`. Enable and configure the same CAPTCHA provider in Supabase Authentication security settings; otherwise enrollment may be blocked or unprotected. Test against direct Auth API.

## 2. Account deletion
Deploy `supabase/functions/sat-delete-account` with JWT verification enabled and with server-side service-role secret. The browser must never receive the service-role key.
- Test with disposable users. Verify deletion of Auth user and all SAT tables that reference auth.users; verify storage and external logs/analytics separately.
- Test deleting one user does not delete another user's records.
- Document any remaining backup retention and user-support procedure.

## 3. Waitlist invitation emails
Deploy `supabase/functions/sat-waitlist-invite` with JWT verification enabled and configure secrets:
- `LA_OPERATOR_SECRET`: strong random operator-only secret; never embed in frontend.
- `RESEND_API_KEY`: server-side transactional email API key.
- `LA_FROM_EMAIL`: verified sending address/domain.
- `LA_APP_URL`: HTTPS app origin.

Invoke by trusted operator action only. Send one queued invitation per invocation. Verify the provider response and recipient in staging. This flow is *not* a reserved-spot mechanism, and must not be described as such. Do not allow untrusted clients to invoke it. Retry behavior and concurrency de-duplication are not fully implemented; use one operator at a time for the first LA.

## 4. Privacy and launch approval
- Obtain operator-reviewed privacy and terms text with a real contact address, delete/retention policy, payment disclosures when relevant, minors privacy requirements and data collection inventory.
- Obtain permission/license for copyrighted official SAT practice questions, images, passages, answer keys and explanations where required. Public PDFs are not sufficient proof of commercial redistribution rights.
- Complete mobile/tablet cross-device QA, load test, backups, monitoring, user data deletion and incident handling.
- Migrate to production only once all blockers pass. Do not change production Supabase just because PR is green.

## Current verification status
At first live inspection, project `gnhmfhvvirpgawijsrej` has two confirmed users, none of the PR #57 migrations installed, and Supabase security advisor flags leaked-password protection as disabled.

## Prepaid early-adopter access (PayPal / Venmo / other)
Students **do not enter a payment account, transaction screenshot, or personal payment details inside the app**. An eligible adult/business operator handles payment arrangements and verifies receipt using the provider's official records. Do not publish personal Venmo/PayPal handles aimed at minors or treat an unverified payment message as proof of payment. Follow provider age rules and applicable commercial/privacy laws.

After a confirmed, non-duplicate payment, the operator invokes `sat-issue-prepaid-code` with the private `LA_OPERATOR_SECRET` header and JSON:
```json
{"provider":"paypal","paymentReference":"verified-provider-transaction-id","operator":"Authorized operator"}
```
Use `venmo` or `other` as appropriate. The response contains one human-readable `SAT-XXXXXX-XXXXXX-XXXXXX` code, **shown only once**. Deliver it to the payer using an approved private channel. The database retains only a salted-independent SHA-256 digest of the high-entropy token, issuing metadata and the associated payment reference. A duplicate payment reference is rejected.

The user signs in to **their own account**, enters the code on the Account page, and gets 90 days of Plus access. The code cannot be reused, is initially redeemable for 90 days after issuance, and **does not automatically renew**. An additional purchased code adds 90 days after any existing active pass expires.

The code issuance tool is intentionally not exposed to regular users or browsers. The operator should define refund, dispute, transaction retention, and manual revocation procedures before opening paid access. The code workflow complements (but does not require) the Stripe hosted checkout; keep Stripe disabled if only prepaid codes are offered.

## Session separation across environments
Localhost and the published GitHub Pages URL are different browser origins. Supabase Auth already stores sessions per browser origin; the app additionally assigns an explicit origin-scoped storage key. **Both still connect to the same production Supabase project** unless you set a different `VITE_SUPABASE_URL` and publishable key for local development. Account credentials, profiles and practice history belong to the same backend account when you sign in as the same person on both; sign in using two different existing accounts to maintain independent progress. A separate Supabase staging project is recommended for development data isolation.


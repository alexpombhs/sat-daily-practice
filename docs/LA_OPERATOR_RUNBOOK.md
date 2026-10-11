# PR #57 LA operator deployment checklist (first implementation)

**Do not open public registrations until this checklist is verified.**

## 1. CI and staging
- Confirm PR checks `npm test` and `npm run build` pass.
- Apply the SQL migrations from PR #57 in a **staging project** before production.
- The current capacity trigger counts ALL existing `auth.users`, including unconfirmed users. It is not a confirmed-user reservation mechanism.
- Test registration with 99/100/101 users, simultaneous attempts, deletes, email confirmation and direct Auth API calls.
- Confirm Auth hook is enabled under Supabase Authentication > Hooks > Before User Created: `public.sat_before_user_created`. A migration does not enable this automatically.
- Verify the auth hook accepts exactly 13 years old and rejects younger users, including leap-day birthdays.
- Enable email confirmation, appropriate Supabase Auth rate limits, CAPTCHA on signup, and leaked-password protection in Supabase settings. This repo does not configure provider CAPTCHA tokens yet.
- Test student data access with two accounts, and run security/performance advisors.

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

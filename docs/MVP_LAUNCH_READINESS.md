# MVP readiness and launch gates

Status: **NOT approved for public launch**. This document is a release checklist, not a legal compliance certification.

## Age screening (implemented in this PR; requires activation)
- [x] Neutral date-of-birth entry shown only during signup.
- [x] Frontend checks valid DOB and 13th birthday boundary.
- [x] Server-side Supabase Before User Created Postgres hook supplied as migration.
- [x] Hook denies missing/invalid/under-13 birthdates for any signup client **when enabled**.
- [ ] Merge PR and confirm migration was applied successfully in production.
- [ ] Supabase Dashboard > Authentication > Hooks > Before User Created: enable **Postgres** function `public.sat_before_user_created`. GitHub migration alone **does not enable this**.
- [ ] Test age 12, exactly 13, age 17, age 18, invalid/missing DOB, and a direct Auth REST signup bypassing the React form.
- [ ] Document and review what birthdate is stored in Supabase Auth user metadata; implement retention/deletion rules before public signup.
- [ ] Confirm alternative auth methods, anonymous signup, and invitations cannot bypass restrictions.
- [ ] Define a procedure for identifying/removing ineligible accounts.

## 100-seat LA registration (implemented in code; not yet production verified)
- [x] Database trigger serializes account creation and refuses a 101st Auth account, including direct Auth API use.
- [x] Existing Auth accounts count against the 100-account limit (conservative; includes unconfirmed accounts).
- [x] Protected waitlist table: public clients cannot read email addresses.
- [x] Waitlist RPC validates 13+ eligibility without persisting the submitted birthdate.
- [x] Frontend provides waitlist signup when capacity is reached.
- [ ] Test 99-to-100 and 100-to-101 account boundaries and simultaneous signup requests.
- [ ] Test behavior with preexisting Auth accounts, abandoned/unconfirmed registrations and deleted accounts.
- [x] Cloudflare Turnstile frontend challenge and server-side verification added to waitlist; direct public RPC bypass revoked.
- [x] Signup challenge token wired to Supabase Auth.
- [ ] Configure CAPTCHA in Supabase and provider keys; test real production rejection of malicious and direct API requests, set rate limits.
- [x] First draft operator-triggered invite email Edge Function committed; requires verified sender, server secrets, deployment and end-to-end testing.
- [x] Atomic claim/release flow for operator-triggered invitations; provider idempotency key included.
- [ ] Implement guaranteed seat reservation and automatic scheduling if needed; invitations currently do not reserve a place.
- [ ] Confirm email-provider idempotency and invitation retry behavior in staging.
- [ ] Define waiting-list retention, opt-out and deletion process and disclose in privacy notice.
- [ ] Prevent non-signup Auth creation flows (admin imports/invites) from exhausting capacity unexpectedly.
- [ ] Review count policy before GA (the database trigger must be explicitly removed/disabled to exceed 100).

## Core product release blocking
- [ ] Cross-device account/history/settings/resumable session persistence tested.
- [ ] Default 10 questions/session remains consistent after refresh and device changes.
- [ ] Failed questions remain in review until configured correct-repetition count.
- [ ] Question modes: all = canonical only, new only, failed only, targeted mock separate.
- [ ] Audit canonical question content, answer keys, explanations, visuals, math/LaTeX formatting, and content repairs in Supabase.
- [ ] Dashboard goal, streak, calendar, review credit, predicted score calculations verified against known test fixtures.
- [ ] All breakpoints tested with real accounts on phone/tablet/laptop/desktop.
- [ ] No error leakage, failed deployment, or silent data loss; build and tests green.
- [ ] Two-account RLS negative tests for attempts, sessions, settings, profiles and question edit permission; check unrestricted canonical question write policy.
- [ ] Rate limits, database quotas, recovery/backup and error monitoring reviewed.
- [x] First draft confirmed-delete UI and authenticated Edge Function committed.
- [x] Feedback foreign key switched to ON DELETE CASCADE in pending migration.
- [ ] Deploy and verify full deletion of Auth record, SAT rows, sessions, storage and external provider data.

## Privacy, IP and commercialization release blocking
- [ ] Counsel/adult operator review whether the service is general-audience, mixed-audience, or child-directed; age screening is not by itself COPPA compliance.
- [ ] Operator-approved Privacy Notice detailing personal information, Supabase hosting/processors, email, usage analytics, retention, rights, contact and account deletion.
- [ ] Operator-approved Terms of Use with proper entity/contact, limits, disclaimers and payment terms before charging.
- [ ] Mechanism to delete account and personal practice history from Auth and all relevant tables; test deletion end-to-end.
- [ ] Data minimization: reconsider collecting school, guardian identity/email, free-text bio and full DOB when not essential.
- [ ] Verify state laws for minors and marketing/analytics, including jurisdiction of launch audience.
- [ ] Audit original/official SAT question provenance, copyright/licensing, branding/trademark and non-affiliation disclosure.
- [ ] Confirm adult-operated payment provider, refunds, taxes, billing cancellation and subscription disclosures before charging.
- [ ] Security and legal signoff before opening registrations beyond private testing.

## Alpha success gates
- [ ] Recruit 20-30 consenting 13+ students under appropriate privacy protections.
- [ ] Measure first-session completion, 4+ practice days in first week, 7-day retention and qualitative feedback.
- [ ] Test willingness to pay without misleading checkout or collecting payment until policies are ready.

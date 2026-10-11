# MVP LA / GA launch preparation

## Phase 1 — implementation

This checklist records code and configuration contracts. Quality assurance is deliberately tracked separately in `docs/QA_LA_GA_TEST_PLAN.md`.

### Signup and launch admission
- [x] Display the age 13+ requirement and validate date of birth before asking for email or password.
- [x] Supabase Before User Created age hook rejects invalid/under-13 registrations from any signup client.
- [x] Strip full birthdate from persisted Supabase Auth metadata after registration.
- [x] Operator-controlled closed, LA, GA launch mode (closed by default).
- [x] LA counts 100 confirmed accounts plus expiring 24-hour pending-signup and invitation reservations; no permanent seat consumption for abandoned confirmations.
- [x] GA mode removes the LA user-cap restriction.

### Waitlist and email
- [x] Age-first waitlist, CAPTCHA and server-side Turnstile verification.
- [x] Email-address confirmation and resend cooldown before invitations.
- [x] Automatic FIFO invitation claims with transactional 24-hour reservations and idempotency headers.
- [x] GitHub Actions scheduled operator invitation delivery every 15 minutes.
- [x] One-click confirmation UI for email and unsubscribe links (no state change on automatic GET preview).
- [x] Waitlist unsubscribing deletes email record and releases its reservation.

### Free and one-time Plus
- [x] Free: two random 10-question practice sessions per UTC day; no configuration controls.
- [x] Server-side free quota ledger is independent of session deletion.
- [x] Free users retain immediate feedback; history is removed when leaving results and by data-retention cleanup.
- [x] Plus: unlimited sessions, configurable practice, study plan and performance dashboard.
- [x] One-time $10 USD Stripe hosted checkout for a 90-day pass; no recurring charge.
- [x] Signed Stripe webhook provisions server-controlled expiring entitlements; purchase retries are idempotent and consecutive passes stack.
- [x] Checkout disabled until operator confirms legal and content licensing approvals.

### Privacy and content administration
- [x] Account deletion control and authenticated server-side deletion.
- [x] Cascade linked per-user practice tables and feedback with Auth user deletion.
- [x] Optional display name is the only remaining editable profile detail; historical optional school/guardian/bio data is removed by migration.
- [x] Privacy and Terms pages in the app, currently identified as drafts.
- [x] Private content-editor roles and protected canonical question-edit controls.
- [x] Operator cleanup functions for free-session and waitlist retention.

### Non-code operator dependencies (not representable as completed implementation)
- [ ] Name the legal/adult operator and publish a genuine support email.
- [ ] Approve and finalize Privacy Notice, Terms and refund terms.
- [ ] Resolve rights to use official SAT passages, visuals, answer keys and related content in this product; checkout remains disabled until authorized.
- [ ] Provision Stripe, Resend, Turnstile and Supabase keys/secrets, enable Auth hook and Auth security options, and designate authorized content admins.
- [ ] Configure GitHub Actions secrets and enable LA access in the launch config when opening enrollment.

## Phase 2 — quality assurance
All operational, user-experience, security, data-deletion, end-to-end, concurrent enrollment and device acceptance work is tracked **separately** in `docs/QA_LA_GA_TEST_PLAN.md` and is not part of this Phase 1 implementation report.

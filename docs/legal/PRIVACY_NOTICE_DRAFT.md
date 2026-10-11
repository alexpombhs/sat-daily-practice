# Privacy Notice — DRAFT (not legal advice; do not publish without operator review)
Effective date: [TO BE SET]
Operator: [LEGAL ENTITY / ADULT OPERATOR]
Contact: [SUPPORT EMAIL]

SAT Daily Practice is an independent study tool for users age 13 or older. We collect account email, age eligibility information, practice answers, session history, learning settings, and optionally profile fields such as display name and school. Age eligibility is checked before signup credentials are requested. The birthdate is transmitted to the Supabase Auth hook for validation, then stripped from stored Auth user metadata by an insert-time database trigger. Operators must verify log and backup retention.

We use data to authenticate accounts, sync progress, show recommendations and operate the service. Our infrastructure providers include Supabase for account/practice data, Cloudflare Turnstile for signup security checks, and Resend for waitlist email communications. If payments are enabled, Stripe handles the hosted one-time checkout. Disclose hosting, analytics, logs and processors actually in use before publishing. Do not claim encryption, retention durations or third-party sharing terms without verification.

Waitlist: email and eligibility response are submitted to determine access to limited availability. The waitlist stores email, verification and invitation timestamps, and private confirmation/removal tokens, not birthdate. Students must confirm ownership of their email before they receive invitations. One-click removal deletes their waitlist record and any unredeemed reservation. Users must have a method to request waitlist removal at [SUPPORT EMAIL].

Users can request data access, correction and account deletion through the account screen or [SUPPORT EMAIL]. Verify cascading deletion and backup retention before launch. We do not intend to sell personal data or deliver targeted advertisements. Review applicable state minors' privacy and consumer rights laws before inviting users.

This product is not affiliated with College Board. The operator must provide jurisdiction-specific privacy disclosures, contact details, children's privacy classification, retention schedules and legal review before GA/LA.

# Supabase Auth: branded confirmation email

Subject: **Confirm your SAT Daily Practice account**

1. Open the Supabase project dashboard > Authentication > Email Templates > Confirm signup.
2. Paste the HTML from `docs/email/confirm-signup.html` and save. Keep the Supabase variable `{{ .ConfirmationURL }}` unchanged because it contains the verification link.
3. Test the link target and configure Authentication > URL Configuration: Site URL and permitted redirect URLs for both localhost and the GitHub Pages origin.
4. To change the visible sender from Supabase Auth to **SAT Daily Practice**, configure Supabase Authentication > SMTP Settings with a verified sending domain/provider. Set sender name to **SAT Daily Practice** and a verified From address.
5. Do not invent a From address: the real sending address must be approved and verified by the operator's provider. The template by itself does not change `noreply@mail.app.supabase.io`.

Only the template is committed in PR #57. Supabase Auth email templates and SMTP settings are hosted configuration, not GitHub repository files, and have not been changed on the live project.

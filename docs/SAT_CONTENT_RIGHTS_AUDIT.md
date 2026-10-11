# SAT content copyright and licensing review — OPEN / NOT CLEARED
Current code identifies College Board SAT practice tests 4–7 and proxies their PDFs at `supabase/functions/sat-question-source/index.ts`. Canonical question content is stored and edited in Supabase. The presence of publicly readable PDFs does not establish permission to reproduce, redistribute, transform or commercially sell the questions.

Before any external LA/GA launch:
- Inventory every question, explanation, image, figure, passage, word problem and source PDF; map each to source and permission.
- Distinguish truly original content vs SAT-style generated examples vs official College Board questions.
- Obtain explicit licensing/authorization where required or remove restricted material from the commercial product.
- Review copyright, terms of source distribution, trademark/name/logo usage and educational fair-use arguments with counsel.
- Test end-to-end that removed content cannot still appear through cache, PDF proxy, database or local app bundles.
- Do not market official practice questions or score guarantees without permission/evidence.

**No content is marked cleared by this audit draft.**

## Implemented licensing guard
The database now includes `sat_question_bank.commercial_rights_status`, `commercial_rights_basis`, and `commercial_rights_reviewed_at`. All existing canonical questions default to **unverified**, not original or licensed.
The Stripe checkout function requires all canonical database questions to have documented operator approval as either `original` or `licensed`, as well as the server-side `SAT_CONTENT_RIGHTS_APPROVED` and `SAT_LEGAL_APPROVED` flags. Checkout is fail-closed.

The operator must additionally audit bundled question metadata, local PDFs/proxies, passages, visuals, generated targeted practice and explanations; per-row database clearance alone is not proof of rights for every asset. Mark individual rows as commercially cleared only after verified original authorship or permission.

As of this implementation, **no College Board content permission has been established**, so enabling paid checkout would be premature.

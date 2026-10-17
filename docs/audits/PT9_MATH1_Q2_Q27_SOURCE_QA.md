# PT9 Math Module 1 — Q2–27 PDF source audit

Date: 2026-10-17. Scope deliberately limited to Q2–27. Input sources: the newly attached 56-page PT9 question PDF and 47-page PT9 answer-explanation PDF.

## Source and explanation geometry smoke-test

Audited each canonical record's `source_page` and `source_crop` against the corresponding page in the newly attached question PDF. Checked that each crop begins with its question number and contains extractable text, that every multiple-choice item includes A, B, C, and D answer labels, and that the recorded explanation page contains the matching `QUESTION N` heading.

- 26/26 source crops passed these text-geometry checks.
- 26/26 recorded explanation pages contain the expected numbered explanation.
- 19/19 multiple-choice items show A/B/C/D labels inside the source crop.
- 7/7 student-produced-response questions contain text inside the crop.
- Existing `sat_question_difficulty` concept tags are present for 26/26.

**This audit does not establish complete parsing or quality approval.** In particular, text extracted from the PDF flattens fractions, powers and math layout; graphic items Q12, Q14, Q17 and Q26 require individual visual and semantic checks, as do multiline equations. Explanation images must be cropped from the answers PDF in the browser, not transcribed to `explanation_lines`. Production UI checks are pending.

The canonical Supabase rows for Q2–27 remain `content_status='metadata'` and `question_lines=NULL`. Do not report any of them as fully parsed or verified solely based on this audit. No PR requested.

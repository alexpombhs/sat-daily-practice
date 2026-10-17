# Practice Test 8 — Source and QA release gate

Status: **staging / not imported**. Do not expose PT8 in normal practice until all per-question checks are complete and content-use rights are reviewed.

## Source manifest
- Question source: `sat-practice-test-8-digital.pdf` (56 PDF pages).
- Answer/explanation source: `sat-practice-test-8-answers-digital.pdf` (48 PDF pages).
- Scoring source: `scoring-sat-practice-test-8-digital.pdf` (5 PDF pages).
- Canonical practice-test identifier: `practice-test-8`.
- **No copyrighted question text, tables, diagrams, or explanation crops are committed to this public repository.**
- Confirm commercial-use rights before any publication/import of College Board-derived question content.

## Module inventory and review order

| Module | Expected questions | QA complete | Verified in Supabase |
| --- | ---: | --- | --- |
| Math Module 1 | 27 | No | 0 |
| Math Module 2 | 27 | No | 0 |
| Reading & Writing Module 1 | 33 | No | 0 |
| Reading & Writing Module 2 | 33 | No | 0 |
| **Total** | **120** | **No** | **0** |

For each module, report `total/imported/verified/flagged/visual/multi-visual/table/lint-failing` and supply question-level exceptions. Advance only when the current module's questions have been checked individually.

## Mandatory question QA

Follow `docs/PRACTICE_TEST_PARSING_STANDARDS.md` and `docs/NEW_PRACTICE_TEST_IMPORT_CHECKLIST.md` without creating a PT8-specific renderer.

1. Verify section/module/question identity, source page and answer/explanation page.
2. Reconstruct semantic passage, question stem, ordered choices, intentional paragraph breaks, and bullets.
3. **Underline:** whenever the stem refers to an underlined portion, ensure a real explicit underlined span exists in `question_lines`; compare start/end boundaries with PDF, and validate both editor and student renderer.
4. **Tables:** represent ordinary data tables as `[TABLE]` rows with `|` separators; assert header, values, and order; ensure markers aren't student-visible.
5. **Math:** use KaTeX-compatible LaTeX and visually verify powers, radicals, fractions, degree symbols, dollar currency, inequalities, grouping, and delimiter balance.
6. **Graphs/diagrams:** use separately registered `visual_specs` for genuinely graphical regions, including `choice-grid`; verify crop bounds, labels, and `afterLine` placement. Do not flatten or duplicate graph labels in extracted text.
7. Validate response type, official key (including every accepted student-produced answer), and the correct explanation-page crop.
8. Compare production-rendered question with the PDF at desktop and narrow viewport sizes.
9. Persist canonical `question_lines`, answer metadata, and ordered visuals in Supabase; **read back** every saved repair before declaring success.
10. Never mark `verified` for empty text or unresolved lint; never fall back to another practice test.

## Stage and release policy

- On an authorized import, initialize questions at `metadata` or `imported`, **not `verified`**.
- Use `commercial_rights_status` and `commercial_rights_basis` to record documented permission; absence of permission is not confirmation of rights.
- Keep question passages and other protected content out of committed code, migration SQL, public fixture files, and PR descriptions.
- A PT8 release requires all 120 individual QA checks, no blocking audit issues, successful Supabase round-trip checks, unit tests, and the production build.

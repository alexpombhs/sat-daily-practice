# Practice Test 8 — Source and QA release gate

Status: **module-by-module import underway**. Keep question content canonical in Supabase and verify each question before treating its reconstruction as complete.

## Source manifest
- Question source: `sat-practice-test-8-digital.pdf` (56 PDF pages).
- Answer/explanation source: `sat-practice-test-8-answers-digital.pdf` (48 PDF pages).
- Scoring source: `scoring-sat-practice-test-8-digital.pdf` (5 PDF pages).
- Canonical practice-test identifier: `practice-test-8`.
- Question content is imported into Supabase rather than bundled into the application code.

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
- Keep canonical question passages in Supabase instead of bundling them in the frontend.
- A PT8 release requires all 120 individual QA checks, no blocking audit issues, successful Supabase round-trip checks, unit tests, and the production build.


## Math Module 1 interim audit — 2026-10-17

The 27 canonical question reconstructions were queried from Supabase and compared to the uploaded PT8 Math Module 1 source pages 34–40. The corresponding answer explanations were checked for question headings on PDF pages 32–39. **This is not a production-renderer visual verification**; leave all questions `imported` pending actual render comparison.

| Question | Source PDF page | Explanation PDF page | Structural review |
| --- | ---: | ---: | --- |
| 1 | 34 | 32 | equation and choice order |
| 2 | 34 | 32 | four stacked fractions |
| 3 | 34 | 32 | graph crop and y-intercept labels; render check pending |
| 4 | 34 | 33 | powers and polynomial grouping |
| 5 | 35 | 33 | literal currency and margin-of-error values |
| 6 | 35 | 33 | numeric response and equation |
| 7 | 35 | 33 | numeric response and percentage |
| 8 | 35 | 33 | function notation |
| 9 | 35 | 34 | degree formatting fixed using KaTeX `^{\\circ}` |
| 10 | 35 | 34 | slope, intercept and coordinate notation |
| 11 | 36 | 34 | scatterplot and axes; render check pending |
| 12 | 36 | 35 | grouped exponential powers and inequality |
| 13 | 36 | 35 | system of equations; numeric response |
| 14 | 36 | 35 | powers and factoring |
| 15 | 37 | 35 | polynomial and graph; render check pending |
| 16 | 37 | 35 | product notation |
| 17 | 37 | 36 | stacked fractions |
| 18 | 37 | 36 | circle radii and area scale |
| 19 | 38 | 36 | fractions of π; explicit underline on 'degrees' |
| 20 | 38 | 37 | quadratic exponent and numeric response |
| 21 | 38 | 37 | currency, constraints and numeric response |
| 22 | 38 | 37 | simultaneous inequalities |
| 23 | 39 | 38 | explicit semantic frequency table and ordered cells |
| 24 | 39 | 38 | equation, conditions and roman-numbered claims |
| 25 | 39 | 39 | negative fractional choices and parabola |
| 26 | 40 | 39 | exponential models and roman-numbered choices |
| 27 | 40 | 39 | radical and accepted numeric response variants |

**Database result:** 27/27 question texts, 27/27 source crop references and 27/27 explanation page references stored; 3 figures referenced (Q3, Q11, Q15), 1 semantic table (Q23), 1 explicitly underlined span (Q19). No verified status promotion.

**Remaining visual QA:** Render every source crop and explanation crop in the real app and check that each shows the correct question only, not adjacent content; ensure three graph crops include complete axes and labels. Explain/question continuation handling needs extra checks where one explanation spans pages. Fix any rendering mismatches individually and read them back before marking verified.

**Resource efficiency:** Supabase stores only structured text, tiny crop coordinates, and metadata. The PDFs remain external; the frontend fetches at most one copy per practice test and PDF kind per cache version, caches in IndexedDB and memory, and renders visible crops locally rather than saving images into database rows. Avoid bulk PDF blobs, per-question Supabase source downloads, and repeated writes for unchanged records.


### Local source-crop visual pass

Rendered all **27 actual stored source-crop rectangles** from the uploaded official PT8 PDF (pages 34–40) as a contact sheet. Visually inspected the full sheet: each rectangle contains only its intended question; Q3, Q11 and Q15 include the full source graph and its labeled axes, and Q23 includes all table rows. This addresses the earlier adjacent-question screenshot caused by source/crop mismatch. This local PDF verification is **not** a completed live browser QA pass.

Confirmed the Math Module 1 answer PDF has question headings on PDF pages 32–39, and Q27 explanation continues onto PDF page 40. The production explanation renderer stitches continuations; verify their actual boundaries in the browser, especially Q3, Q4, Q17, Q23 and Q27. A correct explanation **page** is not itself proof of a correct explanation **crop**.

PT8 PDF cache should be reused once successfully fetched; do not disable caching while fixing stale content. No PDF binaries or per-question image blobs need to be persisted in the canonical question table.


### Local explanation-crop review

Rendered and reviewed a 27-item explanation contact sheet from the official answer PDF using the identified `QUESTION N` headings and page transitions. Every question 1–27 had its own correct heading. The continuation sections were included where the next question begins on a later PDF page, including Q3 (32→33), Q16 (35→36), Q19 (36→37), Q22 (37→38), Q24 (38→39), and Q27 (39→40). The current browser component derives these regions dynamically, so parity between this local inspection and the production renderer remains to be checked in-browser. Do not describe these as final verified application crops until that parity test is done.


## Math Module 2 — 2026-10-17 import and source crop audit

Canonical PT8 Math Module 2 Q1–Q27 imported into `sat_question_bank`, `practice_test_id='practice-test-8'`, `module='math2'`. Every record contains question text, source page, source crop, answer/explanation page, response type, and the official scoring-guide answer. Student-produced Q6, Q7, Q13, Q14, Q20, Q21 and Q27 are distinguished from multiple-choice questions. Q21 accepts both `1.8` and `9/5`.

Source PDF pages 44–50; explanation PDF pages 41–48. Matched source page-to-question mapping per page and rendered a source-crop contact sheet for **all 27** stored crop coordinates. Checked individual regions visually for correct question identity and absence of next-question bleed. Nontextual figures are separately represented in `visual_specs` for Q1 (line graph), Q3 (parallel-line angle figure), Q5 (right triangle), Q12 (right triangle), and Q19 (two dot plots). Q2 is a semantic `[TABLE]` and Q22 preserves explicit underlining on “not”.

### Module 2 QA status

| Check | Result |
| --- | --- |
| Canonical question text | 27 imported |
| Source crop references | 27 present; locally reviewed |
| Official answer metadata | 27 imported and read back |
| Explanation PDF page references | 27 present; headings mapped |
| Source diagrams | 5 figures registered |
| Data tables | 1 semantic table |
| Student-produced | 7 |
| Formatting concerns | Fractional powers, indexed radicals, systems and currency preserved in structured text |
| Production UI comparison | Pending |
| Explanation *crop* render verification | Pending |
| Status promoted to verified | 0 |

The original answer explanation remains an on-demand PDF crop in the existing Question Bank Explanation tab; no explanation text or PDF binary duplicated in Supabase. All records intentionally remain `imported` until final browser rendering and explanation-crop checks pass. Source-crop and explanation-page metadata are lightweight. A single source PDF is reused via browser cache rather than fetched/stored per question.

### Follow-up verification

1. Confirm the production app renders the correct PT8 PDF version for Math2 and reads these canonical rows.
2. Review each equation and figure at narrow and wide viewport sizes against the PDF.
3. Verify explanation crop headings and continuations per question (page references alone are insufficient).
4. Check the project's unit tests and build before promotion to `verified`.


## Reading & Writing Module 2 — 2026-10-17 import report

Imported **33/33 questions** into canonical `sat_question_bank` (IDs `practice-test-8:rw2-1` through `practice-test-8:rw2-33`). The import uses the official user-supplied PT8 question PDF pages 18–30, its answer explanations PDF pages 17–31, and the paper scoring guide's Reading & Writing Module 2 answer key. No question content or PDF binary is bundled in code; question text and tiny crop metadata are stored in Supabase.

- All 33 questions have nonempty semantic text, complete A–D answer choices, official answer-key letters, source-page references, explanation-page references, and per-question source crops. Supabase readback confirmed all 33 rows, four choices each, and `imported` status for all 33.
- Q14 and Q15 contain semantic tab-separated data tables supported by the shared Reading & Writing renderer (the previous `[TABLE]` format does **not** work in this renderer). Q14 has five language rows and three columns; Q15 has four study rows and four columns.
- Q7 preserves the individual lines of Bennett's poem. Q9 preserves two distinct passage labels, and explicit underline markup for the source's underlined term. Q32–Q33 preserve note bullets as distinct lines.
- Question-source crops for all 33 were rendered locally from the authoritative question PDF and inspected as two contact sheets. The crop boundaries preserve their target question, without pulling in the following question. Q15 needs the wider crop for its four-column table. Q32–Q33 crops stop before the PDF's `STOP` and footer decorations.
- The answer PDF's `QUESTION N` headings were located for all 33 items. Fourteen explanations cross an answer-page boundary: Q2, Q4, Q6, Q9, Q11, Q13, Q14, Q16, Q17, Q19, Q22, Q25, Q27, Q30.
- The shared explanation viewer was corrected to exclude page footers and avoid stitching the following module's question 1 after this module's Q33. Only explanation image-cache keys were versioned; official PDF bytes remain browser-cached, and no repeated per-question Supabase PDF downloads are required.
- **No new flags were introduced.** Existing `content_status='imported'` is retained until the application renderer is visually verified.

### Import-quality summary

| Measure | Count |
|---|---:|
| Total | 33 |
| Imported / persisted | 33 |
| Verified in live production UI | 0 |
| Source crops present | 33 |
| Explanation page references present | 33 |
| Official answers & four choices present | 33 |
| Figures / graphical choices | 0 |
| Semantic tables | 2 |
| Multi-visual questions | 0 |
| Underline spans explicitly retained | 1 |
| Explanation continuations across PDF pages | 14 |
| Known invalid `[TABLE]` markers | 0 |

### Remaining sign-off

Compare each reconstructed question and original source side by side in the running app (especially Q7, Q9, Q14, Q15, Q32, Q33) and inspect each rendered Explanation tab, including cross-page joins. Validate both narrow and desktop rendering, run the documented parsing lint and unit tests, and require the branch's build to pass before promoting any question to verified. Never mark a module verified from database presence or a PDF geometry audit alone.

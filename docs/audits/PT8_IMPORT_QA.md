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

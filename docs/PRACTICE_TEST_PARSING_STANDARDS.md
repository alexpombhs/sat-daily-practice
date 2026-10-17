# SAT Practice Test Parsing Standards

This document defines the required import, reconstruction, visual, explanation, and QA standards for every SAT practice set added to the application.

Practice Test 4 is the current reference implementation. A new practice set is not considered ready merely because its question metadata and answer key are present. Every question must pass the verification checklist below before the set is marked ready for normal practice.

## 1. Source identity and isolation

Each practice set must be treated as a fully independent source package.

A source package consists of:

- question PDF
- answer/explanation PDF
- scoring/answer-key PDF
- practice-test ID
- source file version/hash when available

Question identity is scoped by practice test, module, and question number. Cached PDFs, rendered crops, parsed text, attempts, parsing reports, and source-image caches must include the practice-test ID in their key.

Never fall back from one practice test to another practice test's question text, source PDF, visual crop, answer, or explanation.

An unverified or unavailable question must show an explicit unavailable/unverified state rather than content from another practice test.

## 2. Official source is the authority

The supplied practice-test PDF is the authority for:

- wording
- punctuation
- paragraph boundaries
- equations and symbols
- answer-choice ordering
- tables
- graphs and diagrams
- visual placement
- question number and module placement

The scoring PDF is the authority for:

- correct answer
- accepted student-produced responses
- response type

The answer/explanation PDF is the authority for the explanation view.

Do not silently repair or rewrite official wording during import.

## 3. Question reconstruction

Questions should be reconstructed as structured content whenever practical.

### Text

Use semantic text rather than an image of the full question.

Preserve:

- paragraph order
- paragraph breaks that affect meaning
- answer-choice order
- quotation structure
- Reading & Writing passage/stem separation
- Math stem/equation/choice order

Remove page-only decorations such as:

- module banners
- page numbers
- CONTINUE / STOP
- copyright/footer text
- column dividers
- question-number header bars

### Math

Math expressions should use LaTeX/KaTeX-compatible text when possible.

Preserve exactly:

- exponents
- fractions
- radicals
- inequalities
- absolute value
- degree symbols
- π
- coordinate pairs
- function notation
- systems of equations
- subscripts/superscripts
- grouping/parentheses

Do not accept PDF text extraction when mathematical reading order is visibly wrong. Manually verify and normalize those expressions.

### Tables

Tables must be represented with semantic table markup whenever the data can be represented faithfully.

Do not use a raster image for a normal data table simply because the source PDF contains one.

Verify:

- header labels
- row labels
- values
- column order
- alignment relevant to interpretation

## 4. Visual questions

Images are reserved for content that is genuinely visual, including:

- graphs
- geometry diagrams
- scatterplots
- dot plots
- figures
- graphical answer choices

The source visual crop must contain the complete visual and its necessary labels while excluding unrelated question text, adjacent questions, page headers, page footers, and column dividers.

Visual placement must match the source question's reading order. A figure that appears before the stem in the official question must render before the stem.

If a question has multiple independent visual regions, support multiple visual regions rather than forcing a single crop to contain unrelated text.

A full-question image is a last-resort exception and must be explicitly documented during QA.

## 5. Crop detection requirements

Do not infer question boundaries from arbitrary standalone numbers.

Standalone numbers can be:

- graph tick labels
- table values
- equation constants
- fraction numerators/denominators
- side lengths
- answer values
- exponents

Question-boundary detection must be based on verified question-header geometry and page/column structure, not merely text matching a one- or two-digit number.

Every automatic crop must be visually verified before the question is marked ready.

## 6. Explanations

Explanations are not parsed into editable text.

Display the explanation as a crop of the original answer/explanation PDF.

The parsing-repair editor may edit:

- reconstructed question text
- question visual crop(s)
- question visual placement

It must not edit explanation text.

## 7. Answer and response validation

For every question verify against the official scoring guide:

- correct answer
- multiple-choice vs. student-produced response
- all accepted student-produced forms where supplied

Answer metadata must be scoped to the practice-test ID.

## 8. Required per-question QA

Every imported question must be reviewed individually.

For each question confirm:

1. correct practice-test ID
2. correct section and module
3. correct source page
4. correct question number
5. complete reconstructed wording
6. correct paragraph/layout semantics
7. exact math symbols and equation structure
8. complete answer choices in the correct order
9. correct response type
10. correct official answer
11. correct table reconstruction, when present
12. complete visual crop, when present
13. visual appears in the correct position
14. no adjacent question content appears
15. no page decorations appear
16. original-source comparison shows the same question
17. explanation crop corresponds to the same question
18. desktop and narrow layouts remain readable

A practice set should not be presented as fully parsed until every question has passed this checklist.

## 9. Import status

Recommended content states:

- `metadata`: identity/page/answer metadata exists, but question reconstruction is not verified
- `imported`: structured content was imported but has not completed manual QA
- `verified`: question passed the per-question QA checklist

Normal practice should prefer verified content. Metadata-only content should never masquerade as a verified text reconstruction.

## 10. Regression protection

Automated tests should protect at least:

- practice-test source isolation
- unique question IDs across sets
- page mapping
- response type
- correct answer metadata
- no cross-test PDF fallback
- crop cache keys include practice-test ID
- question-bank grouping/filtering
- verified-content precedence over automatic extraction

For questions with known complex visual/layout requirements, keep explicit regression fixtures.


## 11. Math token integrity and pre-import linting

Math parsing must distinguish source characters from rendering delimiters. In particular, the dollar sign has two different meanings and must never be handled by a global replacement:

- a source `$` that denotes US currency is literal question text and must render as a currency symbol
- `$...$` and `$$...$$` are internal LaTeX/KaTeX delimiters only when the enclosed content is intentionally reconstructed math
- parser output must not expose delimiter characters to the student

Before a Math question can be marked `verified`, compare the reconstructed content with the original source and explicitly check every occurrence of:

- `$` (currency versus math delimiter)
- `^` / superscripts and exponent grouping
- radicals and root indices
- subscripts
- fractions
- degree symbols
- π
- inequality signs
- absolute-value bars
- parentheses/brackets/braces
- multiplication dots and other operators

### Exponent rules

PDF extraction commonly loses superscript geometry. Never infer that adjacent baseline characters are equivalent to a power.

Examples of distinctions that must survive reconstruction:

- `a^x` must not become `ax`
- `x^2` must not become `x2`
- `(1.04)^{6t/4}` must preserve the complete exponent
- nested powers and powers inside radicals must preserve grouping

Any question containing a superscript in the source must be visually compared with the source PDF after rendering. A syntactically valid expression is not sufficient if its mathematical meaning changed.

### Required automated lint

The import pipeline should fail or leave a question `imported`/unverified when any of these checks fail:

1. structured `text` mode has null or empty `question_lines`
2. math delimiters are unbalanced
3. a rendered question exposes raw math delimiters such as stray `$`
4. a source currency symbol was converted into a math delimiter
5. a source superscript/exponent has no corresponding exponent structure in reconstructed content
6. suspicious baseline adjacency appears where the source contains a superscript (for example `ax` versus `a^x`)
7. braces/parentheses used for exponent grouping are unbalanced
8. required math tokens disappear during PDF extraction or normalization

The lint result must be stored with the import/audit output so the exact question can be reviewed before repair.

### Verification-state invariant

A question must never be `verified` when `question_mode = 'text'` and `question_lines` is null or empty. Image fallback is allowed only when it is intentional, documented, and visually verified.

For every newly imported practice test, run QA in this order:

1. Math Module 1, Q1 through Q27
2. Math Module 2, Q1 through Q27
3. compare each rendered question with its source crop
4. resolve all math-token lint failures
5. only then mark the Math modules verified

This audit is required for each of the remaining practice tests rather than assuming that a parser that succeeded on one test will preserve the typography of another.


## 12. Canonical structured-content contract

Supabase is the canonical store for reviewed question repairs. Bundled fixtures may bootstrap an import or provide regression coverage, but a saved shared repair must take precedence and must be sufficient to reproduce the student-facing question.

A reviewed question must persist, as applicable:

- ordered `question_lines`
- response type and official answer metadata
- `content_status`
- zero or more visual specifications
- each visual's normalized crop
- each visual's placement relative to the structured text
- each visual's semantic kind

Multiple visuals must be stored as an ordered array. Do not collapse a multi-visual question into one oversized crop. Legacy single-crop fields may be retained for backward compatibility, but new import/repair code must treat the visual array as canonical.

Saving a repair must read back the persisted record and verify that question text, all visual crops, visual kinds, and placements match what the reviewer saved. A UI success state must not be shown merely because the request returned without throwing.

## 13. Question layout classification before extraction

Before reconstructing a question, classify its layout. The parser should not assume every question is plain prose.

Supported cases must include at least:

- text only
- text with inline/display math
- semantic data table
- text plus one source figure
- text plus multiple independent figures
- text plus graphical answer choices
- source figure + text stem + graphical answer choices
- intentionally documented full-image fallback

Graphical answer choices are a first-class `choice-grid` visual case. Their labels, axes, curves, diagrams, or spatial relationships must not be converted into unreliable extracted prose.

For a question with multiple visual regions, text extraction must exclude **every** registered visual region. Never exclude only the first crop and then allow labels from later graphs/figures to leak into parsed text.

The classification belongs to the parsing model, not to a hard-coded question-number exception. A newly imported practice test should be able to use the same layout cases without adding special logic for a particular test or question.

## 14. Visual specification and placement rules

A visual specification contains:

- normalized `x`, `y`, `width`, and `height` relative to the detected question region
- `kind` such as `figure` or `choice-grid`
- `afterLine`, describing placement in structured reading order
- an exact/safety-crop indicator when applicable

Placement semantics:

- `afterLine = -1`: before all parsed question text
- non-negative `afterLine`: after that structured text line
- a placement intended to mean "after all text" must remain correct if a reviewer adds/removes line breaks; do not encode it as a fragile fixed line index

The repair UI must expose **every** visual independently. Reviewers must be able to:

- adjust left/top/width/height for each crop
- preview each crop from the authoritative source PDF
- change each visual's placement
- distinguish a normal figure from graphical answer choices
- add/remove visual regions
- save all visual regions atomically

Crop previews and student rendering must use the same normalized crop semantics. A crop that looks correct in the repair editor must not shift, scale, or clip differently in the student view.

## 15. Structured text fidelity

Line boundaries in a reviewed repair are semantic data. Saving or rendering must not silently reflow reviewer-entered lines into paragraphs.

Preserve:

- intentional paragraph breaks
- list/bullet boundaries
- equation lines
- table markers/rows
- answer-choice boundaries
- source ordering around visuals

Bulleted source content must render as separate bullets rather than a single run-on line.

Underlined source text must use explicit structured markup understood by the renderer. If a question refers to "the underlined" text, QA must confirm that an underlined span actually exists.

The repair editor's live preview and the final student-facing renderer must share the same structured rendering pipeline. Do not maintain a second approximate preview implementation whose LaTeX, table, underline, or line-break behavior can diverge from production.

## 16. Explicit table repair format

Automatically detected tables may be used during initial extraction, but manual repairs need an unambiguous representation.

The supported repair format is:

```text
[TABLE]
x | f(x)
-4 | 0
-19/5 | 1
-18/5 | 2
[/TABLE]
```

Rules:

- one row per line
- `|` is the preferred explicit column separator
- whitespace-separated legacy rows may be accepted when column structure is unambiguous
- the first row is the header row unless the question's table model explicitly says otherwise
- `[TABLE]` and `[/TABLE]` are editor/source markup and must never render to students
- malformed explicit tables must produce a visible QA error rather than silently falling back to prose
- semantic tables must size to content and must not introduce unnecessary nested scrollbars

## 17. Math repair and rendering rules

Reviewer-entered LaTeX is authoritative after save. The repair editor must support common transformations without requiring reviewers to memorize syntax:

- variable/math span
- exponent
- square root
- fraction
- underline
- table

These controls are conveniences; they must produce the same markup accepted by the production renderer.

Math QA must compare **rendered meaning**, not only source strings. In particular verify that:

- variables intended as math render as math
- fractions have the correct numerator/denominator
- radicals include the complete radicand
- exponents include the complete exponent
- minus signs and inequality signs are not lost
- currency remains literal currency
- no raw LaTeX delimiters are student-visible

## 18. Import pipeline for new practice tests

Use this sequence for every new test:

1. register the source package and practice-test ID
2. map pages/modules/questions without borrowing mappings from another test
3. import answer/response metadata from the scoring source
4. detect question regions using page/column geometry
5. classify each question's layout before text reconstruction
6. reconstruct semantic text/math/tables
7. detect/register all genuinely visual regions
8. remove all registered visual regions from text extraction
9. render the reconstructed question through the production renderer
10. compare it side-by-side with the authoritative source
11. run automated quality lint
12. repair any failures using the shared repair editor
13. persist the canonical result to Supabase
14. read it back and verify persistence
15. mark `verified` only after per-question QA passes

Do not bulk-promote a module to `verified` because extraction completed successfully.

For the next four practice tests, complete one module's QA before using its results to tune generalized parser behavior. Parser improvements discovered during QA should be added as reusable layout/token rules and regression fixtures, not question-number-specific exceptions unless the official source is genuinely exceptional.

## 19. Import quality gates

A new practice test is not ready for normal practice while any of these conditions exist:

- missing question text for a text/hybrid question
- missing or extra answer choices
- wrong official answer/response type
- unresolved math lint
- table rendered as flattened prose
- graphical choices parsed as text instead of preserved visually
- missing visual region
- crop clips meaningful content
- crop contains adjacent question/page decoration
- visual appears in the wrong reading-order position
- raw `[TABLE]` markers or LaTeX delimiters are student-visible
- repaired content exists only in browser/local state
- shared repair fails round-trip persistence
- cross-test fallback supplies any content
- unresolved parsing issue is marked resolved

The import summary should report counts for total, imported, verified, flagged, visual, multi-visual, table, and lint-failing questions by module.

## 20. Regression fixture matrix

Maintain representative fixtures for parser behavior rather than only testing ordinary prose. At minimum, the suite should contain examples of:

| Fixture | Required assertion |
| --- | --- |
| currency + math | currency `$` survives while math delimiters do not leak |
| exponent | superscript grouping survives reconstruction |
| radical/fraction | complete mathematical structure renders correctly |
| bullets | each source bullet remains a distinct item |
| underline | marked source span renders underlined |
| semantic table | headers/rows/cells preserve order |
| explicit repaired table | markers disappear and semantic table renders |
| one figure | crop and placement match source |
| multiple figures | every visual persists and renders |
| graphical choices | choices remain visual and are not extracted as prose |
| figure + stem + choice grid | reading order is figure → text → choices |
| manual crop repair | all crop coordinates survive Supabase round trip |
| line-break repair | saved line boundaries survive reload |
| source isolation | no text/crop/PDF/answer can come from another test |

When a parsing defect is found during review of a future test, first decide which fixture category it belongs to. Add or extend the regression fixture before marking the generalized fix complete.

## 21. Definition of done for Tests 8–11

For each additional practice test, "parsed" means more than records existing in the database. Completion requires:

- every question reviewed against its official source
- every Math question checked for mathematical meaning after rendering
- every Reading & Writing question checked for paragraph, punctuation, underline, bullet, and table fidelity
- every visual and graphical choice group cropped and placed correctly
- every official answer verified
- every shared repair successfully round-tripped through Supabase
- zero unresolved high-severity parsing issues
- regression suite and production build passing

Record any intentionally unresolved source ambiguity explicitly; never silently guess and mark it verified.

## 22. PT8-derived benchmark additions: source fidelity and concept coverage

PT8 demonstrated that **successful canonical import is not equivalent to a complete learning-ready question**. Parsing, source/explanation rendering, and instructional classification are separate release gates. A row with `content_status='imported'` has not passed production visual QA, even when the database has full text and crop coordinates.

### Renderer-specific table fidelity

- Preserve tabular structure from the source, but verify that the **actual student-facing subject renderer** accepts its serialized format. PT8 Reading & Writing Module 2 Q14–Q15 used tab-separated table rows because the Reading renderer did not accept the Math-oriented `[TABLE]` repair markup as-is.
- The benchmark is semantic table fidelity **after rendering**, not uniform text storage syntax. Test header/cell ordering and the absence of raw table delimiters in each rendering path.
- Include wide multi-column tables, intentional poem line breaks (PT8 RW2 Q7), underlined spans across labeled passages (RW2 Q9), and individual research-note bullets (RW2 Q32–Q33) in regression fixtures.

### PDF source and explanation boundaries

- Verify source crops against the **correct version of that test's PDF**, including axes, labels, complete figures, and full table rows; reject the next question and the page's STOP/footer decorations.
- Validate explanation crops against the rendered PDF, not simply the stored explanation page number. Several PT8 explanations continue to the next PDF page; end the crop at the next explanation heading, and never join the first question of the *next module* after the current module's last question.
- Keep source PDF caching separate from rendered crop cache invalidation. When crop rules change, version the crop cache rather than bypassing the underlying PDF cache.
- Verify scrolling in the *question/source/explanation content region* on constrained desktop heights: content must remain reachable without making the review header and answer panel scroll away. Include this in viewport QA for long questions and multi-page explanations.

### Mandatory concept and difficulty classification

Every canonical question must have a matching, per-question `sat_question_difficulty` record identified by **the exact canonical question ID**. Classification is part of the import acceptance criteria, not an optional later enhancement.

Required fields and validations:

1. `question_id`: resolves to exactly one existing `sat_question_bank.id` for the intended test and module. Never join on question number alone.
2. `concepts`: nonempty JSON array of specific, meaningful skills inferred from that question's actual stem, answer choices, and any required figure/table. Generic filler tags are not acceptable; use a second granular tag for key variations such as “no solution” and “parallel lines.”
3. `difficulty`: use the database's allowed values `easy`, `medium`, `advanced`; `hard` is invalid. Difficulty is content-based and must not be mistaken for measured student success rate.
4. `reasoning_steps`, `integration_level`, `confidence`, and `rubric_version`: populate consistently with the schema, and flag uncertain decisions for review rather than claiming precision unsupported by the source.
5. Read the classification back from Supabase and check full coverage by module before release.

Pre-Test Review groups stored concept strings into broad categories, ranks those categories from **practice attempts**, then lists related tagged questions. A question with no `concepts` is invisible to this workflow even if its canonical wording and answers exist. The benchmark therefore requires a **functional join-and-display test** from canonical question → difficulty/concepts → review grouping → related question list. Whether a tagged question appears depends on the chosen priority category; tagging alone does not force it onto every review screen.

PT8 Math Module 2 Q23 is a regression fixture: it asks for a second linear equation giving **no solution** and needs tags equivalent to `systems of linear equations`, `no solution`, `parallel lines`. It must resolve to **Linear Equations & Systems** and be eligible among related review questions when that priority category is selected.

### Measurable import gates

For each module, publish `total`, `canonical_text_present`, `source_crop_present`, `explanation_reference_present`, `answer_complete`, `classified`, `concepts_nonempty`, `verified`, and `blocking_issues`. Treat a missing concept record as a failing **learning-readiness** gate, not as a passing parse. Keep parsing verification and concept-classification verification distinct in dashboards and audits.

For PT8, the database coverage check on 2026-10-17 showed **120/120 canonical questions with concept records** (27/27 each Math module; 33/33 each Reading & Writing module). This is a **metadata coverage check**, not a final semantic accuracy audit of all labels or browser proof of Pre-Test Review rendering. PT8 questions remain `imported` until the original parsing verification steps pass.

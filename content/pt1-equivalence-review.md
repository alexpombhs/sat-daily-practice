# PT1 equivalence review — revision 2

120 original practice questions retained: RW1 33, RW2 33, Math1 27, Math2 27. Each PT1 question retains the aligned PT4 topic and the inherited difficulty tag as a **target**, not an empirically calibrated difficulty.

## Corrections included
- Rewrote 29 Reading and Writing items to improve authentic text analysis, evidence comparison, quantitative reasoning, punctuation, and distractors.
- Rewrote 14 Math items to require additional operations, including similarity, models from data, factoring constraints, composite geometry, complementary-angle trigonometry, and algebraic parameters.
- Fixed an ambiguous vocabulary question, revised sentence boundaries, and made a punctuation/appositive item test its intended skill.
- Verified structural totals and IDs: 120 items, 120 unique IDs, modules 33/33/27/27, four choices for multiple-choice items, answer labels present.

## Remaining limitations — do not publish as a calibrated PT4 substitute yet
- PT4's original copyright-protected prompts were **not** fed to a rewriting model; equivalence is assessed using independent concept labels, not item-response statistics.
- Some items still rely on verbalized charts/tables rather than rendered source graphics. Need production graphics where concept tags require graph analysis.
- No independent subject-matter editorial review or student pilot has established difficulty equivalence.
- No validated evidence that raw results from this test can substitute in the app's SAT score prediction.
- Content JSON is not yet adapted to Supabase canonical `sat_question_bank` schema. Existing user histories remain untouched.

## Acceptance gate
1. Independent editorial QA of every question, answer, explanation, and distractor.
2. Compare each question's *actual* skill and cognitive demand with PT4's intended concept.
3. Make graphics and tables accessible and verify renderer.
4. Pilot, empirically calibrate difficulty, and revisit prediction models.
5. Import PT1 as new canonical IDs only after passing QA.
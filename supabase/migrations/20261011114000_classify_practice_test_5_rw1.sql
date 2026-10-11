insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
select v.* from (values
('practice-test-5:rw1-1','easy','["vocabulary in context","figurative word sense"]'::jsonb,2,'low',0.95,'content-rubric-v1'),
('practice-test-5:rw1-2','easy','["context clues","precise adjective selection"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw1-3','medium','["temporal cues","precise academic vocabulary","scientific prediction"]'::jsonb,2,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw1-4','medium','["precise verb selection","inference from experiment description"]'::jsonb,2,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw1-5','advanced','["nuanced vocabulary","problem-solution relation","academic diction"]'::jsonb,3,'medium',0.91,'content-rubric-v1'),
('practice-test-5:rw1-6','easy','["main purpose","character self-description","explicit evidence"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-7','easy','["main purpose","historical examples","central claim"]'::jsonb,2,'low',0.96,'content-rubric-v1'),
('practice-test-5:rw1-8','medium','["underlined sentence function","research motivation","analogy to another environment"]'::jsonb,3,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw1-9','advanced','["argument structure","context-dependent causation","qualifying a claim"]'::jsonb,4,'high',0.94,'content-rubric-v1'),
('practice-test-5:rw1-10','advanced','["research hypothesis","observational counterevidence","passage structure"]'::jsonb,4,'high',0.95,'content-rubric-v1'),
('practice-test-5:rw1-11','easy','["explicit information","scientific reporting","expectation versus finding"]'::jsonb,2,'low',0.96,'content-rubric-v1'),
('practice-test-5:rw1-12','easy','["explicit detail","chronological claims","historical inference"]'::jsonb,2,'low',0.96,'content-rubric-v1'),
('practice-test-5:rw1-13','easy','["textual evidence","emotional state","quotation selection"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-14','medium','["table reading","relative chronology","supporting a claim"]'::jsonb,3,'medium',0.97,'content-rubric-v1'),
('practice-test-5:rw1-15','medium','["textual evidence","mixed emotional attitude","contrasting details in quotation"]'::jsonb,3,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw1-16','advanced','["graphical evidence","inverse proxy relationships","comparing historical trajectories","testing hypotheses"]'::jsonb,5,'high',0.69,'content-rubric-v1'),
('practice-test-5:rw1-17','medium','["logical inference","limits of evidence","causal hypothesis"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:rw1-18','advanced','["scientific induction","evolutionary persistence","immune-system evidence","weighing competing inferences"]'::jsonb,4,'high',0.94,'content-rubric-v1'),
('practice-test-5:rw1-19','advanced','["ethical framework comparison","conditional reasoning","social roles","logical implication"]'::jsonb,4,'high',0.92,'content-rubric-v1'),
('practice-test-5:rw1-20','easy','["demonstrative pronouns","singular agreement","sentence reference"]'::jsonb,1,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-21','easy','["finite verbs","simple past tense","sentence structure"]'::jsonb,1,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-22','easy','["subject verb agreement","gerund phrases as subjects"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-23','medium','["possessive versus plural nouns","apostrophe placement","sentence grammar"]'::jsonb,3,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw1-24','medium','["subject verb agreement","interrupting modifiers","plural subjects"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:rw1-25','medium','["punctuation with appositives","proper noun placement","essential versus nonessential information"]'::jsonb,3,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw1-26','advanced','["paired dash punctuation","parenthetical lists","complex sentence structure"]'::jsonb,4,'high',0.93,'content-rubric-v1'),
('practice-test-5:rw1-27','easy','["cause-effect transitions","cohesion"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw1-28','medium','["contrast transitions","concession and qualification"]'::jsonb,2,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw1-29','easy','["contrasting systems","transition selection"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw1-30','medium','["cause-and-effect transition","inference from appearance"]'::jsonb,2,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw1-31','easy','["synthesis of notes","relevant facts","identifying person"]'::jsonb,2,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw1-32','medium','["synthesis of notes","mechanistic explanation","process sequencing"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:rw1-33','easy','["synthesis of notes","formal category definitions","direct inference"]'::jsonb,2,'low',0.98,'content-rubric-v1')
) as v(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
join public.sat_question_bank b on b.id=v.question_id and b.practice_test_id='practice-test-5' and b.module='rw1'
where jsonb_array_length(coalesce(b.question_lines,'[]'::jsonb))>0
on conflict (question_id) do nothing;

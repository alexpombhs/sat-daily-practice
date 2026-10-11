insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
select v.* from (values
('practice-test-5:rw2-1','easy','["phrase meaning in context","physical action vocabulary"]'::jsonb,1,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw2-2','easy','["context clues","precise verb choice"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-3','easy','["contrast cue","causal relation","word selection"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw2-4','medium','["nuanced vocabulary","historical significance","causal context"]'::jsonb,3,'medium',0.92,'content-rubric-v1'),
('practice-test-5:rw2-5','medium','["precision of verbs","evidence limits","argument defensibility"]'::jsonb,3,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw2-6','medium','["sentence function","tone and irony","character boasting"]'::jsonb,3,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw2-7','advanced','["empirical findings versus events","methodological confounding","argument structure"]'::jsonb,5,'high',0.94,'content-rubric-v1'),
('practice-test-5:rw2-8','advanced','["paired text argumentation","refutation","interdependence of visual and verbal meaning"]'::jsonb,4,'high',0.93,'content-rubric-v1'),
('practice-test-5:rw2-9','easy','["literal comprehension","setting description","narrative perspective"]'::jsonb,2,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-10','easy','["explicit textual evidence","stated uncertainty","ecological design context"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw2-11','advanced','["narrative theory vocabulary","contrasting theoretical frameworks","main idea synthesis"]'::jsonb,4,'high',0.91,'content-rubric-v1'),
('practice-test-5:rw2-12','medium','["graph interpretation","time series maximum","matching evidence to claim"]'::jsonb,3,'medium',0.76,'content-rubric-v1'),
('practice-test-5:rw2-13','advanced','["textual evidence selection","ecological mechanism","long-term genetic consequences"]'::jsonb,4,'high',0.93,'content-rubric-v1'),
('practice-test-5:rw2-14','advanced','["graph interpretation","interaction of climate and nitrogen","counterfactual comparison"]'::jsonb,5,'high',0.66,'content-rubric-v1'),
('practice-test-5:rw2-15','medium','["poetic ambivalence","evidence for mixed feelings","concession"]'::jsonb,3,'medium',0.93,'content-rubric-v1'),
('practice-test-5:rw2-16','advanced','["table interpretation","comparison of percentage changes","conditional sensitivity to baselines"]'::jsonb,4,'high',0.9,'content-rubric-v1'),
('practice-test-5:rw2-17','easy','["historical linguistic inference","causal connection between migration and dialect"]'::jsonb,2,'low',0.96,'content-rubric-v1'),
('practice-test-5:rw2-18','easy','["finite verbs","past tense","sentence completion"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-19','easy','["subject-predicate punctuation","unnecessary punctuation"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-20','easy','["pronoun agreement","plural antecedents"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-21','medium','["appositive punctuation","subject-verb separation","sentence boundary"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:rw2-22','advanced','["independent clauses","colon usage","modifier punctuation"]'::jsonb,4,'high',0.9,'content-rubric-v1'),
('practice-test-5:rw2-23','medium','["appositive versus identifying phrase","noun phrase punctuation"]'::jsonb,3,'medium',0.94,'content-rubric-v1'),
('practice-test-5:rw2-24','advanced','["subject verb agreement","complex intervening parenthetical","head noun identification"]'::jsonb,4,'high',0.92,'content-rubric-v1'),
('practice-test-5:rw2-25','advanced','["participial modifiers","sentence subject-predicate structure","appositive interruption"]'::jsonb,4,'high',0.94,'content-rubric-v1'),
('practice-test-5:rw2-26','easy','["sequence transitions","temporal ordering"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-27','easy','["chronological transitions","time progression"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:rw2-28','easy','["cause-and-effect transitions","purpose of standardization"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw2-29','medium','["logical consequences","reason-result transition","genetics and proteins context"]'::jsonb,2,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw2-30','easy','["rhetorical synthesis","time-specific fact selection"]'::jsonb,1,'low',0.99,'content-rubric-v1'),
('practice-test-5:rw2-31','easy','["rhetorical synthesis","emphasis","comparison of magnitudes"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:rw2-32','medium','["contrasting definitions","rhetorical synthesis","precise relational descriptions"]'::jsonb,3,'medium',0.95,'content-rubric-v1'),
('practice-test-5:rw2-33','easy','["rhetorical synthesis","similarities versus differences","relevant facts"]'::jsonb,2,'low',0.98,'content-rubric-v1')
) as v(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
join public.sat_question_bank b on b.id=v.question_id and b.practice_test_id='practice-test-5' and b.module='rw2'
where jsonb_array_length(coalesce(b.question_lines,'[]'::jsonb))>0
on conflict (question_id) do nothing;

-- Reviewed individually against canonical text and choices. Visual and incomplete questions remain unclassified.
insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
select v.* from (values
('rw1-1','easy','["words in context","precise verb selection","context clues"]'::jsonb,1,'low',0.96,'content-rubric-v1'),
('rw1-2','medium','["words in context","scientific causal explanation","meaning of reflect"]'::jsonb,2,'medium',0.91,'content-rubric-v1'),
('rw1-3','easy','["words in context","contrast cue","vocabulary precision"]'::jsonb,2,'low',0.95,'content-rubric-v1'),
('rw1-4','medium','["words in context","negation","contrast and concession"]'::jsonb,3,'medium',0.9,'content-rubric-v1'),
('rw1-5','medium','["literary main purpose","character mixed feelings","synthesis of details"]'::jsonb,3,'medium',0.91,'content-rubric-v1'),
('rw1-6','medium','["poetry structure","figurative imagery","shift from description to questioning"]'::jsonb,3,'medium',0.93,'content-rubric-v1'),
('rw1-7','advanced','["poetry structure","rhetorical rebuttal","institution as metaphor","speaker purpose"]'::jsonb,4,'high',0.91,'content-rubric-v1'),
('rw1-8','medium','["sentence function","generalization and example","scientific passage organization"]'::jsonb,3,'medium',0.94,'content-rubric-v1'),
('rw1-9','advanced','["paired passage comparison","challenging established models","social structure chronology","author position inference"]'::jsonb,4,'high',0.95,'content-rubric-v1'),
('rw1-10','easy','["literary main idea","explicit characterization","supporting details"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('rw1-11','medium','["figurative analogy","poetic diction","mapping source and target ideas"]'::jsonb,3,'medium',0.91,'content-rubric-v1'),
('rw1-12','easy','["literary main idea","character relationships","distinguishing broad and specific claims"]'::jsonb,2,'low',0.95,'content-rubric-v1'),
('rw1-14','advanced','["scientific hypothesis","supporting evidence","longitudinal trends","divergence across populations"]'::jsonb,4,'high',0.94,'content-rubric-v1'),
('rw1-16','medium','["command of evidence","matching quotation to claim","collaboration versus individual control"]'::jsonb,2,'medium',0.96,'content-rubric-v1')
) as v(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
join public.sat_question_bank b on b.id=v.question_id and b.practice_test_id='practice-test-4' and b.module='rw1'
where jsonb_array_length(coalesce(b.question_lines,'[]'::jsonb))>0 and b.needs_visual=false
on conflict (question_id) do nothing;

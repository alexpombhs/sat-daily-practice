insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
values
('rw1-13','medium',to_jsonb(string_to_array('graph interpretation|categorical comparisons|evidence selection','|')),3,'medium',0.68,'content-rubric-v1'),
('rw1-15','advanced',to_jsonb(string_to_array('two-way scientific table|matched comparison|ablation rates','|')),4,'high',0.92,'content-rubric-v1'),
('rw1-17','advanced',to_jsonb(string_to_array('controlled experiment|host versus nonhost plants|unexpected evidence','|')),4,'high',0.68,'content-rubric-v1'),
('rw2-9','easy',to_jsonb(string_to_array('sentence function|example of behavior','|')),2,'low',0.98,'content-rubric-v1'),
('rw2-22','advanced',to_jsonb(string_to_array('parenthetical notation|appositive punctuation|isotope notation','|')),4,'high',0.9,'content-rubric-v1'),
('rw2-32','easy',to_jsonb(string_to_array('rhetorical synthesis|audience awareness|book introduction','|')),2,'low',0.97,'content-rubric-v1'),
('practice-test-7:rw1-6','medium',to_jsonb(string_to_array('figurative meaning|sentence function|emotional connotation','|')),3,'medium',0.95,'content-rubric-v1'),
('practice-test-7:rw1-7','easy',to_jsonb(string_to_array('parenthetical definition|scientific terminology','|')),2,'low',0.97,'content-rubric-v1'),
('practice-test-7:rw1-9','advanced',to_jsonb(string_to_array('argument rebuttal|historical counterexample|sentence function','|')),4,'high',0.93,'content-rubric-v1'),
('practice-test-7:rw2-3','easy',to_jsonb(string_to_array('success evidence|precise word choice','|')),1,'low',0.98,'content-rubric-v1'),
('practice-test-7:rw2-5','medium',to_jsonb(string_to_array('context vocabulary|esteem and diplomatic influence','|')),2,'low',0.96,'content-rubric-v1'),
('practice-test-7:rw2-6','easy',to_jsonb(string_to_array('contrasting hypotheses|sentence function','|')),2,'low',0.97,'content-rubric-v1'),
('practice-test-7:rw2-7','medium',to_jsonb(string_to_array('historical causal context|sentence function','|')),3,'medium',0.96,'content-rubric-v1'),
('practice-test-7:rw2-8','medium',to_jsonb(string_to_array('evidence supporting production learning|temporal comparison','|')),3,'medium',0.94,'content-rubric-v1'),
('practice-test-7:rw2-20','easy',to_jsonb(string_to_array('past tense|temporal grammar','|')),1,'low',0.98,'content-rubric-v1'),
('practice-test-7:rw2-22','medium',to_jsonb(string_to_array('pronoun antecedent agreement|complex sentence','|')),3,'medium',0.95,'content-rubric-v1'),
('practice-test-7:rw2-24','advanced',to_jsonb(string_to_array('conjunctive adverb punctuation|sentence integration','|')),4,'high',0.92,'content-rubric-v1')
on conflict(question_id) do nothing;

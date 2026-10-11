insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
values
('rw1-18','advanced',to_jsonb(string_to_array('archaeological evidence|contextual inference|cultural symbolism','|')),4,'high',0.82,'content-rubric-v1'),
('rw1-19','medium',to_jsonb(string_to_array('plural possessive nouns|apostrophe forms|subject quantity','|')),3,'medium',0.82,'content-rubric-v1'),
('rw1-20','easy',to_jsonb(string_to_array('present tense|habitual action','|')),1,'low',0.82,'content-rubric-v1'),
('rw1-21','medium',to_jsonb(string_to_array('sentence boundaries|period versus comma splice','|')),3,'medium',0.82,'content-rubric-v1'),
('rw1-22','easy',to_jsonb(string_to_array('subject verb agreement|singular grammatical subject','|')),2,'low',0.82,'content-rubric-v1'),
('rw1-23','medium',to_jsonb(string_to_array('semicolon joining independent clauses|temporal adverb','|')),3,'medium',0.82,'content-rubric-v1'),
('rw1-24','advanced',to_jsonb(string_to_array('dangling modifiers|modification target|complex noun phrase','|')),4,'high',0.82,'content-rubric-v1'),
('rw1-25','advanced',to_jsonb(string_to_array('complex series punctuation|supplementary phrase|semicolon versus comma','|')),4,'high',0.82,'content-rubric-v1'),
('rw1-26','advanced',to_jsonb(string_to_array('conjunctive adverb punctuation|two independent clauses|contrast','|')),4,'high',0.82,'content-rubric-v1'),
('rw1-27','easy',to_jsonb(string_to_array('final temporal transition|event sequence','|')),1,'low',0.82,'content-rubric-v1'),
('rw1-28','easy',to_jsonb(string_to_array('contrast transition|refuting prior assumption','|')),2,'low',0.82,'content-rubric-v1'),
('rw1-29','easy',to_jsonb(string_to_array('additive transition|supporting details','|')),1,'low',0.82,'content-rubric-v1'),
('rw1-30','medium',to_jsonb(string_to_array('causal reasoning|logical consequence transition','|')),2,'low',0.82,'content-rubric-v1'),
('rw1-31','medium',to_jsonb(string_to_array('rhetorical synthesis|explicit differences|process comparison','|')),3,'medium',0.82,'content-rubric-v1'),
('rw1-32','medium',to_jsonb(string_to_array('rhetorical synthesis|audience background|artist and work description','|')),3,'medium',0.82,'content-rubric-v1'),
('rw1-33','medium',to_jsonb(string_to_array('rhetorical synthesis|audience awareness|introducing research results','|')),3,'medium',0.82,'content-rubric-v1')
on conflict(question_id) do nothing;

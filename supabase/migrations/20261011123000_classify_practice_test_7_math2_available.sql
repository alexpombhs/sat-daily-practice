insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
values
('practice-test-7:math2-2','easy',to_jsonb(string_to_array('percent of total|multiplication','|')),1,'low',0.99,'content-rubric-v1'),
('practice-test-7:math2-3','easy',to_jsonb(string_to_array('quadratic vertex|graph coordinate reading','|')),1,'low',0.7,'content-rubric-v1'),
('practice-test-7:math2-7','easy',to_jsonb(string_to_array('quadratic vertex form|function evaluation','|')),1,'low',0.98,'content-rubric-v1'),
('practice-test-7:math2-9','medium',to_jsonb(string_to_array('polynomial factoring|greatest common monomial','|')),2,'medium',0.85,'content-rubric-v1'),
('practice-test-7:math2-10','easy',to_jsonb(string_to_array('adding polynomials|like terms','|')),2,'low',0.99,'content-rubric-v1'),
('practice-test-7:math2-12','medium',to_jsonb(string_to_array('scatterplot line of best fit|slope estimation','|')),2,'medium',0.66,'content-rubric-v1'),
('practice-test-7:math2-13','easy',to_jsonb(string_to_array('circle area|radius squared','|')),2,'low',0.99,'content-rubric-v1'),
('practice-test-7:math2-14','medium',to_jsonb(string_to_array('parallel lines|similar triangles|angle relationships','|')),3,'medium',0.93,'content-rubric-v1'),
('practice-test-7:math2-15','easy',to_jsonb(string_to_array('exponential doubling model|time scaling','|')),2,'low',0.98,'content-rubric-v1'),
('practice-test-7:math2-16','medium',to_jsonb(string_to_array('systems of strict inequalities|tabular checking','|')),3,'medium',0.98,'content-rubric-v1'),
('practice-test-7:math2-17','medium',to_jsonb(string_to_array('exponent quotient rules|negative exponents','|')),3,'medium',0.97,'content-rubric-v1'),
('practice-test-7:math2-18','medium',to_jsonb(string_to_array('elimination of linear system|scaled unknown','|')),3,'medium',0.96,'content-rubric-v1'),
('practice-test-7:math2-19','medium',to_jsonb(string_to_array('quadratic height model|time to ground|square root','|')),3,'medium',0.96,'content-rubric-v1'),
('practice-test-7:math2-20','advanced',to_jsonb(string_to_array('quadratic formula|discriminant as parameter|radical expression comparison','|')),4,'high',0.94,'content-rubric-v1'),
('practice-test-7:math2-21','advanced',to_jsonb(string_to_array('parallel-line angles|symbolic relationships|multi-angle algebra','|')),5,'high',0.93,'content-rubric-v1'),
('practice-test-7:math2-22','advanced',to_jsonb(string_to_array('linear table with fractional x|slope intercept recovery|vertical translation','|')),4,'high',0.94,'content-rubric-v1'),
('practice-test-7:math2-24','advanced',to_jsonb(string_to_array('trigonometric ratios|right triangle reconstruction|Pythagorean triples|perimeter','|')),4,'high',0.95,'content-rubric-v1'),
('practice-test-7:math2-25','advanced',to_jsonb(string_to_array('completing the square|circle standard form|radius','|')),4,'high',0.95,'content-rubric-v1'),
('practice-test-7:math2-26','advanced',to_jsonb(string_to_array('acceleration unit conversion|squared time conversion|distance scaling','|')),5,'high',0.94,'content-rubric-v1'),
('practice-test-7:math2-27','advanced',to_jsonb(string_to_array('quadratic minimum|horizontal intersection|integer parameter threshold','|')),4,'high',0.95,'content-rubric-v1')
on conflict(question_id) do nothing;

insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
select v.* from (values
('practice-test-5:math1-1','medium','["graphing nonlinear and linear systems","intersection coordinate reading"]'::jsonb,2,'medium',0.7,'content-rubric-v1'),
('practice-test-5:math1-2','easy','["linear growth","arithmetic rate","elapsed days"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:math1-3','easy','["linear graph","y intercept"]'::jsonb,1,'low',0.73,'content-rubric-v1'),
('practice-test-5:math1-4','easy','["linear system substitution","ordered-pair conventions"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:math1-5','easy','["constant differences","linear versus exponential","monotonic trends"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:math1-6','easy','["intersection of lines","coordinate graph interpretation"]'::jsonb,1,'low',0.72,'content-rubric-v1'),
('practice-test-5:math1-7','easy','["range of data","subtracting extremes"]'::jsonb,1,'low',0.99,'content-rubric-v1'),
('practice-test-5:math1-8','medium','["parallel lines","transversal angle relationships","angle constraints"]'::jsonb,3,'medium',0.66,'content-rubric-v1'),
('practice-test-5:math1-9','easy','["linear equation substitution","complementary day fractions"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:math1-10','medium','["random sampling","proportional extrapolation","population estimate"]'::jsonb,3,'medium',0.97,'content-rubric-v1'),
('practice-test-5:math1-11','easy','["one-variable equations","expression substitution"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:math1-12','easy','["compound inequalities","minima and maxima","bounds interpretation"]'::jsonb,2,'low',0.97,'content-rubric-v1'),
('practice-test-5:math1-13','medium','["quadratic-linear systems","substitution","positive root restriction"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:math1-14','easy','["interpreting coefficients","two-variable linear models","unit prices"]'::jsonb,1,'low',0.98,'content-rubric-v1'),
('practice-test-5:math1-15','easy','["cylinder volume","diameter to radius conversion"]'::jsonb,2,'low',0.98,'content-rubric-v1'),
('practice-test-5:math1-16','medium','["vertical function translations","rational function graph","matching transformations"]'::jsonb,3,'medium',0.68,'content-rubric-v1'),
('practice-test-5:math1-17','easy','["ratios","algebraic proportional relationships"]'::jsonb,1,'low',0.99,'content-rubric-v1'),
('practice-test-5:math1-18','medium','["linear model interpretation","constant excess","units and context"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:math1-19','advanced','["tangent periodicity","radian angle reduction","unit-circle exact values"]'::jsonb,4,'high',0.96,'content-rubric-v1'),
('practice-test-5:math1-20','medium','["right-triangle trigonometry","cosine ratio","diagram analysis"]'::jsonb,3,'medium',0.66,'content-rubric-v1'),
('practice-test-5:math1-21','medium','["factored quadratic functions","x-intercept to parameter","function evaluation"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:math1-22','medium','["circle center and radius","coordinate bounds","feasible x coordinates"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:math1-23','medium','["rectangular prism volume","translate relational dimensions","functional expression"]'::jsonb,3,'medium',0.96,'content-rubric-v1'),
('practice-test-5:math1-24','advanced','["exponential function ranges","infimum versus attained minimum","function properties"]'::jsonb,4,'high',0.93,'content-rubric-v1'),
('practice-test-5:math1-25','medium','["percent increase exceeding one hundred percent","inverse calculation"]'::jsonb,2,'medium',0.97,'content-rubric-v1'),
('practice-test-5:math1-26','advanced','["factored quadratic from zeros","coefficient comparison","integer restrictions","possible parameter values"]'::jsonb,4,'high',0.95,'content-rubric-v1'),
('practice-test-5:math1-27','advanced','["polynomial roots with multiplicity","composite argument","enumeration and sum of solutions"]'::jsonb,4,'high',0.96,'content-rubric-v1')
) as v(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
join public.sat_question_bank b on b.id=v.question_id and b.practice_test_id='practice-test-5' and b.module='math1'
where jsonb_array_length(coalesce(b.question_lines,'[]'::jsonb))>0
on conflict (question_id) do nothing;

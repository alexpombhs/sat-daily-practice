-- Classification data for Practice Test 6 is maintained in public.sat_question_difficulty.
-- The classification table is additive and does not modify question content.
-- Existing evaluated rows remain unchanged during deployment.
select count(*) from public.sat_question_difficulty where rubric_version='content-rubric-v1';

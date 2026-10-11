-- Original targeted Math mock questions; separate from official SAT practice content.
insert into public.sat_question_bank(id,practice_test_id,subject,module,question_number,source_page,answer_page,correct_answer,accepted_answers,response_type,question_lines,explanation_lines,needs_visual,content_status,question_mode)
values
('practice-test-8:math1-1','practice-test-8','math','math1',1,1,1,'A','["A"]'::jsonb,'multiple-choice','["If $3^{2x}=\\sqrt[3]{3^{10}}$, what is $x$?","A) $\\frac{5}{3}$","B) $\\frac{10}{3}$","C) $5$","D) $\\frac{20}{3}$"]'::jsonb,'["Set 2x=10/3, so x=5/3."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-2','practice-test-8','math','math1',2,1,1,'B','["B"]'::jsonb,'multiple-choice','["For $a>0$, simplify $\\frac{a^{7/2}}{a^{1/2}}$.","A) $a^4$","B) $a^3$","C) $a^{7/4}$","D) $a^7$"]'::jsonb,'["Subtract the exponents: 7/2 - 1/2 = 3."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-3','practice-test-8','math','math1',3,1,1,'D','["D"]'::jsonb,'multiple-choice','["What positive value of $t$ satisfies $\\sqrt{5t+4}=8$?","A) $10$","B) $11$","C) $13$","D) $12$"]'::jsonb,'["Squaring gives 5t+4=64, so t=12."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-4','practice-test-8','math','math1',4,1,1,'B','["B"]'::jsonb,'multiple-choice','["If $b^{3/4}=8$ for $b>0$, what is $b$?","A) $12$","B) $16$","C) $32$","D) $64$"]'::jsonb,'["Raise both sides to 4/3: b=8^(4/3)=16."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-5','practice-test-8','math','math1',5,1,1,'C','["C"]'::jsonb,'multiple-choice','["Two parallel lines are cut by a transversal. One acute angle measures $41°$. What is the measure of an adjacent obtuse angle?","A) $41°$","B) $49°$","C) $139°$","D) $149°$"]'::jsonb,'["Adjacent angles on a straight line sum to 180°, so 180-41=139°."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-6','practice-test-8','math','math1',6,1,1,'B','["B"]'::jsonb,'multiple-choice','["Two parallel lines are cut by a transversal. Corresponding angles have measures $(4x+12)°$ and $(7x-21)°$. What is $x$?","A) $9$","B) $11$","C) $13$","D) $33$"]'::jsonb,'["Corresponding angles are equal: 4x+12=7x-21, giving x=11."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-7','practice-test-8','math','math1',7,1,1,'C','["C"]'::jsonb,'multiple-choice','["A line crosses two parallel lines. At one intersection an angle measures $126°$. What is the measure of an alternate interior angle?","A) $54°$","B) $63°$","C) $126°$","D) $144°$"]'::jsonb,'["Alternate interior angles formed by a transversal of parallel lines are equal."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-8','practice-test-8','math','math1',8,1,1,'C','["C"]'::jsonb,'multiple-choice','["For which value of $k$ does the system $2x+3y=11$ and $4x+ky=25$ have no solution?","A) $3$","B) $4$","C) $6$","D) $8$"]'::jsonb,'["For parallel distinct lines, coefficients must scale by 2: k=6, but the constants 11 and 25 do not scale."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-9','practice-test-8','math','math1',9,1,1,'B','["B"]'::jsonb,'multiple-choice','["The line $y=mx+7$ passes through $(3,19)$. What is $m+7$?","A) $9$","B) $11$","C) $12$","D) $14$"]'::jsonb,'["19=3m+7 gives m=4 and m+7=11."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-10','practice-test-8','math','math1',10,1,1,'B','["B"]'::jsonb,'multiple-choice','["The quadratic $y=x^2+px+9$ has exactly one real x-intercept. If $p>0$, what is $p$?","A) $3$","B) $6$","C) $9$","D) $18$"]'::jsonb,'["The discriminant p²-36 must be zero, and positive p gives 6."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-11','practice-test-8','math','math1',11,1,1,'B','["B"]'::jsonb,'multiple-choice','["A circle has center $(2,-1)$. A tangent touches the circle at $(5,3)$. What is the slope of the tangent?","A) $\\frac34$","B) $-\\frac34$","C) $\\frac43$","D) $-\\frac43$"]'::jsonb,'["The radius slope is (3-(-1))/(5-2)=4/3, so the perpendicular tangent slope is -3/4."]'::jsonb,false,'verified','text'),
('practice-test-8:math1-12','practice-test-8','math','math1',12,1,1,'A','["A"]'::jsonb,'multiple-choice','["The circle $(x-4)^2+(y+2)^2=49$ is shifted left 3 units and its radius doubled. What is its new equation?","A) $(x-1)^2+(y+2)^2=196$","B) $(x-7)^2+(y+2)^2=196$","C) $(x-1)^2+(y+2)^2=98$","D) $(x-1)^2+(y-2)^2=196$"]'::jsonb,'["The center changes from (4,-2) to (1,-2), and doubling radius 7 gives radius 14 and squared radius 196."]'::jsonb,false,'verified','text')
on conflict(id) do nothing;

insert into public.sat_question_difficulty(question_id,difficulty,concepts,reasoning_steps,integration_level,confidence,rubric_version)
values
('practice-test-8:math1-1','advanced','["radicals and exponents"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-2','advanced','["radicals and exponents"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-3','medium','["radicals and exponents"]'::jsonb,3,'medium',0.99,'original-mock-v1'),
('practice-test-8:math1-4','advanced','["radicals and exponents"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-5','medium','["parallel-line geometry"]'::jsonb,3,'medium',0.99,'original-mock-v1'),
('practice-test-8:math1-6','advanced','["parallel-line geometry"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-7','medium','["parallel-line geometry"]'::jsonb,3,'medium',0.99,'original-mock-v1'),
('practice-test-8:math1-8','advanced','["parameter systems"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-9','advanced','["parameter systems"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-10','advanced','["parameter systems"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-11','advanced','["circle geometry"]'::jsonb,3,'high',0.99,'original-mock-v1'),
('practice-test-8:math1-12','advanced','["circle geometry"]'::jsonb,3,'high',0.99,'original-mock-v1')
on conflict(question_id) do nothing;

import type {PracticeQuestion} from '../types'
const items=[
  {
    "id": "practice-test-8:rw2-1",
    "subject": "english",
    "module": "rw2",
    "number": 1,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "nuanced vocabulary",
    "questionLines": [
      "The pilot project was considered _______ because its results could be applied to a much larger network.",
      "A) scalable",
      "B) obsolete",
      "C) arbitrary",
      "D) irrelevant"
    ],
    "explanationLines": [
      "Scalable means able to be extended to a larger operation."
    ]
  },
  {
    "id": "practice-test-8:rw2-2",
    "subject": "english",
    "module": "rw2",
    "number": 2,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "nuanced vocabulary",
    "questionLines": [
      "The researcher was _______ about the cause because several variables changed at once.",
      "A) certain",
      "B) cautious",
      "C) dogmatic",
      "D) dismissive"
    ],
    "explanationLines": [
      "Cautious matches the inability to isolate a single cause."
    ]
  },
  {
    "id": "practice-test-8:rw2-3",
    "subject": "english",
    "module": "rw2",
    "number": 3,
    "correctAnswer": "C",
    "difficulty": "medium",
    "concept": "nuanced vocabulary",
    "questionLines": [
      "The proposal's benefits were _______ by the unusually high maintenance costs.",
      "A) enhanced",
      "B) confirmed",
      "C) offset",
      "D) ignored"
    ],
    "explanationLines": [
      "Offset means counterbalanced by another factor."
    ]
  },
  {
    "id": "practice-test-8:rw2-4",
    "subject": "english",
    "module": "rw2",
    "number": 4,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "nuanced vocabulary",
    "questionLines": [
      "Her interpretation was _______ with the observations: it accounted for every recorded measurement.",
      "A) inconsistent",
      "B) compatible",
      "C) irrelevant",
      "D) unfounded"
    ],
    "explanationLines": [
      "Compatible means consistent with the observations."
    ]
  },
  {
    "id": "practice-test-8:rw2-5",
    "subject": "english",
    "module": "rw2",
    "number": 5,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "sentence boundaries",
    "questionLines": [
      "Select the correctly punctuated sentence.",
      "A) The storm ended, crews began repairs.",
      "B) The storm ended; crews began repairs.",
      "C) The storm ended; and crews began repairs.",
      "D) The storm ended crews began repairs."
    ],
    "explanationLines": [
      "The semicolon joins two independent clauses."
    ]
  },
  {
    "id": "practice-test-8:rw2-6",
    "subject": "english",
    "module": "rw2",
    "number": 6,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "sentence boundaries",
    "questionLines": [
      "Choose the correct transition punctuation.",
      "A) The trial succeeded, therefore, the design was adopted.",
      "B) The trial succeeded; therefore, the design was adopted.",
      "C) The trial succeeded; therefore the design was adopted.",
      "D) The trial succeeded therefore; the design was adopted."
    ],
    "explanationLines": [
      "Use a semicolon before therefore and comma after it."
    ]
  },
  {
    "id": "practice-test-8:rw2-7",
    "subject": "english",
    "module": "rw2",
    "number": 7,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "sentence boundaries",
    "questionLines": [
      "Which sentence correctly introduces an example?",
      "A) The report describes one concern: the bridge's drainage system.",
      "B) The report describes: one concern the bridge's drainage system.",
      "C) The report: describes one concern the bridge's drainage system.",
      "D) The report describes one: concern, the bridge's drainage system."
    ],
    "explanationLines": [
      "A colon follows the complete independent clause and introduces its elaboration."
    ]
  },
  {
    "id": "practice-test-8:rw2-8",
    "subject": "english",
    "module": "rw2",
    "number": 8,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "sentence boundaries",
    "questionLines": [
      "Which sentence is a complete sentence without an unnecessary semicolon?",
      "A) Although the test ended; the team stayed.",
      "B) Although the test ended, the team stayed.",
      "C) Although the test ended the team stayed;",
      "D) Although; the test ended, the team stayed."
    ],
    "explanationLines": [
      "The dependent clause is followed by a comma before the independent clause."
    ]
  },
  {
    "id": "practice-test-8:rw2-9",
    "subject": "english",
    "module": "rw2",
    "number": 9,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "table interpretation",
    "questionLines": [
      "Solar output in kilowatt-hours: January 120, February 165, March 150. Which month increased by 45 from January?",
      "A) January",
      "B) February",
      "C) March",
      "D) None"
    ],
    "explanationLines": [
      "February exceeded January by 165−120=45 kilowatt-hours."
    ]
  },
  {
    "id": "practice-test-8:rw2-10",
    "subject": "english",
    "module": "rw2",
    "number": 10,
    "correctAnswer": "C",
    "difficulty": "medium",
    "concept": "table interpretation",
    "questionLines": [
      "At Center A, 72 of 80 deliveries were on time; at Center B, 81 of 90 were on time. Which has a higher rate?",
      "A) Center A",
      "B) Center B",
      "C) They are equal",
      "D) Not enough data"
    ],
    "explanationLines": [
      "72/80 and 81/90 are both 90%."
    ]
  },
  {
    "id": "practice-test-8:rw2-11",
    "subject": "english",
    "module": "rw2",
    "number": 11,
    "correctAnswer": "B",
    "difficulty": "medium",
    "concept": "table interpretation",
    "questionLines": [
      "Average wait times fell from 15 to 12 minutes at Site X and from 20 to 14 minutes at Site Y. Which had the larger reduction?",
      "A) Site X, by 3 minutes",
      "B) Site Y, by 3 minutes",
      "C) Site X, by 6 minutes",
      "D) Both fell equally"
    ],
    "explanationLines": [
      "X fell 3 and Y fell 6 minutes, so Y's reduction was 3 greater."
    ]
  },
  {
    "id": "practice-test-8:rw2-12",
    "subject": "english",
    "module": "rw2",
    "number": 12,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "table interpretation",
    "questionLines": [
      "A survey surveyed 40 walkers and 60 cyclists. Of them, 30 walkers and 30 cyclists favored a change. Which group had the higher support percentage?",
      "A) Walkers",
      "B) Cyclists",
      "C) Both equal",
      "D) Not enough data"
    ],
    "explanationLines": [
      "30/40=75% while 30/60=50%."
    ]
  },
  {
    "id": "practice-test-8:rw2-13",
    "subject": "english",
    "module": "rw2",
    "number": 13,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "argument evidence",
    "questionLines": [
      "A study finds that people using the new park also report better sleep, but no sleep data were collected before the park opened. What is a limitation?",
      "A) The study cannot compare sleep before and after opening.",
      "B) Sleep data can never be measured.",
      "C) Park visitors did not report their sleep.",
      "D) Every visitor sleeps equally."
    ],
    "explanationLines": [
      "Without baseline sleep data, improvement cannot be established."
    ]
  },
  {
    "id": "practice-test-8:rw2-14",
    "subject": "english",
    "module": "rw2",
    "number": 14,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "argument evidence",
    "questionLines": [
      "A school hopes replacing noisy fans will improve concentration. Which comparison would provide the strongest evidence?",
      "A) Measure concentration before and after replacement, with an otherwise similar classroom as a comparison.",
      "B) Ask which fan color students prefer.",
      "C) Count the fans in the building.",
      "D) Assume quieter fans improve all scores."
    ],
    "explanationLines": [
      "A before-and-after comparison with a comparison group addresses the proposed effect."
    ]
  },
  {
    "id": "practice-test-8:rw2-15",
    "subject": "english",
    "module": "rw2",
    "number": 15,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "argument evidence",
    "questionLines": [
      "A report says trees reduce street temperature because shaded streets were cooler, but shaded streets also had less traffic. What remains uncertain?",
      "A) Whether reduced traffic contributes to the observed temperature difference",
      "B) Whether the streets had trees",
      "C) Whether the streets had temperatures",
      "D) Whether some streets were shaded"
    ],
    "explanationLines": [
      "Traffic differences are an alternative explanation that was not controlled."
    ]
  },
  {
    "id": "practice-test-8:rw2-16",
    "subject": "english",
    "module": "rw2",
    "number": 16,
    "correctAnswer": "A",
    "difficulty": "medium",
    "concept": "argument evidence",
    "questionLines": [
      "A trial records a 10% faster delivery time after a software update. Which claim is justified?",
      "A) The measured deliveries were faster after the update.",
      "B) The update will improve every delivery everywhere.",
      "C) The update alone caused all improvements.",
      "D) No delivery was slower after the update."
    ],
    "explanationLines": [
      "The measured average improvement does not establish universality or causality."
    ]
  },
  {
    "id": "practice-test-8:math2-1",
    "subject": "math",
    "module": "math2",
    "number": 1,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "radicals and exponents",
    "questionLines": [
      "For $x>0$, simplify $x^{5/2}/x^{1/2}$.",
      "A) $x$",
      "B) $x^2$",
      "C) $x^3$",
      "D) $x^5$"
    ],
    "explanationLines": [
      "Subtract exponents: 5/2−1/2=2."
    ]
  },
  {
    "id": "practice-test-8:math2-2",
    "subject": "math",
    "module": "math2",
    "number": 2,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "radicals and exponents",
    "questionLines": [
      "If $3^{x+2}=81$, what is $x$?",
      "A) 1",
      "B) 2",
      "C) 3",
      "D) 4"
    ],
    "explanationLines": [
      "Rewrite 81 as 3 to the fourth power, so x+2=4 and x=2."
    ]
  },
  {
    "id": "practice-test-8:math2-3",
    "subject": "math",
    "module": "math2",
    "number": 3,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "radicals and exponents",
    "questionLines": [
      "Simplify $\\sqrt{72}$.",
      "A) $3\\sqrt8$",
      "B) $6\\sqrt2$",
      "C) $12\\sqrt2$",
      "D) $8\\sqrt3$"
    ],
    "explanationLines": [
      "72=36×2, so √72=6√2."
    ]
  },
  {
    "id": "practice-test-8:math2-4",
    "subject": "math",
    "module": "math2",
    "number": 4,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "radicals and exponents",
    "questionLines": [
      "If $\\sqrt{2x+9}=5$, what is $x$?",
      "A) 6",
      "B) 8",
      "C) 10",
      "D) 12"
    ],
    "explanationLines": [
      "Square both sides to get 2x+9=25, so x=8."
    ]
  },
  {
    "id": "practice-test-8:math2-5",
    "subject": "math",
    "module": "math2",
    "number": 5,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "parallel-line geometry",
    "questionLines": [
      "Corresponding angles measure $(5x+1)°$ and $(3x+29)°$ across parallel lines. Find $x$.",
      "A) 12",
      "B) 14",
      "C) 16",
      "D) 28"
    ],
    "explanationLines": [
      "Corresponding angles are equal: 5x+1=3x+29, x=14."
    ]
  },
  {
    "id": "practice-test-8:math2-6",
    "subject": "math",
    "module": "math2",
    "number": 6,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "concept": "parallel-line geometry",
    "questionLines": [
      "An angle measures 52°. What is the supplementary angle?",
      "A) 38°",
      "B) 52°",
      "C) 128°",
      "D) 142°"
    ],
    "explanationLines": [
      "A linear pair sums to 180°, so 180−52=128°."
    ]
  },
  {
    "id": "practice-test-8:math2-7",
    "subject": "math",
    "module": "math2",
    "number": 7,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "concept": "parallel-line geometry",
    "questionLines": [
      "Alternate interior angles for two parallel lines are $(7x−5)°$ and $(4x+31)°$. Find $x$.",
      "A) 10",
      "B) 11",
      "C) 12",
      "D) 13"
    ],
    "explanationLines": [
      "Set the angles equal: 7x−5=4x+31, x=12."
    ]
  },
  {
    "id": "practice-test-8:math2-8",
    "subject": "math",
    "module": "math2",
    "number": 8,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "parallel-line geometry",
    "questionLines": [
      "Same-side interior angles are 104° and $y°$. Find $y$.",
      "A) 66°",
      "B) 76°",
      "C) 86°",
      "D) 104°"
    ],
    "explanationLines": [
      "Same-side interior angles are supplementary, so 180−104=76°."
    ]
  },
  {
    "id": "practice-test-8:math2-9",
    "subject": "math",
    "module": "math2",
    "number": 9,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "concept": "parameter systems",
    "questionLines": [
      "For what $k$ do $x+2y=5$ and $2x+ky=13$ have no solution?",
      "A) 2",
      "B) 3",
      "C) 4",
      "D) 5"
    ],
    "explanationLines": [
      "Coefficients are proportional when k=4, but constants 5 and 13 do not scale."
    ]
  },
  {
    "id": "practice-test-8:math2-10",
    "subject": "math",
    "module": "math2",
    "number": 10,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "concept": "parameter systems",
    "questionLines": [
      "The line $y=ax−4$ passes through (3,11). Find $a$.",
      "A) 3",
      "B) 4",
      "C) 5",
      "D) 7"
    ],
    "explanationLines": [
      "11=3a−4 gives 3a=15, a=5."
    ]
  },
  {
    "id": "practice-test-8:math2-11",
    "subject": "math",
    "module": "math2",
    "number": 11,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "concept": "parameter systems",
    "questionLines": [
      "For which $b$ do $4x+by=12$ and $2x+3y=6$ have infinitely many solutions?",
      "A) 3",
      "B) 4",
      "C) 6",
      "D) 12"
    ],
    "explanationLines": [
      "The first must be twice the second, so b=6."
    ]
  },
  {
    "id": "practice-test-8:math2-12",
    "subject": "math",
    "module": "math2",
    "number": 12,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "parameter systems",
    "questionLines": [
      "For $y=x^2+px+25$, the graph touches the x-axis at one point. If $p>0$, find $p$.",
      "A) 5",
      "B) 10",
      "C) 20",
      "D) 25"
    ],
    "explanationLines": [
      "The discriminant p²−100=0 gives p=10."
    ]
  },
  {
    "id": "practice-test-8:math2-13",
    "subject": "math",
    "module": "math2",
    "number": 13,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "circle geometry",
    "questionLines": [
      "Find the center of $(x+6)^2+(y−2)^2=49$.",
      "A) (6,−2)",
      "B) (−6,2)",
      "C) (6,2)",
      "D) (−6,−2)"
    ],
    "explanationLines": [
      "Standard form shows center (−6,2)."
    ]
  },
  {
    "id": "practice-test-8:math2-14",
    "subject": "math",
    "module": "math2",
    "number": 14,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "circle geometry",
    "questionLines": [
      "A radius from (0,0) to (5,12) has length?",
      "A) 12",
      "B) 13",
      "C) 17",
      "D) 169"
    ],
    "explanationLines": [
      "Length √(25+144)=13."
    ]
  },
  {
    "id": "practice-test-8:math2-15",
    "subject": "math",
    "module": "math2",
    "number": 15,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "circle geometry",
    "questionLines": [
      "A circle's diameter is 14. What is its circumference?",
      "A) $7\\pi$",
      "B) $14\\pi$",
      "C) $49\\pi$",
      "D) $196\\pi$"
    ],
    "explanationLines": [
      "Circumference π times diameter gives 14π."
    ]
  },
  {
    "id": "practice-test-8:math2-16",
    "subject": "math",
    "module": "math2",
    "number": 16,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "concept": "circle geometry",
    "questionLines": [
      "A circle with center (−2,3) and radius 4 has which equation?",
      "A) $(x−2)^2+(y+3)^2=16$",
      "B) $(x+2)^2+(y−3)^2=16$",
      "C) $(x+2)^2+(y−3)^2=4$",
      "D) $(x−2)^2+(y−3)^2=16$"
    ],
    "explanationLines": [
      "Standard form centers at (−2,3) and uses radius squared 16."
    ]
  }
] as const
export const MASTERY_MOCK_QUESTIONS:PracticeQuestion[]=items.map(q=>({id:q.id,practiceTestId:'practice-test-8',subject:q.subject,module:q.module,number:q.number,sourcePage:1,answerPage:1,correctAnswer:q.correctAnswer,acceptedAnswers:[q.correctAnswer],responseType:'multiple-choice',contentStatus:'verified',questionMode:'text',difficulty:q.difficulty}))
export function masteryMockContent(id:string){const q=items.find(x=>x.id===id);return q?{questionLines:[...q.questionLines],explanationLines:[...q.explanationLines]}:undefined}

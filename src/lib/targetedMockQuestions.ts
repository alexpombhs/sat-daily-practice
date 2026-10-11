// Bundled preview of the original mock questions. The Supabase migrations are the canonical shared copy.
import type {PracticeQuestion} from '../types'
export type MockQuestionContent={questionLines:string[];explanationLines:string[]}
const items=[
  {
    "id": "practice-test-8:rw1-1",
    "subject": "english",
    "module": "rw1",
    "number": 1,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "The initial map of the underground tunnels was _______: engineers found several unexplored passages that required a revised survey.",
      "A) exhaustive",
      "B) provisional",
      "C) redundant",
      "D) indisputable"
    ],
    "explanationLines": [
      "Provisional means subject to revision; newly discovered tunnels require updating the map."
    ]
  },
  {
    "id": "practice-test-8:rw1-2",
    "subject": "english",
    "module": "rw1",
    "number": 2,
    "correctAnswer": "C",
    "difficulty": "medium",
    "questionLines": [
      "Although the town committee proposed several costly projects, its final recommendation was _______ and focused on repairing the existing footbridge.",
      "A) extravagant",
      "B) ambiguous",
      "C) pragmatic",
      "D) ornamental"
    ],
    "explanationLines": [
      "Pragmatic means practical; repairing the existing bridge is the practical alternative to costly projects."
    ]
  },
  {
    "id": "practice-test-8:rw1-3",
    "subject": "english",
    "module": "rw1",
    "number": 3,
    "correctAnswer": "A",
    "difficulty": "advanced",
    "questionLines": [
      "The researcher's statement was carefully _______: she acknowledged that the small sample prevented a firm conclusion about the entire population.",
      "A) qualified",
      "B) repudiated",
      "C) generalized",
      "D) amplified"
    ],
    "explanationLines": [
      "Qualified means limited or made conditional; the researcher explicitly restricted the strength of the claim."
    ]
  },
  {
    "id": "practice-test-8:rw1-4",
    "subject": "english",
    "module": "rw1",
    "number": 4,
    "correctAnswer": "B",
    "difficulty": "medium",
    "questionLines": [
      "The architect's proposal was initially viewed as _______ because it relied on a material that had not yet been tested in large structures.",
      "A) conventional",
      "B) speculative",
      "C) routine",
      "D) conclusive"
    ],
    "explanationLines": [
      "Speculative describes a proposal not yet supported by sufficient evidence."
    ]
  },
  {
    "id": "practice-test-8:rw1-5",
    "subject": "english",
    "module": "rw1",
    "number": 5,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "questionLines": [
      "Despite sounding confident, the historian's argument was _______ by newly discovered correspondence that contradicted its central date.",
      "A) corroborated",
      "B) illustrated",
      "C) undermined",
      "D) anticipated"
    ],
    "explanationLines": [
      "Undermined means weakened; contradictory evidence challenges the argument."
    ]
  },
  {
    "id": "practice-test-8:rw1-6",
    "subject": "english",
    "module": "rw1",
    "number": 6,
    "correctAnswer": "B",
    "difficulty": "medium",
    "questionLines": [
      "Choose the sentence that uses punctuation correctly.",
      "A) The new library opened in June, it serves three neighborhoods.",
      "B) The new library opened in June; it serves three neighborhoods.",
      "C) The new library opened in June; and serves three neighborhoods.",
      "D) The new library opened in June: and it serves three neighborhoods."
    ],
    "explanationLines": [
      "A semicolon correctly joins two independent clauses without a coordinating conjunction."
    ]
  },
  {
    "id": "practice-test-8:rw1-7",
    "subject": "english",
    "module": "rw1",
    "number": 7,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "Choose the version that correctly combines these ideas: The prototype passed every safety test. The engineers nevertheless requested another inspection.",
      "A) The prototype passed every safety test, nevertheless the engineers requested another inspection.",
      "B) The prototype passed every safety test; nevertheless, the engineers requested another inspection.",
      "C) The prototype passed every safety test nevertheless; the engineers requested another inspection.",
      "D) The prototype passed every safety test, nevertheless, the engineers requested another inspection."
    ],
    "explanationLines": [
      "Nevertheless is a conjunctive adverb; a semicolon separates the independent clauses and a comma follows the transition."
    ]
  },
  {
    "id": "practice-test-8:rw1-8",
    "subject": "english",
    "module": "rw1",
    "number": 8,
    "correctAnswer": "A",
    "difficulty": "medium",
    "questionLines": [
      "Which sentence correctly introduces an explanation with a colon?",
      "A) The trail was closed for one reason: a fallen tree blocked the entrance.",
      "B) The trail was closed for: one reason a fallen tree blocked the entrance.",
      "C) The trail was closed because: a fallen tree blocked the entrance.",
      "D) The trail was closed for one reason, a fallen tree blocked the entrance."
    ],
    "explanationLines": [
      "A colon can follow the complete clause 'The trail was closed for one reason' to introduce its explanation."
    ]
  },
  {
    "id": "practice-test-8:rw1-9",
    "subject": "english",
    "module": "rw1",
    "number": 9,
    "correctAnswer": "C",
    "difficulty": "medium",
    "questionLines": [
      "A school tracked participation in three clubs. Robotics: 26 students in September and 34 in October. Debate: 38 in September and 35 in October. Art: 20 in September and 31 in October. Which club had the largest numerical increase?",
      "A) Robotics",
      "B) Debate",
      "C) Art",
      "D) Robotics and Art tied"
    ],
    "explanationLines": [
      "Art increased by 11, Robotics by 8, and Debate decreased by 3."
    ]
  },
  {
    "id": "practice-test-8:rw1-10",
    "subject": "english",
    "module": "rw1",
    "number": 10,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "questionLines": [
      "A transit report shows on-time trips: Route A, 72 of 90; Route B, 84 of 120; Route C, 63 of 70. Which route had the highest on-time percentage?",
      "A) Route A",
      "B) Route B",
      "C) Route C",
      "D) Routes A and B tied"
    ],
    "explanationLines": [
      "Route C was on time for 63/70 = 90%, compared with 80% for A and 70% for B."
    ]
  },
  {
    "id": "practice-test-8:rw1-11",
    "subject": "english",
    "module": "rw1",
    "number": 11,
    "correctAnswer": "B",
    "difficulty": "medium",
    "questionLines": [
      "A lab measured plant growth with and without added nutrients. Species X: 12 cm without, 18 cm with. Species Y: 16 cm without, 17 cm with. Which statement is directly supported?",
      "A) Both species grew exactly 6 cm more with nutrients.",
      "B) Species X showed a larger increase than Species Y.",
      "C) Species Y grew less with nutrients than without.",
      "D) Added nutrients made both species reach the same height."
    ],
    "explanationLines": [
      "Species X gained 6 cm whereas Species Y gained 1 cm."
    ]
  },
  {
    "id": "practice-test-8:rw1-12",
    "subject": "english",
    "module": "rw1",
    "number": 12,
    "correctAnswer": "A",
    "difficulty": "advanced",
    "questionLines": [
      "A researcher claims that a redesigned intersection reduced drivers' average speed without reducing pedestrian use. Before the redesign: average speed 32 mph and 430 pedestrians per day. After: 25 mph and 460 pedestrians per day. Which conclusion follows?",
      "A) Speeds fell, and pedestrian use rose.",
      "B) Speeds fell because pedestrian use rose.",
      "C) Pedestrian use fell while speeds remained constant.",
      "D) The redesign alone proves a reduction in crashes."
    ],
    "explanationLines": [
      "The two measurements support a speed decrease and pedestrian increase; they do not establish causation or crash outcomes."
    ]
  },
  {
    "id": "practice-test-8:math1-1",
    "subject": "math",
    "module": "math1",
    "number": 1,
    "correctAnswer": "A",
    "difficulty": "advanced",
    "questionLines": [
      "If $3^{2x}=\\sqrt[3]{3^{10}}$, what is $x$?",
      "A) $\\frac{5}{3}$",
      "B) $\\frac{10}{3}$",
      "C) $5$",
      "D) $\\frac{20}{3}$"
    ],
    "explanationLines": [
      "Set 2x=10/3, so x=5/3."
    ]
  },
  {
    "id": "practice-test-8:math1-2",
    "subject": "math",
    "module": "math1",
    "number": 2,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "For $a>0$, simplify $\\frac{a^{7/2}}{a^{1/2}}$.",
      "A) $a^4$",
      "B) $a^3$",
      "C) $a^{7/4}$",
      "D) $a^7$"
    ],
    "explanationLines": [
      "Subtract the exponents: 7/2 - 1/2 = 3."
    ]
  },
  {
    "id": "practice-test-8:math1-3",
    "subject": "math",
    "module": "math1",
    "number": 3,
    "correctAnswer": "D",
    "difficulty": "medium",
    "questionLines": [
      "What positive value of $t$ satisfies $\\sqrt{5t+4}=8$?",
      "A) $10$",
      "B) $11$",
      "C) $13$",
      "D) $12$"
    ],
    "explanationLines": [
      "Squaring gives 5t+4=64, so t=12."
    ]
  },
  {
    "id": "practice-test-8:math1-4",
    "subject": "math",
    "module": "math1",
    "number": 4,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "If $b^{3/4}=8$ for $b>0$, what is $b$?",
      "A) $12$",
      "B) $16$",
      "C) $32$",
      "D) $64$"
    ],
    "explanationLines": [
      "Raise both sides to 4/3: b=8^(4/3)=16."
    ]
  },
  {
    "id": "practice-test-8:math1-5",
    "subject": "math",
    "module": "math1",
    "number": 5,
    "correctAnswer": "C",
    "difficulty": "medium",
    "questionLines": [
      "Two parallel lines are cut by a transversal. One acute angle measures $41°$. What is the measure of an adjacent obtuse angle?",
      "A) $41°$",
      "B) $49°$",
      "C) $139°$",
      "D) $149°$"
    ],
    "explanationLines": [
      "Adjacent angles on a straight line sum to 180°, so 180-41=139°."
    ]
  },
  {
    "id": "practice-test-8:math1-6",
    "subject": "math",
    "module": "math1",
    "number": 6,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "Two parallel lines are cut by a transversal. Corresponding angles have measures $(4x+12)°$ and $(7x-21)°$. What is $x$?",
      "A) $9$",
      "B) $11$",
      "C) $13$",
      "D) $33$"
    ],
    "explanationLines": [
      "Corresponding angles are equal: 4x+12=7x-21, giving x=11."
    ]
  },
  {
    "id": "practice-test-8:math1-7",
    "subject": "math",
    "module": "math1",
    "number": 7,
    "correctAnswer": "C",
    "difficulty": "medium",
    "questionLines": [
      "A line crosses two parallel lines. At one intersection an angle measures $126°$. What is the measure of an alternate interior angle?",
      "A) $54°$",
      "B) $63°$",
      "C) $126°$",
      "D) $144°$"
    ],
    "explanationLines": [
      "Alternate interior angles formed by a transversal of parallel lines are equal."
    ]
  },
  {
    "id": "practice-test-8:math1-8",
    "subject": "math",
    "module": "math1",
    "number": 8,
    "correctAnswer": "C",
    "difficulty": "advanced",
    "questionLines": [
      "For which value of $k$ does the system $2x+3y=11$ and $4x+ky=25$ have no solution?",
      "A) $3$",
      "B) $4$",
      "C) $6$",
      "D) $8$"
    ],
    "explanationLines": [
      "For parallel distinct lines, coefficients must scale by 2: k=6, but the constants 11 and 25 do not scale."
    ]
  },
  {
    "id": "practice-test-8:math1-9",
    "subject": "math",
    "module": "math1",
    "number": 9,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "The line $y=mx+7$ passes through $(3,19)$. What is $m+7$?",
      "A) $9$",
      "B) $11$",
      "C) $12$",
      "D) $14$"
    ],
    "explanationLines": [
      "19=3m+7 gives m=4 and m+7=11."
    ]
  },
  {
    "id": "practice-test-8:math1-10",
    "subject": "math",
    "module": "math1",
    "number": 10,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "The quadratic $y=x^2+px+9$ has exactly one real x-intercept. If $p>0$, what is $p$?",
      "A) $3$",
      "B) $6$",
      "C) $9$",
      "D) $18$"
    ],
    "explanationLines": [
      "The discriminant p²-36 must be zero, and positive p gives 6."
    ]
  },
  {
    "id": "practice-test-8:math1-11",
    "subject": "math",
    "module": "math1",
    "number": 11,
    "correctAnswer": "B",
    "difficulty": "advanced",
    "questionLines": [
      "A circle has center $(2,-1)$. A tangent touches the circle at $(5,3)$. What is the slope of the tangent?",
      "A) $\\frac34$",
      "B) $-\\frac34$",
      "C) $\\frac43$",
      "D) $-\\frac43$"
    ],
    "explanationLines": [
      "The radius slope is (3-(-1))/(5-2)=4/3, so the perpendicular tangent slope is -3/4."
    ]
  },
  {
    "id": "practice-test-8:math1-12",
    "subject": "math",
    "module": "math1",
    "number": 12,
    "correctAnswer": "A",
    "difficulty": "advanced",
    "questionLines": [
      "The circle $(x-4)^2+(y+2)^2=49$ is shifted left 3 units and its radius doubled. What is its new equation?",
      "A) $(x-1)^2+(y+2)^2=196$",
      "B) $(x-7)^2+(y+2)^2=196$",
      "C) $(x-1)^2+(y+2)^2=98$",
      "D) $(x-1)^2+(y-2)^2=196$"
    ],
    "explanationLines": [
      "The center changes from (4,-2) to (1,-2), and doubling radius 7 gives radius 14 and squared radius 196."
    ]
  }
] as const
export const TARGETED_MOCK_QUESTIONS:PracticeQuestion[]=items.map(item=>({
  id:item.id,practiceTestId:'practice-test-8',subject:item.subject,module:item.module,
  number:item.number,sourcePage:1,answerPage:1,correctAnswer:item.correctAnswer,
  acceptedAnswers:[item.correctAnswer],responseType:'multiple-choice',
  contentStatus:'verified',questionMode:'text',difficulty:item.difficulty,
}))
export function targetedMockContent(id:string):MockQuestionContent|undefined{
  const item=items.find(question=>question.id===id)
  return item?{questionLines:[...item.questionLines],explanationLines:[...item.explanationLines]}:undefined
}

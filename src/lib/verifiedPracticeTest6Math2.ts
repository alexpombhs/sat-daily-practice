export type VerifiedPracticeTest6Math2Content={lines:string[];needsVisual?:boolean}
const q=(lines:string[],needsVisual=false):VerifiedPracticeTest6Math2Content=>({lines,needsVisual})

export const VERIFIED_PRACTICE_TEST_6_MATH2:Record<number,VerifiedPracticeTest6Math2Content>={
  1:q(["The function $f$ is defined by $f(x)=8x$. For what value of $x$ does $f(x)=72$?","A) $8$","B) $9$","C) $64$","D) $80$"]),
  2:q(["In the figure, two lines intersect at a point. Angle 1 and angle 2 are vertical angles. The measure of angle 1 is $72^\\circ$. What is the measure of angle 2?","A) $72^\\circ$","B) $108^\\circ$","C) $144^\\circ$","D) $288^\\circ$"],true),
  3:q(["On a street with 7 houses, 2 houses are blue. If a house from this street is selected at random, what is the probability of selecting a house that is blue?","A) $\\frac{1}{7}$","B) $\\frac{2}{7}$","C) $\\frac{5}{7}$","D) $\\frac{7}{7}$"]),
  4:q(["The graph of function $f$ is shown, where $y=f(x)$.","Which of the following describes function $f$?","A) Increasing linear","B) Decreasing linear","C) Increasing exponential","D) Decreasing exponential"],true),
  5:q(["The graph of the function $f$ is shown, where $y=f(x)$. What is the $y$-intercept of the graph?","A) $(0,-1)$","B) $(0,-4)$","C) $(0,1)$","D) $(0,4)$"],true),
  6:q(["$$\\begin{aligned}x&=8\\\\x+3y&=26\\end{aligned}$$","The solution to the given system of equations is $(x,y)$. What is the value of $y$?"]),
  7:q(["The amount of Hanna’s bill for a food order was $50. Hanna gave a tip of 20% of the amount of the bill. What is the amount, in dollars, of the tip Hanna gave?"]),
  8:q(["Which expression is equivalent to $5x^5-6x^4+8x^3$?","A) $x^4(5x-6)$","B) $x^3(5x^2-6x+8)$","C) $8x^3(5x^2-6x+1)$","D) $6x^5(-6x^4+8x^3+1)$"]),
  9:q(["The ratio of the length of line segment $XY$ to the length of line segment $ZV$ is 6 to 1. If the length of line segment $XY$ is 102 inches, what is the length, in inches, of line segment $ZV$?","A) $17$","B) $96$","C) $102$","D) $612$"]),
  10:q(["$$7(2x-3)=63$$","Which equation has the same solution as the given equation?","A) $2x-3=9$","B) $2x-3=56$","C) $2x-21=63$","D) $2x-21=70$"]),
  11:q(["The function $f$ defined by $f(t)=14t+9$ gives the estimated length, in inches, of a vine plant $t$ months after Tavon purchased it. Which of the following is the best interpretation of 9 in this context?","A) Tavon will keep the vine plant for 9 months.","B) The vine plant is expected to grow 9 inches each month.","C) The vine plant is expected to grow to a maximum length of 9 inches.","D) The estimated length of the vine plant was 9 inches when Tavon purchased it."]),
  12:q(["$$(x+2)(x-5)(x+9)=0$$","What is a positive solution to the given equation?","A) $3$","B) $4$","C) $5$","D) $18$"]),
  13:q(["Brian saves $\\frac{2}{5}$ of the $215 he earns each week from his job. If Brian continues to save at this rate, how much money, in dollars, will Brian save in 9 weeks?"]),
  14:q(["A rectangle has an area of 155 square inches. The length of the rectangle is 4 inches less than 7 times the width of the rectangle. What is the width of the rectangle, in inches?"]),
  15:q(["4, 10, 18, 4, 4, 5, 6, 5","What is the median of the data set shown?","A) $4$","B) $5$","C) $7$","D) $14$"]),
  16:q(["A right circular cylinder has a volume of 432 cubic centimeters. The area of the base of the cylinder is 24 square centimeters. What is the height, in centimeters, of the cylinder?","A) $18$","B) $24$","C) $216$","D) $10{,}368$"]),
  17:q(["$$x^2=-841$$","How many distinct real solutions does the given equation have?","A) Exactly one","B) Exactly two","C) Infinitely many","D) Zero"]),
  18:q(["Line $k$ is defined by $y=7x+\\frac{1}{8}$. Line $j$ is perpendicular to line $k$ in the $xy$-plane. What is the slope of line $j$?","A) $-8$","B) $-\\frac{1}{7}$","C) $\\frac{1}{8}$","D) $7$"]),
  19:q(["The table shows the linear relationship between the number of cars, $c$, on a commuter train and the maximum number of passengers and crew, $p$, that the train can carry.","Number of cars\tMaximum number of passengers and crew","3\t174","5\t284","10\t559","Which equation represents the linear relationship between $c$ and $p$?","A) $55c-p=-9$","B) $55c-p=9$","C) $55p-c=-9$","D) $55p-c=9$"]),
  26:q([
    "The graph displays data set $E$ with a line of best fit. Data set $F$ is formed by multiplying every $y$-value in $E$ by $3.9$. Which equation could model the line of best fit for $F$?",
    "A) $y=46.8+5.9x$",
    "B) $y=46.8+1.5x$",
    "C) $y=12+5.9x$",
    "D) $y=12+1.5x$",
  ],true),
  25:q([
    "In the $xy$-plane, a circle has center $C$ with coordinates $(h,k)$. Points $A$ and $B$ lie on the circle. Point $A$ has coordinates $(h+1,k+\\sqrt{102})$, and $\\angle ACB$ is a right angle. What is the length of $\\overline{AB}$?",
    "A) $\\sqrt{206}$",
    "B) $2\\sqrt{102}$",
    "C) $103\\sqrt{2}$",
    "D) $103\\sqrt{3}$",
  ]),
}

export function verifiedPracticeTest6Math2Content(questionNumber:number){return VERIFIED_PRACTICE_TEST_6_MATH2[questionNumber]}

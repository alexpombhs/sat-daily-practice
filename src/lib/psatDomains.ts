import type {PracticeQuestion,Subject} from '../types'

// College Board PSAT/SAT content domains. These are not the broader concept clusters
// used for the existing pre-test review feature.
export const PSAT_DOMAINS=[
  {id:'craft-structure',label:'Craft and Structure',subject:'english'},
  {id:'information-ideas',label:'Information and Ideas',subject:'english'},
  {id:'expression-ideas',label:'Expression of Ideas',subject:'english'},
  {id:'standard-conventions',label:'Standard English Conventions',subject:'english'},
  {id:'algebra',label:'Algebra',subject:'math'},
  {id:'advanced-math',label:'Advanced Math',subject:'math'},
  {id:'problem-solving-data',label:'Problem-Solving and Data Analysis',subject:'math'},
  {id:'geometry-trigonometry',label:'Geometry and Trigonometry',subject:'math'},
] as const satisfies ReadonlyArray<{id:string;label:string;subject:Subject}>

export type PsatDomainId=(typeof PSAT_DOMAINS)[number]['id']
export type PsatDomainFilter=PsatDomainId|'all'|'uncategorized'
export type PsatDomainBand=Partial<Record<PsatDomainId,string>>
export interface PsatScoreReport {
  year:number
  readingWriting:number|null
  math:number|null
  percentile:number|null
  bands:PsatDomainBand
}

export function domainForId(id:PsatDomainId){
  return PSAT_DOMAINS.find(domain=>domain.id===id)!
}

export function isPsatDomainId(value:unknown):value is PsatDomainId{
  return typeof value==='string'&&PSAT_DOMAINS.some(domain=>domain.id===value)
}

// Map existing per-question concept tags to PSAT domains without guessing from
// the passage content or the question number. Unknown tags stay uncategorized.
// The canonical concept tags are still preserved for more granular review.
const ENGLISH_RULES:Array<[PsatDomainId,RegExp]>=[
  ['standard-conventions',/punctuat|convention|grammar|sentence boundar|clause boundar|independent clause|verb (tense|form|agreement)|subject.?verb|modifier|apostroph|semicolon|colon|comma|possessiv|tense|finite verb|pronoun|grammatical|supplementary element|participial phrase|sentence structure|coordination|parallel structure|plural subject|singular subject|conjunctive adverb punctuat|direct question structure|subject auxiliary inversion|question mark|infinitive after|verb complementation|preposition|collocation/i],
  ['expression-ideas',/rhetorical synthesis|synthesis of (notes|details)|student notes|\bnotes\b|transition|logical relationship|audience awareness|audience background|effective language|rhetorical goal|information synthesis|organizing (ideas|information)/i],
  ['craft-structure',/word.{0,3}in.context|vocab|context clue|lexical|diction|connotation|word choice|precision|figurative|metaphor|simile|analogy|poetry structure|text structure|sentence function|main purpose|speaker.s purpose|author.s purpose|author.s perspective|tone|rhetorical purpose|narrative structure|passage organization|argument structure|purpose of|\bpurpose\b|text function|shifts? in|paired text|cross.text|academic phrase|precise noun|author disagreement|author response|refutation/i],
  ['information-ideas',/evidence|inference|infer|central idea|main idea|detail|claim|graph|table|data|research|experiment|scientific|finding|hypothesis|supporting|logical completion|interpretation|literal comprehension|textual support|reading comprehension|compare|contrast|character|historical reasoning|logical conclusion|\bargument\b|\bsummary\b|conditional reasoning|ethical framework|economic instability|chronology|historical linguistics|main.idea synthesis/i],
]
const MATH_RULES:Array<[PsatDomainId,RegExp]>=[
  ['geometry-trigonometry',/geometr|trigon|triang|angle|circle|pythag|radius|diameter|circumference|perimeter|area|volume|rectangle|polygon|similarity|similar triangles|congruen|arc measure|right.triangle|parallel lines|scale factor|surface area/i],
  ['problem-solving-data',/\bratio\b|\bratios\b|\brate\b|\brates\b|percent|proportion|probab|statisti|sample|data|scatter|two.way table|table interpretation|frequency|line of best fit|\bmean\b|\bmedian\b|\bmode\b|distribution|margin of error|unit conversion|unit rate|units? of measure|dot plot|box plot|survey|population|trend|categorical|graph interpretation|line graph reading|time series|sampling|margins? of error|categor(y|ies) totals|table reading|averages/i],
  ['advanced-math',/quadratic|polynomial|exponent|radical|square root|cube root|rational|nonlinear|exponential|vertex|parabola|complex number|discriminant|factor|zero product|function evaluation|function notation|absolute value|equivalent expressions|growth factor|decay|horizontal translation|vertical translation|function interpretation/i],
  ['algebra',/linear|slope|intercept|system|equation|inequal|variable|substitution|elimination|ordered pairs|constraint|modeling|parameter|graphing|expression|isolating|one.step|two.step|literal|function|coordinate|intersection|\balgebra\b/i],
]

export function categorizeConcepts(subject:Subject,concepts:readonly string[]|undefined):PsatDomainId|null{
  if(!concepts?.length)return null
  const tags=concepts.join(' | ')
  const rules=subject==='english'?ENGLISH_RULES:MATH_RULES
  return rules.find(([,pattern])=>pattern.test(tags))?.[0]??null
}

export function questionPsatDomain(question:PracticeQuestion):PsatDomainId|null{
  if(isPsatDomainId(question.psatDomain)&&domainForId(question.psatDomain).subject===question.subject)return question.psatDomain
  return categorizeConcepts(question.subject,question.concepts)
}

export function matchesPsatDomain(question:PracticeQuestion,filter:PsatDomainFilter|undefined){
  if(!filter||filter==='all')return true
  const domain=questionPsatDomain(question)
  return filter==='uncategorized'?domain===null:domain===filter
}

import type {Attempt,PracticeQuestion} from '../types'

export type ConceptPriority={
  concept:string
  attempts:number
  correct:number
  incorrect:number
  accuracy:number
  recentAccuracy:number
  unresolved:number
  questionIds:string[]
  priority:number
  failureRate:number
}

export function reviewConceptGroup(tags:string[],subject:'math'|'english'):string{
  const value=tags.join(' ').toLowerCase()
  if(subject==='english'){
    if(/vocab|word|semantic|meaning|contextual|lexical|diction/.test(value))return 'Vocabulary & Words in Context'
    if(/punctuat|sentence|clause|modifier|appositive|grammar|verb|transition|convention|apostroph|semicolon|colon/.test(value))return 'Grammar & Sentence Structure'
    if(/table|chart|graph|data|research|experiment|evidence|bias|finding/.test(value))return 'Evidence & Data Interpretation'
    if(/rhetoric|argument|purpose|structure|organiz|synthesi|revision|support|claim/.test(value))return 'Rhetorical Skills & Arguments'
    return 'Reading Comprehension & Inference'
  }
  if(/exponent|power|radical|root|rational algebra|simplif/.test(value))return 'Exponents, Radicals & Expressions'
  if(/system|linear|parallel|parameter|constraint|equation|inequal|slope|intercept/.test(value))return 'Linear Equations & Systems'
  if(/quadratic|parabola|polynomial|factor|zero|nonlinear/.test(value))return 'Quadratics & Nonlinear Functions'
  if(/geometry|triangle|angle|circle|pythagor|area|volume|similar|trigonomet/.test(value))return 'Geometry & Trigonometry'
  if(/percent|ratio|proportion|rate|probabil|statistic|average|mean|median|data|table|graph/.test(value))return 'Data, Ratios & Statistics'
  return 'Advanced Algebra & Modeling'
}

export function rankReviewConcepts(questions:PracticeQuestion[],attempts:Attempt[]):ConceptPriority[]{
  const questionMap=new Map(questions.map(q=>[q.id,q]))
  const grouped=new Map<string,Map<string,Attempt[]>>()
  for(const a of attempts){
    const question=questionMap.get(a.questionId)
    if(!question?.concepts?.length)continue
    const concept=reviewConceptGroup(question.concepts,question.subject)
    if(!grouped.has(concept))grouped.set(concept,new Map())
    const byQuestion=grouped.get(concept)!
    byQuestion.set(a.questionId,[...(byQuestion.get(a.questionId)??[]),a])
  }
  return [...grouped].map(([concept,byQuestion])=>{
    let total=0,correct=0,unresolved=0,recentCorrect=0
    const questionIds:string[]=[]
    for(const [id,rows] of byQuestion){
      const ordered=[...rows].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
      total+=ordered.length
      correct+=ordered.filter(a=>a.correct).length
      if(ordered[ordered.length-1].correct)recentCorrect++
      else unresolved++
      questionIds.push(id)
    }
    const incorrect=total-correct
    const accuracy=total?Math.round(100*correct/total):100
    const recentAccuracy=byQuestion.size?Math.round(100*recentCorrect/byQuestion.size):100
    const failureRate=total?100*incorrect/total:0
    return {concept,attempts:total,correct,incorrect,accuracy,recentAccuracy,unresolved,questionIds,priority:failureRate,failureRate}
  }).filter(item=>item.incorrect>0)
    .sort((a,b)=>b.failureRate-a.failureRate||b.incorrect-a.incorrect||b.unresolved-a.unresolved||a.concept.localeCompare(b.concept))
}

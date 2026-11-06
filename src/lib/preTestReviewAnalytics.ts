import {PSAT_DOMAINS,questionPsatDomain,type PsatDomainId} from './psatDomains'
import type {Attempt,PracticeQuestion,Subject} from '../types'

export type ReviewQuestion={
  question:PracticeQuestion
  first:Attempt|null
  last:Attempt|null
  attemptCount:number
}
export type ReviewSummary={
  domain:PsatDomainId
  label:string
  questions:ReviewQuestion[]
  attempted:number
  firstCorrect:number
  firstAccuracy:number|null
  latestAccuracy:number|null
  firstMisses:number
  reviewedCorrections:number
  advancedAttempted:number
  advancedFirstCorrect:number
  unseen:number
  averageFirstSeconds:number|null
}
export type CraftSubskill='words'|'structure'|'cross-text'
export const CRAFT_SKILLS:Record<CraftSubskill,{label:string;tip:string}>={
  words:{label:'Words in Context',tip:'Use context, logic and precise word meaning.'},
  structure:{label:'Text Structure and Purpose',tip:'Identify the role of a sentence or passage in the argument.'},
  'cross-text':{label:'Cross-Text Connections',tip:'Compare each author’s position and likely response.'},
}

// These are explanatory subskill groups WITHIN the explicitly audited
// Craft and Structure domain. They never assign an official SAT domain.
export function craftSubskill(question:PracticeQuestion):CraftSubskill{
  const tags=(question.concepts??[]).join(' ').toLowerCase()
  if(/cross.text|paired.text|paired texts|text 1|text 2|two authors|cross.passage/.test(tags))return 'cross-text'
  if(/vocab|word|meaning|diction|semantic|lexical|idiom|phrase|contextual|precise/.test(tags))return 'words'
  return 'structure'
}

const pct=(n:number,d:number)=>d?Math.round(n/d*100):null

export function summarizeDomain(domain:PsatDomainId,label:string,items:ReviewQuestion[]):ReviewSummary{
  const seen=items.filter(row=>row.first)
  const firstCorrect=seen.filter(row=>row.first?.correct).length
  const latestCorrect=seen.filter(row=>row.last?.correct).length
  const advanced=seen.filter(row=>row.question.difficulty==='advanced')
  const firstTimes=seen.map(row=>row.first?.elapsedMs).filter((value):value is number=>typeof value==='number'&&Number.isFinite(value))
  return {
    domain,label,questions:items,attempted:seen.length,firstCorrect,firstAccuracy:pct(firstCorrect,seen.length),
    latestAccuracy:pct(latestCorrect,seen.length),firstMisses:seen.length-firstCorrect,
    reviewedCorrections:seen.filter(row=>row.first&&!row.first.correct&&row.last?.correct).length,
    advancedAttempted:advanced.length,advancedFirstCorrect:advanced.filter(row=>row.first?.correct).length,
    unseen:items.length-seen.length,averageFirstSeconds:firstTimes.length?Math.round(firstTimes.reduce((a,b)=>a+b,0)/firstTimes.length/1000):null,
  }
}


export function buildPreTestQuestionRows(questions:PracticeQuestion[],attempts:Attempt[]):ReviewQuestion[]{
  const history=new Map<string,Attempt[]>()
  for(const attempt of attempts){
    history.set(attempt.questionId,[...(history.get(attempt.questionId)??[]),attempt])
  }
  return questions.map(question=>{
    const ordered=[...(history.get(question.id)??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))
    return {question,first:ordered[0]??null,last:ordered[ordered.length-1]??null,attemptCount:ordered.length}
  })
}

export function buildPreTestDomainReview(questions:PracticeQuestion[],attempts:Attempt[],subject:Subject):ReviewSummary[]{
  const states=buildPreTestQuestionRows(questions.filter(q=>q.subject===subject),attempts)
  return PSAT_DOMAINS.filter(domain=>domain.subject===subject).map(domain=>summarizeDomain(
    domain.id,domain.label,states.filter(row=>questionPsatDomain(row.question)===domain.id),
  ))
}

export type ReviewHistoryFilter='missed'|'unseen'|'all'

// One order works for both concept groups and audited SAT categories:
// incorrect first attempts first for review, then untouched questions,
// then questions already correct on the first attempt.
export function sortReviewQuestionRows(rows:ReviewQuestion[],filter:ReviewHistoryFilter='all'):ReviewQuestion[]{
  const relevant=rows.filter(row=>filter==='missed'
    ?Boolean(row.first&&!row.first.correct)
    :filter==='unseen'?!row.first:true)
  const rank=(row:ReviewQuestion)=>row.first&&!row.first.correct?0:!row.first?1:2
  return [...relevant].sort((a,b)=>rank(a)-rank(b)
    ||Number(Boolean(a.last?.correct))-Number(Boolean(b.last?.correct))
    ||Number(b.question.difficulty==='advanced')-Number(a.question.difficulty==='advanced')
    ||b.attemptCount-a.attemptCount
    ||a.question.id.localeCompare(b.question.id))
}

// A focused group session draws ONLY from its selected group, prioritizes
// previously unseen questions, then first-try misses, and uses the existing
// per-session question limit in the app. The order is shared by both views.
export function orderedGroupSessionQuestionIds(rows:ReviewQuestion[]):string[]{
  const priority=(row:ReviewQuestion)=>!row.first?0:row.first.correct?2:1
  return [...rows].sort((a,b)=>priority(a)-priority(b)
    ||Number(b.question.difficulty==='advanced')-Number(a.question.difficulty==='advanced')
    ||a.question.id.localeCompare(b.question.id)).map(row=>row.question.id)
}

export function reviewQuestionOrder(summary:ReviewSummary,filter:ReviewHistoryFilter):ReviewQuestion[]{
  return sortReviewQuestionRows(summary.questions,filter)
}

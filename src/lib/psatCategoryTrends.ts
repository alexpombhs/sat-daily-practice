import {PSAT_DOMAINS,questionPsatDomain,type PsatDomainId} from './psatDomains'
import type {Attempt,PracticeQuestion,SessionSummary,Subject} from '../types'

export type PsatCategoryPerformance={domain:PsatDomainId;questions:number;accuracy:number|null}
export type PsatCategorySnapshot={date:string;totalDistinct:number;domains:PsatCategoryPerformance[]}

const MAX_PER_SUBJECT=60
const OLDER_ATTEMPT_WEIGHT=.6
const PRIOR_STRENGTH=.1

// Use the same 60-most-recent-distinct-per-subject window and recency-weighted
// success probability used by the SAT score prediction. Repeat attempts
// contribute to probability but do not inflate the unique-question sample.
export function recentCategorySnapshot(attempts:Attempt[],questions:PracticeQuestion[],date=''):PsatCategorySnapshot{
  const byId=new Map(questions.map(q=>[q.id,q]))
  const sorted=[...attempts].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
  const selected:Record<Subject,string[]>={english:[],math:[]}
  const seen=new Set<string>()
  for(const attempt of sorted){
    const question=byId.get(attempt.questionId)
    if(!question||seen.has(attempt.questionId)||selected[question.subject].length>=MAX_PER_SUBJECT)continue
    seen.add(attempt.questionId)
    selected[question.subject].push(question.id)
  }
  const history=new Map<string,Attempt[]>()
  for(const attempt of attempts){
    if(!seen.has(attempt.questionId))continue
    const current=history.get(attempt.questionId)??[]
    current.push(attempt)
    history.set(attempt.questionId,current)
  }
  const grouped=new Map<PsatDomainId,number[]>()
  for(const id of seen){
    const question=byId.get(id)
    if(!question)continue
    const domain=questionPsatDomain(question)
    if(!domain)continue
    const ordered=[...(history.get(id)??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
    let weight=0,weightedCorrect=0
    for(const attempt of ordered){
      weight=weight*OLDER_ATTEMPT_WEIGHT+1
      weightedCorrect=weightedCorrect*OLDER_ATTEMPT_WEIGHT+(attempt.correct?1:0)
    }
    const probability=(PRIOR_STRENGTH*.5+weightedCorrect)/(PRIOR_STRENGTH+weight)
    grouped.set(domain,[...(grouped.get(domain)??[]),probability])
  }
  return {
    date,totalDistinct:seen.size,
    domains:PSAT_DOMAINS.map(domain=>{
      const sample=grouped.get(domain.id)??[]
      return {domain:domain.id,questions:sample.length,accuracy:sample.length
        ?Math.round(100*sample.reduce((sum,value)=>sum+value,0)/sample.length):null}
    }),
  }
}

export function buildRecentCategoryTrend(attempts:Attempt[],sessions:Array<Pick<SessionSummary,'id'|'endedAt'>>,questions:PracticeQuestion[]):PsatCategorySnapshot[]{
  const valid=new Set(questions.map(q=>q.id))
  const ordered=[...sessions].filter(s=>s.endedAt).sort((a,b)=>a.endedAt.localeCompare(b.endedAt))
  const cumulative:Attempt[]=[]
  const bySession=new Map<string,Attempt[]>()
  for(const a of attempts){
    if(!valid.has(a.questionId))continue
    bySession.set(a.sessionId,[...(bySession.get(a.sessionId)??[]),a])
  }
  const perDay=new Map<string,PsatCategorySnapshot>()
  for(const session of ordered){
    cumulative.push(...(bySession.get(session.id)??[]))
    const date=session.endedAt.slice(0,10)
    if(!cumulative.length)continue
    perDay.set(date,recentCategorySnapshot(cumulative,questions,date))
  }
  return [...perDay.values()].sort((a,b)=>a.date.localeCompare(b.date))
}

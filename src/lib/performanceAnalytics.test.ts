import {describe,expect,it} from 'vitest'
import {buildPerformanceAnalytics,estimateSectionPracticeScore,SCORE_SESSION_WINDOW,SCORE_RECENT_DISTINCT_QUESTIONS} from './performanceAnalytics'
import {QUESTION_BANK} from './questionBank'
import type {Attempt,PracticeQuestion,SessionSummary} from '../types'

const sample=[...QUESTION_BANK.filter(q=>q.subject==='english').slice(0,3),...QUESTION_BANK.filter(q=>q.subject==='math').slice(0,3)]
const makeAttempt=(q:PracticeQuestion,sessionId:string,index:number,correct:boolean):Attempt=>({
  id:`${sessionId}-${index}`,sessionId,questionId:q.id,practiceTestId:q.practiceTestId,
  subject:q.subject,module:q.module,questionNumber:q.number,correct,
  selectedAnswer:correct?'A':'B',correctAnswer:'A',elapsedMs:1000,
  createdAt:`2026-09-${sessionId==='s1'?'01':sessionId==='s2'?'02':'03'}T12:00:${String(index).padStart(2,'0')}.000Z`,
})
const session=(id:string,attempts:Attempt[]):SessionSummary=>({
  id,startedAt:attempts[0]?.createdAt??'2026-09-01T12:00:00.000Z',
  endedAt:attempts[0]?.createdAt??'2026-09-01T12:00:00.000Z',
  mode:'both',questionCount:attempts.length,attempts,
})
const analytics=(attempts:Attempt[],sessions:SessionSummary[])=>buildPerformanceAnalytics(attempts,sessions,QUESTION_BANK.length,QUESTION_BANK)

describe('recent 120-question score prediction',()=>{
  it('projects from recent distinct questions rather than the full question bank',()=>{
    const rows=sample.map((q,i)=>makeAttempt(q,'s1',i,i%2===0))
    const result=analytics(rows,[session('s1',rows)])
    expect(result.scorePredictionBasis?.questionCount).toBe(6)
    expect(result.scorePredictionBasis?.sections.reduce((n,s)=>n+s.questions,0)).toBe(6)
    expect(result.questionsSeen).toBe(6)
  })

  it('caps the sample at 60 distinct questions from each subject',()=>{
    expect(SCORE_RECENT_DISTINCT_QUESTIONS).toBe(120)
    const candidates=[...QUESTION_BANK.filter(q=>q.subject==='english').slice(0,80),...QUESTION_BANK.filter(q=>q.subject==='math').slice(0,70)]
    const rows=candidates.map((q,i)=>({...makeAttempt(q,'s1',i,i%3!==0),createdAt:`2026-09-01T12:${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}.000Z`}))
    const basis=analytics(rows,[session('s1',rows)]).scorePredictionBasis!
    expect(basis.questionCount).toBe(120)
    expect(basis.sections.map(section=>section.questions)).toEqual([60,60])
  })

  it('credits correct retries of previously failed questions without lowering the estimate',()=>{
    const failures=sample.map((q,i)=>makeAttempt(q,'s1',i,false))
    const recovered=sample.map((q,i)=>makeAttempt(q,'s2',i,true))
    const repeated=sample.map((q,i)=>makeAttempt(q,'s3',i,true))
    const result=analytics([...failures,...recovered,...repeated],[
      session('s1',failures),session('s2',recovered),session('s3',repeated),
    ])
    const trend=result.scoreTrend.map(p=>p.score)
    expect(trend[1]).toBeGreaterThanOrEqual(trend[0])
    expect(trend[2]).toBeGreaterThanOrEqual(trend[1])
    expect(result.scorePredictionBasis?.questionCount).toBe(6)
  })

  it('does not drop earlier failures just because more than ten sessions passed',()=>{
    expect(SCORE_SESSION_WINDOW).toBe(10)
    const failures=sample.map((q,i)=>makeAttempt(q,'s1',i,false))
    const retries=sample.map((q,i)=>makeAttempt(q,'s2',i,true))
    const first=session('s1',failures)
    const middle=Array.from({length:10},(_,i)=>({
      id:`empty-${i}`,startedAt:`2026-09-${String(i+2).padStart(2,'0')}T12:00:00.000Z`,
      endedAt:`2026-09-${String(i+2).padStart(2,'0')}T12:01:00.000Z`,
      mode:'both' as const,questionCount:0,attempts:[],
    }))
    const last={...session('s2',retries),id:'last',startedAt:'2026-09-20T12:00:00.000Z',endedAt:'2026-09-20T12:01:00.000Z'}
    const relabeled=retries.map(a=>({...a,sessionId:'last',createdAt:'2026-09-20T12:00:00.000Z'}))
    const result=analytics([...failures,...relabeled],[first,...middle,{...last,attempts:relabeled}])
    expect(result.scorePredictionBasis?.questionCount).toBe(6)
    expect(result.latestScoreEstimate).not.toBeNull()
    expect(result.scoreTrend.at(-1)!.score).toBeGreaterThanOrEqual(result.scoreTrend[0].score)
  })

  it('does not inflate score from repeated attempts inside one session',()=>{
    const first=sample.map((q,i)=>makeAttempt(q,'s1',i,false))
    const sameSessionRetries=sample.map((q,i)=>({
      ...makeAttempt(q,'s1',i+10,true),
      createdAt:`2026-09-01T12:01:${String(i).padStart(2,'0')}.000Z`,
    }))
    const baseline=analytics(first,[session('s1',first)]).latestScoreEstimate
    const withRetries=analytics([...first,...sameSessionRetries],[session('s1',[...first,...sameSessionRetries])])
    expect(withRetries.latestScoreEstimate).toBe(baseline)
  })

  it('rewards independent recovery over multiple sessions without granting instant mastery',()=>{
    const misses=sample.map((q,i)=>makeAttempt(q,'s1',i,false))
    const oneRecovery=sample.map((q,i)=>makeAttempt(q,'s2',i,true))
    const twoRecoveries=sample.map((q,i)=>makeAttempt(q,'s3',i,true))
    const threeRecoveries=sample.map((q,i)=>({
      ...makeAttempt(q,'s3',i,true),
      sessionId:'s4',id:`s4-${i}`,createdAt:`2026-09-04T12:00:${String(i).padStart(2,'0')}.000Z`,
    }))
    const score=(groups:Attempt[][])=>analytics(groups.flat(),groups.map((rows,i)=>session(`s${i+1}`,rows))).latestScoreEstimate!
    const afterOne=score([misses,oneRecovery])
    const afterTwo=score([misses,oneRecovery,twoRecoveries])
    const afterThree=score([misses,oneRecovery,twoRecoveries,threeRecoveries])
    expect(afterOne).toBeLessThan(1600)
    expect(afterTwo).toBeGreaterThan(afterOne)
    expect(afterThree).toBeGreaterThanOrEqual(afterTwo)
  })

  it('retains question-level success summaries',()=>{
    const rows=[makeAttempt(sample[0],'s1',0,false),makeAttempt(sample[0],'s2',0,true)]
    const result=analytics(rows,[session('s1',[rows[0]]),session('s2',[rows[1]])])
    expect(result.questions[0]).toMatchObject({questionId:sample[0].id,attempts:2,correct:1,successRate:50})
  })

  it('keeps confidence probabilities ordered and section score bounds valid',()=>{
    const rows=sample.map((q,i)=>makeAttempt(q,'s1',i,true))
    const result=analytics(rows,[session('s1',rows)])
    const confidence=result.scoreEstimateConfidence!
    expect(confidence.within40).toBeLessThanOrEqual(confidence.within50)
    expect(confidence.within50).toBeLessThanOrEqual(confidence.within80)
    expect(confidence.within80).toBeLessThanOrEqual(confidence.within100)
    expect(estimateSectionPracticeScore(0)).toBe(200)
    expect(estimateSectionPracticeScore(100)).toBe(800)
  })
})

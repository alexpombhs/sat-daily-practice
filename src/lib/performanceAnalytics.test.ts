import {describe,expect,it} from 'vitest'
import {buildPerformanceAnalytics,estimateSectionPracticeScore,SCORE_SESSION_WINDOW} from './performanceAnalytics'
import {QUESTION_BANK} from './questionBank'
import type {Attempt,SessionSummary} from '../types'

const makeAttempt=(id:string,sessionId:string,questionId:string,subject:Attempt['subject'],module:Attempt['module'],questionNumber:number,correct:boolean,elapsedMs:number,createdAt:string):Attempt=>({
  id,sessionId,questionId,subject,module,questionNumber,selectedAnswer:correct?'A':'B',correctAnswer:'A',correct,elapsedMs,createdAt,
})

const attempts:Attempt[]=[
  makeAttempt('a1','s1','rw1-1','english','rw1',1,true,10000,'2026-09-17T12:00:01.000Z'),
  makeAttempt('a2','s1','rw1-2','english','rw1',2,true,20000,'2026-09-17T12:00:02.000Z'),
  makeAttempt('a3','s1','rw1-3','english','rw1',3,false,30000,'2026-09-17T12:00:03.000Z'),
  makeAttempt('a4','s1','math1-1','math','math1',1,false,40000,'2026-09-17T12:00:04.000Z'),
  makeAttempt('a5','s1','math1-2','math','math1',2,false,50000,'2026-09-17T12:00:05.000Z'),
  makeAttempt('a6','s1','math1-3','math','math1',3,true,60000,'2026-09-17T12:00:06.000Z'),
  makeAttempt('a7','s2','rw1-1','english','rw1',1,true,12000,'2026-09-18T12:00:01.000Z'),
  makeAttempt('a8','s2','rw1-2','english','rw1',2,true,14000,'2026-09-18T12:00:02.000Z'),
  makeAttempt('a9','s2','rw1-3','english','rw1',3,true,16000,'2026-09-18T12:00:03.000Z'),
  makeAttempt('a10','s2','math1-1','math','math1',1,true,20000,'2026-09-18T12:00:04.000Z'),
  makeAttempt('a11','s2','math1-2','math','math1',2,true,22000,'2026-09-18T12:00:05.000Z'),
  makeAttempt('a12','s2','math1-3','math','math1',3,true,24000,'2026-09-18T12:00:06.000Z'),
]

const sessions:SessionSummary[]=[
  {id:'s1',startedAt:'2026-09-17T12:00:00.000Z',endedAt:'2026-09-17T12:05:00.000Z',mode:'both',questionCount:6,attempts:attempts.slice(0,6)},
  {id:'s2',startedAt:'2026-09-18T12:00:00.000Z',endedAt:'2026-09-18T12:05:00.000Z',mode:'both',questionCount:6,attempts:attempts.slice(6)},
]

describe('performance analytics',()=>{
  it('aggregates attempts per question with success rate and response time',()=>{
    const analytics=buildPerformanceAnalytics(attempts,sessions,98)
    expect(analytics.questions.find(question=>question.questionId==='rw1-1'))
      .toMatchObject({attempts:2,correct:2,successRate:100,averageMs:11000})
  })

  it('summarizes each section and recommends the weaker section',()=>{
    const analytics=buildPerformanceAnalytics(attempts,sessions,98)
    expect(analytics.sections.find(section=>section.subject==='english')).toMatchObject({attempts:6,correct:5,successRate:83})
    expect(analytics.sections.find(section=>section.subject==='math')).toMatchObject({attempts:6,correct:4,successRate:67})
    expect(analytics.recommendation?.subject).toBe('math')
  })

  it('predicts from recency-weighted per-question success rates rather than binary mastery',()=>{
    const analytics=buildPerformanceAnalytics(attempts,sessions,98)
    expect(analytics.sessionMetrics.map(session=>session.accuracy)).toEqual([50,100])
    expect(analytics.scoreTrend[1].score).toBeGreaterThan(analytics.scoreTrend[0].score)
    expect(analytics.scoreTrend.every(point=>point.calibrating)).toBe(true)
    expect(analytics.scorePredictionBasis).toMatchObject({
      sessionCount:2,
      questionCount:QUESTION_BANK.length,
    })
  })

  it('incorporates a 50% repeat-question success rate into the prediction',()=>{
    const repeat:Attempt[]=[
      makeAttempt('e1','s1','e-1','english','rw1',1,false,1000,'2026-09-01T12:00:01.000Z'),
      makeAttempt('e2','s1','e-2','english','rw1',2,true,1000,'2026-09-01T12:00:02.000Z'),
      makeAttempt('e3','s1','e-3','english','rw1',3,true,1000,'2026-09-01T12:00:03.000Z'),
      makeAttempt('m1','s1','m-1','math','math1',1,false,1000,'2026-09-01T12:00:04.000Z'),
      makeAttempt('m2','s1','m-2','math','math1',2,true,1000,'2026-09-01T12:00:05.000Z'),
      makeAttempt('m3','s1','m-3','math','math1',3,true,1000,'2026-09-01T12:00:06.000Z'),
      makeAttempt('e1b','s2','e-1','english','rw1',1,true,1000,'2026-09-02T12:00:01.000Z'),
      makeAttempt('m1b','s2','m-1','math','math1',1,true,1000,'2026-09-02T12:00:02.000Z'),
    ]
    const repeatSessions:SessionSummary[]=[
      {id:'s1',startedAt:'2026-09-01T12:00:00.000Z',endedAt:'2026-09-01T12:05:00.000Z',mode:'both',questionCount:6,attempts:repeat.slice(0,6)},
      {id:'s2',startedAt:'2026-09-02T12:00:00.000Z',endedAt:'2026-09-02T12:05:00.000Z',mode:'both',questionCount:2,attempts:repeat.slice(6)},
    ]
    const analytics=buildPerformanceAnalytics(repeat,repeatSessions,98)
    expect(analytics.scorePredictionBasis?.sections.every(section=>section.questions>3)).toBe(true)
    expect(analytics.scoreTrend[1].score).toBeGreaterThan(analytics.scoreTrend[0].score)
  })

  it('compares the latest predicted score with the most recent prediction at least seven days earlier',()=>{
    const weeklySessions:SessionSummary[]=[
      {...sessions[0],startedAt:'2026-09-01T12:00:00.000Z',endedAt:'2026-09-01T12:05:00.000Z'},
      {...sessions[1],startedAt:'2026-09-09T12:00:00.000Z',endedAt:'2026-09-09T12:05:00.000Z'},
    ]
    const analytics=buildPerformanceAnalytics(attempts,weeklySessions,98)
    expect(analytics.scoreTrend[1].score).toBeGreaterThan(analytics.scoreTrend[0].score)
    expect(analytics.weeklyScoreChange).toBeGreaterThan(0)
  })

  it('does not invent a seven-day score change without old enough prediction history',()=>{
    const analytics=buildPerformanceAnalytics(attempts,sessions,98)
    expect(analytics.weeklyScoreChange).toBeNull()
  })

  it('keeps all previously practiced questions in the probability model beyond ten sessions',()=>{
    const q=QUESTION_BANK.filter(q=>q.subject==='math').slice(0,3)
    const first=q.map((question,index)=>makeAttempt(`f-${index}`,'s1',question.id,'math',question.module,question.number,false,1000,`2026-08-01T12:00:0${index}.000Z`))
    const final=q.map((question,index)=>makeAttempt(`c-${index}`,'s11',question.id,'math',question.module,question.number,true,1000,`2026-08-11T12:00:0${index}.000Z`))
    const rows=[...first,...final]
    const windowSessions:SessionSummary[]=Array.from({length:11},(_,index)=>({
      id:`s${index+1}`,startedAt:`2026-08-${String(index+1).padStart(2,'0')}T12:00:00.000Z`,endedAt:`2026-08-${String(index+1).padStart(2,'0')}T12:05:00.000Z`,mode:'both',questionCount:3,
      attempts:rows.filter(a=>a.sessionId===`s${index+1}`),
    }))
    const analytics=buildPerformanceAnalytics(rows,windowSessions,QUESTION_BANK.length)
    expect(analytics.scorePredictionBasis?.questionCount).toBe(QUESTION_BANK.length)
    expect(analytics.scoreTrend).toHaveLength(11)
  })

  it('raises the predicted score after a second successful review of formerly failed questions',()=>{
    const old=[
      ...['e1','e2','e3'].map((id,index)=>makeAttempt(`fail-e-${index}`,'s1',id,'english','rw1',index+1,false,1000,`2026-09-01T12:00:0${index}.000Z`)),
      ...['m1','m2','m3'].map((id,index)=>makeAttempt(`fail-m-${index}`,'s1',id,'math','math1',index+1,false,1000,`2026-09-01T12:00:1${index}.000Z`)),
    ]
    const first=old.map((a,index)=>({...a,id:`first-${index}`,sessionId:'s2',correct:true,createdAt:`2026-09-02T12:00:${String(index).padStart(2,'0')}.000Z`}))
    const second=old.map((a,index)=>({...a,id:`second-${index}`,sessionId:'s3',correct:true,createdAt:`2026-09-03T12:00:${String(index).padStart(2,'0')}.000Z`}))
    const all=[...old,...first,...second]
    const reviewSessions:SessionSummary[]=['s1','s2','s3'].map((id,index)=>({
      id,startedAt:`2026-09-0${index+1}T12:00:00.000Z`,endedAt:`2026-09-0${index+1}T12:05:00.000Z`,
      mode:'both',questionCount:6,attempts:all.filter(a=>a.sessionId===id),
    }))
    const predictions=buildPerformanceAnalytics(all,reviewSessions,6).scoreTrend.map(p=>p.score)
    expect(predictions[1]).toBeGreaterThan(predictions[0])
    expect(predictions[2]).toBeGreaterThan(predictions[1])
  })

  it('does not lower the projected score when only previously failed questions are reviewed correctly',()=>{
    const failures=attempts.slice(0,6)
    const retries=failures.filter(a=>!a.correct).map((a,index)=>({...a,id:`fix-${index}`,sessionId:'s2',correct:true,createdAt:`2026-09-18T12:00:0${index}.000Z`}))
    const history=[...failures,...retries]
    const historySessions=[sessions[0],{...sessions[1],attempts:retries}]
    const trend=buildPerformanceAnalytics(history,historySessions,120).scoreTrend
    expect(trend[1].score).toBeGreaterThanOrEqual(trend[0].score)
  })

  it('derives an interpretable probability band for score estimate confidence',()=>{
    const confidence=buildPerformanceAnalytics(attempts,sessions,98).scoreEstimateConfidence
    expect(confidence).not.toBeNull()
    expect(confidence!.within40).toBeLessThanOrEqual(confidence!.within50)
    expect(confidence!.within50).toBeLessThanOrEqual(confidence!.within80)
    expect(confidence!.within80).toBeLessThanOrEqual(confidence!.within100)
    expect(confidence!.sigmaPoints).toBeGreaterThanOrEqual(40)
  })

  it('keeps section estimates within the SAT section score range',()=>{
    expect(estimateSectionPracticeScore(0)).toBe(200)
    expect(estimateSectionPracticeScore(100)).toBe(800)
  })
})

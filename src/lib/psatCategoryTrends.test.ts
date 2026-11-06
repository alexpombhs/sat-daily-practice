import {describe,expect,it} from 'vitest'
import {buildRecentCategoryTrend,recentCategorySnapshot} from './psatCategoryTrends'
import type {Attempt,PracticeQuestion,SessionSummary,Subject} from '../types'

const q=(id:string,subject:Subject,psatDomain:PracticeQuestion['psatDomain']):PracticeQuestion=>({
  id,subject,psatDomain,practiceTestId:'practice-test-4',
  module:subject==='math'?'math1':'rw1',number:1,sourcePage:1,answerPage:1,
  correctAnswer:'A',responseType:'multiple-choice',
})
const a=(question:PracticeQuestion,day:number,correct:boolean,sessionId='s1'):Attempt=>({
  id:`${question.id}-${day}`,questionId:question.id,sessionId,subject:question.subject,
  module:question.module,questionNumber:question.number,
  correct,selectedAnswer:correct?'A':'B',correctAnswer:'A',elapsedMs:1000,
  createdAt:`2026-01-${String(day).padStart(2,'0')}T10:00:00Z`,
})
const s=(id:string,day:number):SessionSummary=>({
  id,mode:'both',startedAt:`2026-01-${String(day).padStart(2,'0')}T09:00:00Z`,
  endedAt:`2026-01-${String(day).padStart(2,'0')}T12:00:00Z`,
  questionCount:10,attempts:[],
})

describe('120-distinct-question category progress',()=>{
  it('takes no more than 60 distinct per section and uses each only once',()=>{
    const questions=[
      ...Array.from({length:75},(_,i)=>q(`rw-${i}`,'english','craft-structure')),
      ...Array.from({length:75},(_,i)=>q(`math-${i}`,'math','advanced-math')),
    ]
    const history=questions.map(question=>a(question,1,true))
    const latest=recentCategorySnapshot(history,questions)
    expect(latest.totalDistinct).toBe(120)
    expect(latest.domains.find(d=>d.domain==='craft-structure')?.questions).toBe(60)
    expect(latest.domains.find(d=>d.domain==='advanced-math')?.questions).toBe(60)
  })
  it('weights retries but counts distinct questions, not attempts',()=>{
    const item=q('x','english','information-ideas')
    const snapshot=recentCategorySnapshot([a(item,1,false),a(item,2,true)], [item])
    expect(snapshot.totalDistinct).toBe(1)
    expect(snapshot.domains.find(d=>d.domain==='information-ideas')?.questions).toBe(1)
    expect(snapshot.domains.find(d=>d.domain==='information-ideas')?.accuracy).toBeGreaterThan(50)
  })
  it('builds chronological snapshots as sessions complete',()=>{
    const first=q('first','english','expression-ideas')
    const second=q('second','math','algebra')
    const result=buildRecentCategoryTrend([a(first,1,false,'s1'),a(second,2,true,'s2')],[s('s2',2),s('s1',1)],[first,second])
    expect(result.map(row=>row.totalDistinct)).toEqual([1,2])
    expect(result[0].date).toBe('2026-01-01')
    expect(result[1].domains.find(d=>d.domain==='algebra')?.accuracy).not.toBeNull()
  })
})

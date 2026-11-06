import {describe,expect,it} from 'vitest'
import {buildPreTestDomainReview,craftSubskill,reviewQuestionOrder,summarizeDomain} from './preTestReviewAnalytics'
import type {Attempt,PracticeQuestion,Subject} from '../types'
import type {PsatDomainId} from './psatDomains'

const question=(id:string,subject:Subject,psatDomain:PsatDomainId,concepts:string[]=[],difficulty:'easy'|'medium'|'advanced'='medium'):PracticeQuestion=>({
  id,subject,psatDomain,concepts,difficulty,
  practiceTestId:'practice-test-4',module:subject==='math'?'math1':'rw1',number:1,
  sourcePage:1,answerPage:1,correctAnswer:'A',responseType:'multiple-choice',
})
const attempt=(q:PracticeQuestion,correct:boolean,day:number):Attempt=>({
  id:`${q.id}-${day}`,sessionId:'s1',questionId:q.id,subject:q.subject,module:q.module,questionNumber:q.number,
  selectedAnswer:correct?'A':'B',correctAnswer:'A',correct,elapsedMs:32000,
  createdAt:`2026-10-${String(day).padStart(2,'0')}T10:00:00Z`,
})
const craft=question('craft','english','craft-structure',['nuanced vocabulary'],'advanced')
const craftNew=question('craft-new','english','craft-structure',['vocabulary'])
const craftCross=question('cross','english','craft-structure',['paired text connections'])
const math=question('math','math','advanced-math',['quadratic equations'],'advanced')
const wrongSection=question('stray','math','craft-structure',['vocabulary'])

describe('official SAT Pre-test Review',()=>{
  it('uses reviewed SAT category metadata, not concept-tag guessing',()=>{
    const summary=buildPreTestDomainReview([craft,craftNew,craftCross,math,wrongSection],[], 'english')
    expect(summary).toHaveLength(4)
    expect(summary.find(s=>s.domain==='craft-structure')?.questions.map(r=>r.question.id)).toEqual(['craft','craft-new','cross'])
    expect(summary.some(s=>s.questions.some(q=>q.question.id==='stray'))).toBe(false)
  })
  it('shows first-attempt mistakes separately from later corrected reviews',()=>{
    const all=buildPreTestDomainReview([craft,craftNew,craftCross],[attempt(craft,false,1),attempt(craft,true,2),attempt(craftCross,true,3)],'english')
    const area=all.find(s=>s.domain==='craft-structure')!
    expect(area.attempted).toBe(2)
    expect(area.firstCorrect).toBe(1)
    expect(area.firstAccuracy).toBe(50)
    expect(area.latestAccuracy).toBe(100)
    expect(area.firstMisses).toBe(1)
    expect(area.reviewedCorrections).toBe(1)
    expect(area.unseen).toBe(1)
    expect(area.advancedAttempted).toBe(1)
    expect(reviewQuestionOrder(area,'missed').map(r=>r.question.id)).toEqual(['craft'])
    expect(reviewQuestionOrder(area,'unseen').map(r=>r.question.id)).toEqual(['craft-new'])
  })
  it('works for advanced Math and empty practice without inventing an accuracy',()=>{
    const baseline=buildPreTestDomainReview([math],[],'math')
    const advanced=baseline.find(s=>s.domain==='advanced-math')!
    expect(advanced.firstAccuracy).toBeNull()
    expect(advanced.unseen).toBe(1)
    const completed=buildPreTestDomainReview([math],[attempt(math,false,4)],'math')
    expect(completed.find(s=>s.domain==='advanced-math')?.firstMisses).toBe(1)
  })
  it('breaks down Craft and Structure subskills within the audited category',()=>{
    expect(craftSubskill(craft)).toBe('words')
    expect(craftSubskill(craftCross)).toBe('cross-text')
    expect(craftSubskill(question('other','english','craft-structure',['narrator aside']))).toBe('structure')
    const stats=summarizeDomain('craft-structure','Words',[{question:craft,first:attempt(craft,false,1),last:attempt(craft,true,2),attemptCount:2}])
    expect(stats.firstAccuracy).toBe(0)
    expect(stats.reviewedCorrections).toBe(1)
  })
})

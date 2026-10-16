import {describe,expect,it} from 'vitest'
import {rankReviewConcepts,reviewConceptGroup} from './conceptReview'
import type {Attempt,PracticeQuestion} from '../types'

const makeQuestion=(id:string,concept:string):PracticeQuestion=>({
  id,practiceTestId:'practice-test-4',subject:'math',module:'math1',number:1,
  sourcePage:1,answerPage:1,correctAnswer:'A',responseType:'multiple-choice',concepts:[concept],
})
const makeAttempt=(id:string,questionId:string,correct:boolean,date:string):Attempt=>({
  id,sessionId:'s1',questionId,subject:'math',module:'math1',questionNumber:1,
  selectedAnswer:correct?'A':'B',correctAnswer:'A',correct,elapsedMs:30000,createdAt:date,
})
describe('concept review priority',()=>{
  it('prioritizes persistent difficulty ahead of well-recovered concepts',()=>{
    const questions=[makeQuestion('a','systems'),makeQuestion('b','systems'),makeQuestion('c','vocabulary'),makeQuestion('d','vocabulary')]
    const attempts=[
      makeAttempt('a1','a',false,'2026-10-01'),makeAttempt('a2','a',false,'2026-10-02'),
      makeAttempt('b1','b',false,'2026-10-03'),makeAttempt('b2','b',true,'2026-10-04'),
      makeAttempt('c1','c',false,'2026-10-01'),makeAttempt('c2','c',true,'2026-10-03'),
      makeAttempt('d1','d',true,'2026-10-04'),makeAttempt('d2','d',true,'2026-10-05'),
    ]
    const ranked=rankReviewConcepts(questions,attempts)
    expect(ranked[0].concept).toBe('Linear Equations & Systems')
    expect(ranked[0].unresolved).toBe(1)
    expect(ranked[0].incorrect).toBe(3)
  })
  it('excludes concepts with no misses',()=>{
    const ranked=rankReviewConcepts([makeQuestion('a','easy'),makeQuestion('b','hard')],[
      makeAttempt('1','a',true,'2026-10-01'),makeAttempt('2','b',false,'2026-10-02'),
    ])
    expect(ranked.map(item=>item.concept)).toEqual(['Advanced Algebra & Modeling'])
  })
  it('counts all attempts once when multiple tags map to the same group',()=>{
    const question={...makeQuestion('a','nth-root exponent laws'),concepts:['nth-root exponent laws','multiplication of powers']}
    const ranked=rankReviewConcepts([question],[makeAttempt('1','a',false,'2026-10-01')])
    expect(ranked).toHaveLength(1)
    expect(ranked[0].attempts).toBe(1)
    expect(ranked[0].incorrect).toBe(1)
  })
  it('groups related detailed tags into one topic',()=>{
    expect(reviewConceptGroup(['nth-root exponent laws'],'math')).toBe('Exponents, Radicals & Expressions')
    expect(reviewConceptGroup(['multiplication of powers'],'math')).toBe('Exponents, Radicals & Expressions')
    expect(reviewConceptGroup(['nuanced vocabulary'],'english')).toBe('Vocabulary & Words in Context')
  })
})

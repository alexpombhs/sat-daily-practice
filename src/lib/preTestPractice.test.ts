import {describe,expect,it} from 'vitest'
import type {Attempt,PracticeQuestion} from '../types'
import {buildQuestionMastery,failedQuestionIds} from './questionMastery'
import {singlePreTestQuestionSelection} from './preTestPractice'

const question:PracticeQuestion={
  id:'review-math-1',practiceTestId:'practice-test-6',subject:'math',module:'math2',
  number:17,sourcePage:1,answerPage:2,correctAnswer:'B',responseType:'multiple-choice',
}
function attempt(id:string,sessionId:string,correct:boolean,createdAt:string):Attempt{
  return {id,sessionId,questionId:question.id,practiceTestId:question.practiceTestId,
    subject:question.subject,module:question.module,questionNumber:question.number,
    selectedAnswer:correct?'B':'A',correctAnswer:'B',correct,
    elapsedMs:1000,createdAt}
}

describe('Pre-test practice recording contract',()=>{
  it('selects exactly the requested question for a normal scored practice session',()=>{
    expect(singlePreTestQuestionSelection(question)).toEqual({
      mode:'math',practiceTest:'practice-test-6',questionIds:['review-math-1'],
      overrides:{psatDomain:'all',failedOnly:false,failedEverOnly:false},
    })
  })

  it('counts later successes from pre-test sessions toward failed-question mastery',()=>{
    const history=[
      attempt('miss','normal-session',false,'2026-11-01T12:00:00Z'),
      attempt('recover-1','pretest-session-1',true,'2026-11-02T12:00:00Z'),
    ]
    expect(failedQuestionIds(history,2).has(question.id)).toBe(true)
    const recovered=[...history,attempt('recover-2','pretest-session-2',true,'2026-11-03T12:00:00Z')]
    expect(failedQuestionIds(recovered,2).has(question.id)).toBe(false)
    expect(buildQuestionMastery(recovered,2).get(question.id)?.mastered).toBe(true)
  })

  it('resets recovery after an incorrect answer regardless of session source',()=>{
    const history=[
      attempt('miss','normal-session',false,'2026-11-01T12:00:00Z'),
      attempt('recover','pretest-session',true,'2026-11-02T12:00:00Z'),
      attempt('miss-again','pretest-session-2',false,'2026-11-03T12:00:00Z'),
    ]
    expect(buildQuestionMastery(history,2).get(question.id)?.correctAfterFailure).toBe(0)
    expect(failedQuestionIds(history,2).has(question.id)).toBe(true)
  })
})

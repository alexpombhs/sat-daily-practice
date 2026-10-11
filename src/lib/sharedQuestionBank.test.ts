import {describe,expect,it} from 'vitest'
import type {PracticeQuestion} from '../types'
import {idMatchesPracticeTest,mergeQuestionBanks,questionLinesEqual} from './sharedQuestionBank'

function question(id:string,practiceTestId:PracticeQuestion['practiceTestId'],correctAnswer:string):PracticeQuestion{
  return{
    id,
    practiceTestId,
    subject:'math',
    module:'math1',
    number:1,
    sourcePage:1,
    answerPage:1,
    correctAnswer,
    acceptedAnswers:[correctAnswer],
    responseType:'multiple-choice',
  }
}

describe('mergeQuestionBanks',()=>{
  it('preserves bundled questions missing from an older shared Supabase bank',()=>{
    const ps5=question('practice-test-5:math1-1','practice-test-5','A')
    const ps6=question('practice-test-6:math1-1','practice-test-6','B')
    const merged=mergeQuestionBanks([ps5,ps6],[ps5])
    expect(merged.map(item=>item.id)).toEqual([ps5.id,ps6.id])
  })

  it('lets canonical shared rows override bundled metadata for matching IDs',()=>{
    const bundled=question('practice-test-6:math1-1','practice-test-6','A')
    const shared=question('practice-test-6:math1-1','practice-test-6','D')
    const merged=mergeQuestionBanks([bundled],[shared])
    expect(merged).toHaveLength(1)
    expect(merged[0].correctAnswer).toBe('D')
  })
})


describe('questionLinesEqual',()=>{
  it('accepts an exact Supabase round-trip of edited lines',()=>{
    expect(questionLinesEqual(['Intro','• First bullet','• Second bullet'],['Intro','• First bullet','• Second bullet'])).toBe(true)
  })

  it('rejects missing or altered lines so saves cannot report false success',()=>{
    expect(questionLinesEqual(['Intro • First bullet • Second bullet'],['Intro','• First bullet','• Second bullet'])).toBe(false)
    expect(questionLinesEqual(null,['Intro'])).toBe(false)
  })
})

describe('PT1 canonical question IDs',()=>{
  it('accepts only the independently authored PT1 identifiers',()=>{
    expect(idMatchesPracticeTest('pt1-rw1-01','practice-test-1')).toBe(true)
    expect(idMatchesPracticeTest('pt1-math2-27','practice-test-1')).toBe(true)
    expect(idMatchesPracticeTest('math1-1','practice-test-1')).toBe(false)
    expect(idMatchesPracticeTest('practice-test-4:math1-1','practice-test-1')).toBe(false)
  })
})

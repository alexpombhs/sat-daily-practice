import {describe,expect,it} from 'vitest'
import {choosePracticeQuestions,countDifficultyQuestions,countFailedPracticeQuestions,countNewPracticeQuestions,formatDuration,practiceQuestionPool,summarizeSession} from './practiceGamification'
import {TEST_QUESTION_METADATA} from '../test/questionMetadataFixture'
import type {Attempt,Settings} from '../types'

const settings:Settings={mode:'math',questionsPerSession:3,showExplanations:true,shuffle:true}
const questions=TEST_QUESTION_METADATA.filter(q=>q.practiceTestId==='practice-test-4'&&q.subject==='math')

function attempt(id:string,correct:boolean,index=0):Attempt{
  const q=questions.find(q=>q.id===id)!
  return{id:'attempt-'+index,sessionId:'session',questionId:id,subject:q.subject,module:q.module,
    questionNumber:q.number,selectedAnswer:correct?'A':'B',correctAnswer:'A',
    correct,elapsedMs:1000,createdAt:'2026-01-01T00:00:00Z'}
}

describe('practice selection on canonical metadata',()=>{
  it('selects the requested number and subject from the supplied bank',()=>{
    const selected=choosePracticeQuestions(settings,[],()=>0.5,questions)
    expect(selected).toHaveLength(3)
    expect(selected.every(q=>q.subject==='math')).toBe(true)
  })
  it('filters by canonical difficulty rather than embedded per-question metadata',()=>{
    const classified=questions.slice(0,3).map((q,i)=>({...q,difficulty:(['easy','medium','advanced'] as const)[i]}))
    expect(practiceQuestionPool({...settings,difficultyLevels:['advanced']},[],classified).map(q=>q.id)).toEqual([classified[2].id])
    expect(countDifficultyQuestions({...settings,difficultyLevels:['easy','medium']},classified)).toBe(2)
  })
  it('tracks seen and failed questions using cloud attempt metadata',()=>{
    const pool=questions.slice(0,4)
    const attempts=[attempt(pool[0].id,false)]
    expect(countNewPracticeQuestions(settings,attempts,pool)).toBe(3)
    expect(countFailedPracticeQuestions(settings,attempts,pool)).toBe(1)
  })
  it('summarizes results and formats duration without bundled answer keys',()=>{
    const attempts=[attempt(questions[0].id,true,0),attempt(questions[1].id,false,1)]
    expect(summarizeSession(attempts)).toMatchObject({total:2,correct:1,accuracy:50})
    expect(formatDuration(125_000)).toBe('2m 5s')
  })
})

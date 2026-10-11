import {describe,expect,it} from 'vitest'
import {QUESTION_BANK} from './questionBank'
import {choosePracticeQuestions,countDifficultyQuestions,countFailedPracticeQuestions,countNewPracticeQuestions,formatDuration,practiceQuestionPool,summarizePerformance,summarizeSession} from './practiceGamification'
import type {Attempt,SessionSummary,Settings} from '../types'

const settings:Settings={mode:'math',questionsPerSession:3,showExplanations:true,shuffle:true}

function attempt(questionId:string,correct:boolean,index=0):Attempt{
  const question=QUESTION_BANK.find(item=>item.id===questionId)!
  return {id:`a-${questionId}-${index}`,sessionId:'session',questionId,subject:question.subject,module:question.module,questionNumber:question.number,selectedAnswer:correct?question.correctAnswer:'wrong',correctAnswer:question.correctAnswer,correct,elapsedMs:1000*(index+1),createdAt:new Date(2026,0,index+1).toISOString()}
}

describe('choosePracticeQuestions',()=>{
  it('respects subject mode and configured question count',()=>{
    const chosen=choosePracticeQuestions(settings,[],()=>0)
    expect(chosen).toHaveLength(3)
    expect(chosen.every(question=>question.subject==='math')).toBe(true)
  })


  it('filters the pool to the selected practice test',()=>{
    const chosen=choosePracticeQuestions({...settings,practiceTest:'practice-test-4'},[],()=>0)
    expect(chosen).toHaveLength(3)
    expect(chosen.every(question=>question.practiceTestId==='practice-test-4')).toBe(true)
  })

  it('only includes content-classified questions in a difficulty-specific pool',()=>{
    const original=QUESTION_BANK.find(q=>q.id==='math1-1')!
    const advanced={...original,difficulty:'advanced' as const}
    const unclassified=QUESTION_BANK.find(q=>q.id==='math1-2')!
    expect(practiceQuestionPool({...settings,difficulty:'advanced'},[],[advanced,unclassified])).toEqual([advanced])
    expect(practiceQuestionPool({...settings,difficulty:'easy'},[],[advanced,unclassified])).toEqual([])
    expect(practiceQuestionPool({...settings,difficulty:'all'},[],[advanced,unclassified])).toHaveLength(2)
  })

  it('combines selected difficulty levels and respects test and subject filters',()=>{
    const questions=QUESTION_BANK.filter(q=>q.practiceTestId==='practice-test-4'&&q.subject==='math').slice(0,4)
      .map((q,i)=>({...q,difficulty:(['easy','medium','advanced',undefined] as const)[i]}))
    const multiple={...settings,practiceTest:'practice-test-4' as const,difficulty:'all' as const,difficultyLevels:['medium','advanced'] as const}
    expect(practiceQuestionPool({...multiple,difficultyLevels:[...multiple.difficultyLevels]},[],questions).map(q=>q.id)).toEqual(questions.slice(1,3).map(q=>q.id))
    expect(practiceQuestionPool({...multiple,difficultyLevels:undefined},[],questions)).toHaveLength(4)
    expect(practiceQuestionPool({...multiple,difficultyLevels:['easy','advanced']},[],questions).map(q=>q.id)).toEqual([questions[0].id,questions[2].id])
    expect(practiceQuestionPool({...multiple,mode:'english',difficultyLevels:['medium','advanced']},[],questions)).toHaveLength(0)
  })

  it('treats no checked difficulty levels as an empty pool, not All',()=>{
    const questions=QUESTION_BANK.filter(q=>q.practiceTestId==='practice-test-4'&&q.subject==='math').slice(0,3)
      .map((q,i)=>({...q,difficulty:(['easy','medium','advanced'] as const)[i]}))
    expect(practiceQuestionPool({...settings,difficultyLevels:[]},[],questions)).toHaveLength(0)
    expect(practiceQuestionPool({...settings,difficultyLevels:['easy','medium','advanced']},[],questions)).toHaveLength(3)
    expect(practiceQuestionPool({...settings,difficultyLevels:['medium','advanced']},[],questions)).toHaveLength(2)
  })

  it('counts each content-reviewed difficulty by subject and test, independent of active difficulty',()=>{
    const math=QUESTION_BANK.filter(q=>q.practiceTestId==='practice-test-4'&&q.subject==='math').slice(0,4)
    const classified=math.map((q,i)=>({...q,difficulty:(i===0?'easy':i===1?'medium':i===2?'advanced':undefined) as 'easy'|'medium'|'advanced'|undefined}))
    expect(countDifficultyQuestions({...settings,difficulty:'advanced'},classified))
      .toEqual({all:4,easy:1,medium:1,advanced:1})
    expect(countDifficultyQuestions({...settings,mode:'english'},classified))
      .toEqual({all:0,easy:0,medium:0,advanced:0})
  })

  it('supports random selection without adaptive prioritization',()=>{
    let call=0
    const chosen=choosePracticeQuestions({...settings,questionsPerSession:1,selectionMode:'random'},[attempt('math1-1',false)],()=>call++===0?0:1)
    expect(chosen[0].id).toBe('math1-1')
  })

  it('treats new questions as questions the user has not attempted yet',()=>{
    const questions=QUESTION_BANK.filter(question=>['math1-1','math1-2','math1-3'].includes(question.id))
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-2',true,1),
    ]
    const missedSettings={...settings,failedOnly:true,failedEverOnly:false}
    expect(practiceQuestionPool(missedSettings,attempts,questions).map(question=>question.id)).toEqual(['math1-3'])
    expect(countNewPracticeQuestions(missedSettings,attempts,questions)).toBe(1)
  })

  it('does not count a previously attempted question as new regardless of whether it was correct',()=>{
    const questions=QUESTION_BANK.filter(question=>['math1-1','math1-2'].includes(question.id))
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-2',true,1),
    ]
    const missedSettings={...settings,failedOnly:true,failedEverOnly:false}
    expect(practiceQuestionPool(missedSettings,attempts,questions)).toEqual([])
    expect(countNewPracticeQuestions(missedSettings,attempts,questions)).toBe(0)
  })


  it('uses the full eligible pool when neither new-only nor failed-only is selected',()=>{
    const questions=QUESTION_BANK.filter(question=>['math1-1','math1-2','math1-3'].includes(question.id))
    const attempts=[attempt('math1-1',false,0)]
    const fullPoolSettings={...settings,failedOnly:false,failedEverOnly:false}
    expect(practiceQuestionPool(fullPoolSettings,attempts,questions).map(question=>question.id))
      .toEqual(['math1-1','math1-2','math1-3'])
  })

  it('keeps failed questions until they are answered correctly twice after the failure',()=>{
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-2',false,1),
      attempt('math1-1',true,2),
      attempt('math1-3',true,3),
    ]
    const failedSettings={...settings,failedOnly:false,failedEverOnly:true}
    expect(practiceQuestionPool(failedSettings,attempts).map(question=>question.id)).toEqual(['math1-1','math1-2'])
    expect(countFailedPracticeQuestions(failedSettings,attempts)).toBe(2)
  })

  it('randomizes failed-question practice even when the main selection mode is adaptive',()=>{
    const questions=QUESTION_BANK.filter(question=>['math1-1','math1-2','math1-3'].includes(question.id))
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-2',false,1),
      attempt('math1-3',false,2),
    ]
    const values=[.9,.1,.5]
    let index=0
    const chosen=choosePracticeQuestions(
      {...settings,questionsPerSession:3,selectionMode:'adaptive',failedOnly:false,failedEverOnly:true},
      attempts,
      ()=>values[index++]??0,
      questions,
    )
    expect(chosen.map(question=>question.id)).toEqual(['math1-2','math1-3','math1-1'])
  })

  it('removes a failed question after two correct answers following the most recent failure',()=>{
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-1',true,1),
      attempt('math1-1',true,2),
    ]
    const failedSettings={...settings,failedOnly:false,failedEverOnly:true}
    expect(practiceQuestionPool(failedSettings,attempts).map(question=>question.id)).not.toContain('math1-1')
    expect(countFailedPracticeQuestions(failedSettings,attempts)).toBe(0)
  })


  it('uses the configured number of correct answers to clear a failed question',()=>{
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-1',true,1),
      attempt('math1-1',true,2),
    ]
    const failedSettings={...settings,failedOnly:false,failedEverOnly:true,failedRecoveryCorrectAnswers:3}
    expect(practiceQuestionPool(failedSettings,attempts).map(question=>question.id)).toContain('math1-1')
    expect(countFailedPracticeQuestions(failedSettings,attempts)).toBe(1)

    const recovered=[...attempts,attempt('math1-1',true,3)]
    expect(practiceQuestionPool(failedSettings,recovered).map(question=>question.id)).not.toContain('math1-1')
    expect(countFailedPracticeQuestions(failedSettings,recovered)).toBe(0)
  })

  it('resets mastery progress when the question is failed again',()=>{
    const attempts=[
      attempt('math1-1',false,0),
      attempt('math1-1',true,1),
      attempt('math1-1',false,2),
      attempt('math1-1',true,3),
    ]
    const failedSettings={...settings,failedOnly:false,failedEverOnly:true}
    expect(practiceQuestionPool(failedSettings,attempts).map(question=>question.id)).toContain('math1-1')
    expect(countFailedPracticeQuestions(failedSettings,attempts)).toBe(1)
  })

  it('does not classify questions as failed when they have only ever been answered correctly',()=>{
    const attempts=[
      attempt('math1-1',true,0),
      attempt('math1-1',true,1),
    ]
    const failedSettings={...settings,failedOnly:false,failedEverOnly:true}
    expect(practiceQuestionPool(failedSettings,attempts).map(question=>question.id)).not.toContain('math1-1')
    expect(countFailedPracticeQuestions(failedSettings,attempts)).toBe(0)
  })

  it('prioritizes unseen questions over already attempted questions',()=>{
    const chosen=choosePracticeQuestions(settings,[attempt('math1-1',false)],()=>0)
    expect(chosen.map(question=>question.id)).not.toContain('math1-1')
  })

  it('prioritizes a weaker question when the pool has been seen',()=>{
    const math=QUESTION_BANK.filter(question=>question.subject==='math')
    const attempts=math.map((question,index)=>attempt(question.id,question.id!=='math1-1',index))
    const chosen=choosePracticeQuestions({...settings,questionsPerSession:1},attempts,()=>0)
    expect(chosen[0].id).toBe('math1-1')
  })

  it('uses recency as a tiebreaker for equally performing questions',()=>{
    const math=QUESTION_BANK.filter(question=>question.subject==='math')
    const attempts=math.map((question,index)=>attempt(question.id,true,index))
    const chosen=choosePracticeQuestions({...settings,questionsPerSession:1},attempts,()=>0)
    expect(chosen[0].id).toBe(math[0].id)
  })
})

describe('practice summaries',()=>{
  const attempts=[attempt('math1-1',true,0),attempt('math1-2',false,1),attempt('math1-1',true,2)]
  const sessions:SessionSummary[]=[{id:'s1',startedAt:'2026-01-01T00:00:00.000Z',endedAt:'2026-01-01T00:01:00.000Z',mode:'math',questionCount:3,attempts}]

  it('preserves main performance metrics while allowing analytics detail',()=>{
    expect(summarizePerformance(attempts,sessions,120)).toMatchObject({accuracy:67,averageMs:2000,sessions:1,questionsSeen:2,totalQuestions:120})
  })

  it('summarizes the current session',()=>{
    expect(summarizeSession(attempts)).toEqual({accuracy:67,averageMs:2000,correct:2,total:3})
  })

  it('formats timing the same way as the original practice UI',()=>{
    expect(formatDuration(42_000)).toBe('42s')
    expect(formatDuration(125_000)).toBe('2m 5s')
  })
})

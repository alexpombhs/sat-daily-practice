import {render,screen} from '@testing-library/react'
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import DailyPracticeGoals from './DailyPracticeGoals'
import type {Attempt,SessionSummary} from '../../types'

function attempt(id:string,questionId:string,createdAt:string):Attempt{
  return {
    id,
    sessionId:`s-${id}`,
    questionId,
    practiceTestId:'practice-test-4',
    subject:'math',
    module:'math1',
    questionNumber:1,
    selectedAnswer:'A',
    correctAnswer:'A',
    correct:true,
    elapsedMs:60_000,
    createdAt,
  }
}

function session(id:string,startedAt:string,endedAt:string):SessionSummary{
  return {id,startedAt,endedAt,mode:'math',questionCount:1,attempts:[]}
}

describe('DailyPracticeGoals weekly streak',()=>{
  beforeEach(()=>{
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026,8,29,12,0,0))
  })

  afterEach(()=>vi.useRealTimers())

  it('counts practice from Monday and does not carry Sunday into the new week',()=>{
    const attempts=[
      attempt('sun','q-sun','2026-09-27T16:00:00.000Z'),
      attempt('mon','q-mon','2026-09-28T16:00:00.000Z'),
      attempt('tue','q-tue','2026-09-29T16:00:00.000Z'),
    ]
    const sessions=[
      session('s-sun','2026-09-27T16:00:00.000Z','2026-09-27T16:05:00.000Z'),
      session('s-mon','2026-09-28T16:00:00.000Z','2026-09-28T16:05:00.000Z'),
      session('s-tue','2026-09-29T16:00:00.000Z','2026-09-29T16:05:00.000Z'),
    ]

    render(
      <DailyPracticeGoals
        attempts={attempts}
        sessions={sessions}
        dailyQuestions={20}
        failedQuestionCount={0}
        signedIn={false}
        onPracticeMath={()=>{}}
        onPracticeReadingWriting={()=>{}}
        onPracticeVocabulary={()=>{}}
        onReviewFailed={()=>{}}
      />,
    )

    expect(screen.getByRole('heading',{name:'2 day streak'})).toBeInTheDocument()
    expect(screen.getByText('2 questions completed · 2 minutes learned')).toBeInTheDocument()
  })
  it('keeps failed-review credit when correct answers clear questions from the failed pool',()=>{
    const reviewed={...attempt('reviewed','q-reviewed','2026-09-29T16:10:00.000Z'),sessionId:'failed-only-session'}
    const failedOnlySession:SessionSummary={
      id:'failed-only-session',
      startedAt:'2026-09-29T16:00:00.000Z',
      endedAt:'2026-09-29T16:15:00.000Z',
      mode:'math',
      questionCount:1,
      attempts:[reviewed],
      settings:{mode:'math',questionsPerSession:10,showExplanations:true,shuffle:true,failedEverOnly:true},
    }

    render(
      <DailyPracticeGoals
        attempts={[reviewed]}
        sessions={[failedOnlySession]}
        dailyQuestions={20}
        failedQuestionCount={0}
        signedIn={false}
        onPracticeMath={()=>{}}
        onPracticeReadingWriting={()=>{}}
        onPracticeVocabulary={()=>{}}
        onReviewFailed={()=>{}}
      />,
    )

    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('reconstructs credit for legacy sessions whose failed-only setting was erased',()=>{
    const yesterdayFailure={...attempt('fail','q-legacy','2026-09-28T16:00:00.000Z'),correct:false}
    const yesterdayRecovery=attempt('recovery','q-legacy','2026-09-28T17:00:00.000Z')
    const todayRetry=attempt('retry','q-legacy','2026-09-29T16:00:00.000Z')
    const legacySession=session('s-retry','2026-09-29T15:55:00.000Z','2026-09-29T16:05:00.000Z')
    render(<DailyPracticeGoals
      attempts={[yesterdayFailure,yesterdayRecovery,todayRetry]}
      sessions={[legacySession]}
      dailyQuestions={20}
      failedQuestionCount={0}
      signedIn={false}
      onPracticeMath={()=>{}}
      onPracticeReadingWriting={()=>{}}
      onPracticeVocabulary={()=>{}}
      onReviewFailed={()=>{}}
    />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('shows actual questions completed when today exceeds the goal',()=>{
    const attemptsToday=Array.from({length:28},(_,index)=>attempt(
      `today-${index}`,
      `q-${index}`,
      `2026-09-29T16:${String(index%60).padStart(2,'0')}:00.000Z`,
    ))

    render(
      <DailyPracticeGoals
        attempts={attemptsToday}
        sessions={[]}
        dailyQuestions={20}
        failedQuestionCount={0}
        signedIn={false}
        onPracticeMath={()=>{}}
        onPracticeReadingWriting={()=>{}}
        onPracticeVocabulary={()=>{}}
        onReviewFailed={()=>{}}
      />,
    )

    expect(screen.getByText('· 28/20')).toBeInTheDocument()
  })

})

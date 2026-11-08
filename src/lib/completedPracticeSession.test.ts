import {describe,expect,it} from 'vitest'
import type {Attempt,Settings} from '../types'
import {completedPracticeSession} from './completedPracticeSession'
import {summarizeSession} from './practiceGamification'

const settings:Settings={
  mode:'math',questionsPerSession:6,showExplanations:true,shuffle:true,
}
const attempts:Attempt[]=Array.from({length:4},(_,index)=>({
  id:'a'+index,sessionId:'s1',questionId:'q'+index,
  subject:'math',module:'math1',questionNumber:index+1,
  selectedAnswer:index===3?'A':'B',correctAnswer:'B',correct:index!==3,
  elapsedMs:30000,createdAt:`2026-11-08T15:0${index}:00Z`,
}))

describe('finishing practice early',()=>{
  it('completes a six-question plan with only the four submitted answers',()=>{
    const session=completedPracticeSession('s1','2026-11-08T15:00:00Z',attempts,settings,12,'2026-11-08T15:05:00Z')
    expect(session.questionCount).toBe(4)
    expect(session.attempts.map(a=>a.questionId)).toEqual(['q0','q1','q2','q3'])
    expect(summarizeSession(session.attempts)).toMatchObject({correct:3,total:4,accuracy:75})
    expect(session.mode).toBe('math')
    expect(session.endedAt).toBe('2026-11-08T15:05:00Z')
  })
  it('still records a fully finished session with all answered questions',()=>{
    const session=completedPracticeSession('s2','2026-11-08T15:00:00Z',[...attempts,{...attempts[0],id:'a4',questionId:'q4'},{...attempts[0],id:'a5',questionId:'q5'}],settings,12)
    expect(session.questionCount).toBe(6)
    expect(summarizeSession(session.attempts).total).toBe(6)
  })
})

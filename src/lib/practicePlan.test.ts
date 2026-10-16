import {describe,expect,it} from 'vitest'
import {buildPracticePlanRecommendation} from './practicePlan'
import type {PerformanceAnalytics} from './performanceAnalytics'
import {QUESTION_BANK} from './questionBank'
import type {Attempt,Settings} from '../types'

const baseSettings:Settings={
  mode:'both',questionsPerSession:10,showExplanations:true,shuffle:true,
  targetExamDate:'2099-01-01',targetPracticeSets:8,targetCoveragePercent:100,fallbackMinutesPerQuestion:2,targetScore:1400,
}

const performance=(score:number|null,focus:'english'|'math'='math'):PerformanceAnalytics=>({
  accuracy:70,averageMs:60000,sessions:3,questionsSeen:20,totalQuestions:QUESTION_BANK.length,
  sections:[],questions:[],sessionMetrics:[],scoreTrend:[],latestScoreEstimate:score,weeklyScoreChange:null,scorePredictionBasis:null,scoreEstimateConfidence:null,
  recommendation:{subject:focus,label:focus==='math'?'Math':'Reading & Writing',reason:'Lower practice performance'},
})

function isoDateFromToday(offsetDays:number){
  const date=new Date()
  date.setHours(12,0,0,0)
  date.setDate(date.getDate()+offsetDays)
  return date.toISOString().slice(0,10)
}

describe('practice plan recommendations',()=>{
  it('uses the live bank size when calculating remaining coverage',()=>{
    const small=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK.slice(0,40),[],performance(1200))
    const larger=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK.slice(0,80),[],performance(1200))
    expect(small.bankQuestionCount).toBe(40)
    expect(larger.bankQuestionCount).toBe(80)
    expect(larger.remainingSessions).toBeGreaterThan(small.remainingSessions)
  })

  it('compares the configured target score with the practice estimate',()=>{
    const plan=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK,[],performance(1200,'math'))
    expect(plan.targetScore).toBe(1400)
    expect(plan.estimatedScore).toBe(1200)
    expect(plan.scoreGap).toBe(200)
    expect(plan.focusLabel).toBe('Math')
    expect(plan.focusSharePercent).toBe(65)
  })

  it('keeps a target-score plan active when coverage is complete but the score goal is not',()=>{
    const questions=QUESTION_BANK.slice(0,10)
    const attempts:Attempt[]=questions.map((question,index)=>({
      id:`a-${index}`,sessionId:'s1',questionId:question.id,practiceTestId:question.practiceTestId,subject:question.subject,module:question.module,questionNumber:question.number,selectedAnswer:question.correctAnswer,correctAnswer:question.correctAnswer,correct:true,elapsedMs:60000,createdAt:`2026-09-18T12:00:${String(index).padStart(2,'0')}.000Z`,
    }))
    const plan=buildPracticePlanRecommendation({...baseSettings,questionsPerSession:5},questions,attempts,performance(1300))
    expect(plan.remainingQuestions).toBe(0)
    expect(plan.scoreGap).toBe(100)
    expect(plan.recommendedSessionsPerDay).toBe(1)
  })

  it('asks for a cross-section baseline before treating a target as met',()=>{
    const plan=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK,[],performance(null))
    expect(plan.estimatedScore).toBeNull()
    expect(plan.scoreGuidance).toContain('Build a baseline in both sections')
  })

  it('keeps planned time stable instead of using recent slow question timing',()=>{
    const question=QUESTION_BANK[0]
    const slowAttempts:Attempt[]=Array.from({length:8},(_,index)=>({
      id:`slow-${index}`,sessionId:'s1',questionId:question.id,practiceTestId:question.practiceTestId,subject:question.subject,module:question.module,questionNumber:question.number,
      selectedAnswer:question.correctAnswer,correctAnswer:question.correctAnswer,correct:index%2===0,elapsedMs:150000,createdAt:new Date(Date.now()+index*1000).toISOString(),
    }))
    const plan=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK,slowAttempts,performance(1200))
    expect(plan.estimatedSessionMinutes).toBe(20)
    expect(plan.estimatedDailyMinutes).toBe(20)
    expect(plan.paceSource).toBe('configured plan')
  })

  it('does not increase sessions per day when the exam is tomorrow',()=>{
    const plan=buildPracticePlanRecommendation({...baseSettings,targetExamDate:isoDateFromToday(1)},QUESTION_BANK,[],performance(1200))
    expect(plan.daysRemaining).toBe(1)
    expect(plan.recommendedSessionsPerDay).toBe(1)
    expect(plan.estimatedDailyMinutes).toBe(20)
    expect(plan.planPhase).toBe('final-review')
    expect(plan.practiceGuidance).toContain('Final review day')
  })

  it('enters final review mode three days before the exam without adding volume',()=>{
    const plan=buildPracticePlanRecommendation({...baseSettings,targetExamDate:isoDateFromToday(3)},QUESTION_BANK,[],performance(1200))
    expect(plan.planPhase).toBe('final-review')
    expect(plan.recommendedSessionsPerDay).toBe(1)
    expect(plan.estimatedDailyMinutes).toBe(20)
    expect(plan.practiceGuidance).toContain('Final 3-day review')
  })
})

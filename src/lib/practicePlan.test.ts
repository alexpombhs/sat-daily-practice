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

describe('practice plan recommendations',()=>{
  it('uses the live bank size when calculating remaining coverage',()=>{
    const small=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK.slice(0,40),[],performance(1200))
    const larger=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK.slice(0,80),[],performance(1200))
    expect(small.bankQuestionCount).toBe(40)
    expect(larger.bankQuestionCount).toBe(80)
    expect(larger.remainingSessions).toBeGreaterThan(small.remainingSessions)
  })

  it('does not inflate official daily goals or recommended session size with targeted mock questions',()=>{
    const official=QUESTION_BANK.filter(question=>question.practiceTestId!=='practice-test-8')
    const withMock=buildPracticePlanRecommendation(baseSettings,QUESTION_BANK,[],performance(1490))
    const withoutMock=buildPracticePlanRecommendation(baseSettings,official,[],performance(1490))
    expect(withMock.bankQuestionCount).toBe(480)
    expect(withMock.availablePracticeSetCount).toBe(4)
    expect(withMock.questionsPerSession).toBe(10)
    expect(withMock.estimatedDailyMinutes).toBe(withoutMock.estimatedDailyMinutes)
    expect(withMock.remainingQuestions).toBe(withoutMock.remainingQuestions)
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
})

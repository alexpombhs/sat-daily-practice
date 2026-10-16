import type {PerformanceAnalytics} from './performanceAnalytics'
import type {Attempt,PracticeQuestion,Settings} from '../types'

export type PracticePlanPhase='steady'|'final-review'

export type PracticePlanRecommendation={
  bankQuestionCount:number
  availablePracticeSetCount:number
  targetPracticeSets:number
  daysRemaining:number
  uniqueQuestionsCompleted:number
  targetQuestions:number
  remainingQuestions:number
  questionsPerSession:number
  remainingSessions:number
  recommendedSessionsPerDay:number
  estimatedSessionMinutes:number
  estimatedDailyMinutes:number
  paceSource:'configured plan'
  planPhase:PracticePlanPhase
  practiceGuidance:string
  targetScore:number|null
  estimatedScore:number|null
  scoreGap:number|null
  focusLabel:string|null
  focusSharePercent:number|null
  scoreGuidance:string
}

function daysUntil(dateValue:string){
  const target=new Date(`${dateValue}T12:00:00`)
  if(Number.isNaN(target.getTime()))return 1
  const today=new Date();today.setHours(12,0,0,0)
  return Math.max(1,Math.ceil((target.getTime()-today.getTime())/86400000))
}

function scoreFocusShare(gap:number|null){
  if(gap===null||gap<=0)return null
  const raw=55+Math.min(15,gap/20)
  return Math.round(raw/5)*5
}

export function buildPracticePlanRecommendation(settings:Settings,questions:PracticeQuestion[],attempts:Attempt[],performance:PerformanceAnalytics):PracticePlanRecommendation{
  const bankQuestionCount=questions.length
  const availablePracticeSetCount=new Set(questions.map(question=>question.practiceTestId).filter(Boolean)).size
  const targetPracticeSets=Math.max(1,Math.round(settings.targetPracticeSets??(availablePracticeSetCount||1)))
  const coverage=Math.max(1,Math.min(100,settings.targetCoveragePercent??100))/100
  const targetQuestions=Math.ceil(bankQuestionCount*coverage)
  const questionIds=new Set(questions.map(question=>question.id))
  const uniqueQuestionsCompleted=new Set(attempts.filter(attempt=>questionIds.has(attempt.questionId)).map(attempt=>attempt.questionId)).size
  const remainingQuestions=Math.max(0,targetQuestions-uniqueQuestionsCompleted)
  const questionsPerSession=Math.max(1,settings.questionsPerSession)
  const remainingSessions=Math.ceil(remainingQuestions/questionsPerSession)
  const daysRemaining=daysUntil(settings.targetExamDate??new Date().toISOString().slice(0,10))

  const targetScore=typeof settings.targetScore==='number'?Math.max(400,Math.min(1600,Math.round(settings.targetScore/10)*10)):null
  const estimatedScore=performance.latestScoreEstimate
  const scoreGap=targetScore!==null&&estimatedScore!==null?targetScore-estimatedScore:null
  const needsScoreWork=targetScore!==null&&(estimatedScore===null||(scoreGap!==null&&scoreGap>0))

  // The daily target is a stable training prescription, not a deadline catch-up
  // calculation. Do not increase workload because fewer calendar days remain or
  // because the learner happened to spend longer on recent questions.
  const hasActiveGoal=remainingQuestions>0||needsScoreWork
  const recommendedSessionsPerDay=hasActiveGoal?1:0
  const plannedMinutesPerQuestion=Math.max(.25,settings.fallbackMinutesPerQuestion??2)
  const estimatedSessionMinutes=Math.max(1,Math.ceil(questionsPerSession*plannedMinutesPerQuestion))
  const estimatedDailyMinutes=estimatedSessionMinutes*recommendedSessionsPerDay

  const planPhase:PracticePlanPhase=daysRemaining<=3?'final-review':'steady'
  const practiceGuidance=planPhase==='final-review'
    ?daysRemaining===1
      ?'Final review day: keep the planned session short. Review the concepts behind recent misses, then stop; do not add extra volume to finish unused questions.'
      :'Final 3-day review: prioritize retrieval of weak concepts and previously missed questions. Keep the normal daily duration instead of increasing volume as the exam approaches.'
    :'Keep the daily workload steady. Progress comes from repeated retrieval and spaced review, not from increasing minutes as the exam gets closer.'

  const focusLabel=needsScoreWork?performance.recommendation?.label??null:null
  const focusSharePercent=scoreFocusShare(scoreGap)
  let scoreGuidance='Set a target score to compare your practice estimate with a specific goal.'
  if(targetScore!==null&&estimatedScore===null){
    scoreGuidance=`Target ${targetScore}. Build a baseline in both sections first; the score estimate starts after enough Reading & Writing and Math attempts.`
  }else if(targetScore!==null&&estimatedScore!==null&&scoreGap!==null&&scoreGap<=0){
    scoreGuidance=`Practice estimate ${estimatedScore} is at or above the ${targetScore} target. Shift toward mixed timed practice, error review, and maintaining consistency rather than adding volume.`
  }else if(targetScore!==null&&estimatedScore!==null&&scoreGap!==null){
    const focus=focusLabel??'the weaker section'
    scoreGuidance=`Practice estimate ${estimatedScore}; target ${targetScore}; gap ${scoreGap} points. Use about ${focusSharePercent}% of focused practice on ${focus}, prioritize previously missed questions, and keep the rest mixed so gains transfer across the test.`
  }

  return{
    bankQuestionCount,availablePracticeSetCount,targetPracticeSets,daysRemaining,uniqueQuestionsCompleted,targetQuestions,remainingQuestions,
    questionsPerSession,remainingSessions,recommendedSessionsPerDay,estimatedSessionMinutes,estimatedDailyMinutes,
    paceSource:'configured plan',planPhase,practiceGuidance,
    targetScore,estimatedScore,scoreGap,focusLabel,focusSharePercent,scoreGuidance,
  }
}

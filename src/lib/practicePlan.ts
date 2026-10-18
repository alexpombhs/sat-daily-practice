import type {PerformanceAnalytics} from './performanceAnalytics'
import type {Attempt,ExamTarget,PracticeQuestion,Settings} from '../types'

export type PracticePlanPhase='steady'|'final-review'|'exam-day'

export type PracticePlanRecommendation={
  bankQuestionCount:number
  availablePracticeSetCount:number
  targetPracticeSets:number
  daysRemaining:number
  activeExamLabel:string|null
  activeExamDate:string|null
  isExamDay:boolean
  uniqueQuestionsCompleted:number
  targetQuestions:number
  remainingQuestions:number
  questionsPerSession:number
  remainingSessions:number
  recommendedSessionsPerDay:number
  dailyQuestionGoal:number
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

function localDateKey(date:Date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export function examTargetsFromSettings(settings:Settings):ExamTarget[]{
  const targets:ExamTarget[]=(settings.examTargets??[])
    .filter(target=>target&&typeof target.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(target.date))
    .map(target=>({label:target.label?.trim()||'Exam',date:target.date,score:target.score,readingWritingScore:target.readingWritingScore,mathScore:target.mathScore}))
  if(targets.length===0&&settings.targetExamDate){
    targets.push({label:'Exam',date:settings.targetExamDate})
  }
  return targets
    .filter((target,index,array)=>array.findIndex(item=>item.date===target.date&&item.label===target.label)===index)
    .sort((a,b)=>a.date.localeCompare(b.date))
}

function activeExamTarget(settings:Settings,today=new Date()){
  const todayKey=localDateKey(today)
  const targets=examTargetsFromSettings(settings)
  return targets.find(target=>target.date>=todayKey)??null
}

function daysUntil(dateValue:string,today=new Date()){
  const target=new Date(`${dateValue}T12:00:00`)
  if(Number.isNaN(target.getTime()))return 0
  const base=new Date(today);base.setHours(12,0,0,0)
  return Math.max(0,Math.ceil((target.getTime()-base.getTime())/86400000))
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
  const activeExam=activeExamTarget(settings)
  const activeExamDate=activeExam?.date??null
  const activeExamLabel=activeExam?.label??null
  const daysRemaining=activeExamDate?daysUntil(activeExamDate):0
  const isExamDay=Boolean(activeExamDate&&daysRemaining===0)

  const targetScore=typeof settings.targetScore==='number'?Math.max(400,Math.min(1600,Math.round(settings.targetScore/10)*10)):null
  const estimatedScore=performance.latestScoreEstimate
  const scoreGap=targetScore!==null&&estimatedScore!==null?targetScore-estimatedScore:null
  const needsScoreWork=targetScore!==null&&(estimatedScore===null||(scoreGap!==null&&scoreGap>0))

  const hasActiveGoal=remainingQuestions>0||needsScoreWork
  const plannedMinutesPerQuestion=Math.max(.25,settings.fallbackMinutesPerQuestion??2)

  // Keep the daily study-plan target intentionally small and actionable.
  // When an exam date is known, pace unseen questions across the remaining
  // preparation days, but never prescribe fewer than 10 or more than 20.
  // Once new-question coverage is complete, keep a light 10-question mixed
  // practice target only when score work is still needed.
  let desiredDailyQuestions=15
  if(remainingQuestions<=0){
    desiredDailyQuestions=needsScoreWork?10:0
  }else if(activeExamDate&&daysRemaining>0){
    desiredDailyQuestions=Math.max(10,Math.min(20,Math.ceil(remainingQuestions/daysRemaining)))
  }else{
    desiredDailyQuestions=Math.max(10,Math.min(20,questionsPerSession))
  }
  // Use understandable 10 / 15 / 20 question milestones instead of odd numbers.
  const roundedDailyQuestions=[10,15,20].reduce((best,value)=>Math.abs(value-desiredDailyQuestions)<Math.abs(best-desiredDailyQuestions)?value:best,10)
  const dailyQuestionGoal=isExamDay||!hasActiveGoal?0:roundedDailyQuestions
  const recommendedSessionsPerDay=dailyQuestionGoal>0?Math.max(1,Math.ceil(dailyQuestionGoal/questionsPerSession)):0
  const estimatedSessionMinutes=Math.max(1,Math.ceil(questionsPerSession*plannedMinutesPerQuestion))
  const estimatedDailyMinutes=dailyQuestionGoal>0?Math.ceil(dailyQuestionGoal*plannedMinutesPerQuestion):0

  const planPhase:PracticePlanPhase=isExamDay?'exam-day':daysRemaining>0&&daysRemaining<=3?'final-review':'steady'
  const practiceGuidance=planPhase==='exam-day'
    ?`${activeExamLabel??'Exam'} day: no practice is expected today. The study plan resumes for the next scheduled test afterward.`
    :planPhase==='final-review'
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
    bankQuestionCount,availablePracticeSetCount,targetPracticeSets,daysRemaining,activeExamLabel,activeExamDate,isExamDay,uniqueQuestionsCompleted,targetQuestions,remainingQuestions,
    questionsPerSession,remainingSessions,recommendedSessionsPerDay,dailyQuestionGoal:isExamDay?0:dailyQuestionGoal,estimatedSessionMinutes,estimatedDailyMinutes,
    paceSource:'configured plan',planPhase,practiceGuidance,
    targetScore,estimatedScore,scoreGap,focusLabel,focusSharePercent,scoreGuidance,
  }
}

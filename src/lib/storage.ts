import type {Settings} from '../types'

function dateInDays(days:number){
  const date=new Date()
  date.setHours(12,0,0,0)
  date.setDate(date.getDate()+days)
  return date.toISOString().slice(0,10)
}

export const DEFAULT_SETTINGS:Settings={
  mode:'both',
  questionsPerSession:10,
  showExplanations:true,
  answerFeedbackTiming:'end',
  shuffle:true,
  practiceTest:'all',
  selectionMode:'adaptive',
  failedOnly:false,
  failedEverOnly:false,
  targetExamDate:dateInDays(30),
  targetPracticeSets:8,
  targetCoveragePercent:100,
  fallbackMinutesPerQuestion:2,
}

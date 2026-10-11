import {QUESTION_BANK} from './questionBank'
import type {Attempt,ModuleKey,PracticeQuestion,PracticeTestId,SessionSummary,Subject} from '../types'

export type SectionPerformance={
  subject:Subject
  label:string
  attempts:number
  correct:number
  successRate:number
  averageMs:number
}

export type QuestionPerformance={
  questionId:string
  practiceTestId:PracticeTestId
  subject:Subject
  module:ModuleKey
  questionNumber:number
  attempts:number
  correct:number
  successRate:number
  averageMs:number
  lastAttemptAt:string
}

export type SessionPerformance={
  sessionId:string
  startedAt:string
  endedAt:string
  mode:SessionSummary['mode']
  attempts:number
  correct:number
  accuracy:number
  averageMs:number
}

export type ScoreTrendPoint={
  sessionId:string
  startedAt:string
  score:number
  delta:number
  sessionNumber:number
  calibrating:boolean
}

export type PracticeRecommendation={
  subject:Subject
  label:string
  reason:string
}

export type ScorePredictionBasis={
  sessionCount:number
  questionCount:number
  averageQuestionSuccessRate:number
  sections:Array<{subject:Subject;label:string;questions:number;observedQuestions:number;successRate:number}>
}

export type ScoreEstimateConfidence={
  within40:number
  within50:number
  within80:number
  within100:number
  sigmaPoints:number
  readingWritingQuestionSigmaPoints:number
  mathQuestionSigmaPoints:number
  trendSigmaPoints:number
  label:'Low'|'Developing'|'Moderate'|'High'
}

export type PerformanceAnalytics={
  accuracy:number
  averageMs:number
  sessions:number
  questionsSeen:number
  totalQuestions:number
  sections:SectionPerformance[]
  questions:QuestionPerformance[]
  sessionMetrics:SessionPerformance[]
  scoreTrend:ScoreTrendPoint[]
  latestScoreEstimate:number|null
  weeklyScoreChange:number|null
  scorePredictionBasis:ScorePredictionBasis|null
  scoreEstimateConfidence:ScoreEstimateConfidence|null
  recommendation:PracticeRecommendation|null
}

const SECTION_LABELS:Record<Subject,string>={english:'Reading & Writing',math:'Math'}
const SCORE_BASE=200
const SCORE_RANGE=600
const MIN_SECTION_QUESTIONS_FOR_SCORE=3
export const SCORE_SESSION_WINDOW=10

const percent=(correct:number,total:number)=>total?Math.round(100*correct/total):0
const average=(values:number[])=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0

export function estimateSectionPracticeScore(successRate:number){
  const raw=SCORE_BASE+(Math.max(0,Math.min(100,successRate))/100)*SCORE_RANGE
  return Math.max(200,Math.min(800,Math.round(raw/10)*10))
}

function buildSections(attempts:Attempt[]):SectionPerformance[]{
  return (['english','math'] as Subject[]).map(subject=>{
    const rows=attempts.filter(attempt=>attempt.subject===subject)
    const correct=rows.filter(attempt=>attempt.correct).length
    return {
      subject,
      label:SECTION_LABELS[subject],
      attempts:rows.length,
      correct,
      successRate:percent(correct,rows.length),
      averageMs:average(rows.map(attempt=>attempt.elapsedMs)),
    }
  })
}

function estimateOverallScore(sections:SectionPerformance[],observedAttempts:Attempt[]){
  const english=sections.find(section=>section.subject==='english')
  const math=sections.find(section=>section.subject==='math')
  const observed=(subject:Subject)=>new Set(observedAttempts.filter(a=>a.subject===subject).map(a=>a.questionId)).size
  if(!english||!math||observed('english')<MIN_SECTION_QUESTIONS_FOR_SCORE||observed('math')<MIN_SECTION_QUESTIONS_FOR_SCORE)return null
  return estimateSectionPracticeScore(english.successRate)+estimateSectionPracticeScore(math.successRate)
}

// Estimate all questions on the canonical test forms, not only the questions
// sampled in a moving session window. A successful review can never make the
// probability for that specific question go down.
const OLDER_ATTEMPT_WEIGHT=.6
const PRIOR_STRENGTH=2

function buildScoreSections(historyAttempts:Attempt[],questionBank:PracticeQuestion[]):SectionPerformance[]{
  const grouped=new Map<string,Attempt[]>()
  historyAttempts.forEach(attempt=>grouped.set(attempt.questionId,[...(grouped.get(attempt.questionId)??[]),attempt]))

  return (['english','math'] as Subject[]).map(subject=>{
    const eligible=questionBank.filter(question=>question.subject===subject)
    const relevant=historyAttempts.filter(attempt=>attempt.subject===subject)
    // Estimate a section-level prior from each practiced question's initial
    // attempt (avoids overrepresenting repeated reviews of hard questions).
    const initial=[...grouped.values()].map(rows=>rows[0]).filter(a=>a.subject===subject)
    const baseline=(initial.filter(a=>a.correct).length+1)/(initial.length+2)
    const questionProbabilities=eligible.map(question=>{
      const attempts=[...(grouped.get(question.id)??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
      if(!attempts.length)return baseline
      let weight=0,correct=0
      attempts.forEach(a=>{
        weight=weight*OLDER_ATTEMPT_WEIGHT+1
        correct=correct*OLDER_ATTEMPT_WEIGHT+(a.correct?1:0)
      })
      return (PRIOR_STRENGTH*baseline+correct)/(PRIOR_STRENGTH+weight)
    })
    // The bank contains complete 120-question forms (66 RW + 54 Math).
    // Each question contributes once to its section expectation.
    const expected=questionProbabilities.reduce((sum,p)=>sum+p,0)
    return {
      subject,label:SECTION_LABELS[subject],
      attempts:eligible.length,
      correct:expected,
      successRate:eligible.length?Math.round(100*expected/eligible.length):0,
      averageMs:average(relevant.map(a=>a.elapsedMs)),
    }
  })
}

function predictionBasis(sections:SectionPerformance[],sessionCount:number,historyAttempts:Attempt[]):ScorePredictionBasis{
  const questionCount=sections.reduce((sum,section)=>sum+section.attempts,0)
  const weightedRate=questionCount
    ?sections.reduce((sum,section)=>sum+section.successRate*section.attempts,0)/questionCount
    :0
  return {
    sessionCount,
    questionCount,
    averageQuestionSuccessRate:Math.round(weightedRate),
    sections:sections.map(section=>({
      subject:section.subject,
      label:section.label,
      questions:section.attempts,
      observedQuestions:new Set(historyAttempts.filter(a=>a.subject===section.subject).map(a=>a.questionId)).size,
      successRate:section.successRate,
    })),
  }
}

function buildQuestions(attempts:Attempt[]):QuestionPerformance[]{
  const grouped=new Map<string,Attempt[]>()
  attempts.forEach(attempt=>grouped.set(attempt.questionId,[...(grouped.get(attempt.questionId)??[]),attempt]))

  return [...grouped.entries()].map(([questionId,rows])=>{
    const latest=[...rows].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]
    const correct=rows.filter(attempt=>attempt.correct).length
    return {
      questionId,
      practiceTestId:latest.practiceTestId??'practice-test-4',
      subject:latest.subject,
      module:latest.module,
      questionNumber:latest.questionNumber,
      attempts:rows.length,
      correct,
      successRate:percent(correct,rows.length),
      averageMs:average(rows.map(attempt=>attempt.elapsedMs)),
      lastAttemptAt:latest.createdAt,
    }
  }).sort((a,b)=>a.successRate-b.successRate||b.attempts-a.attempts||b.averageMs-a.averageMs||a.questionNumber-b.questionNumber)
}

function buildSessions(attempts:Attempt[],sessions:SessionSummary[],questionBank:PracticeQuestion[]){
  const bySession=new Map<string,Attempt[]>()
  attempts.forEach(attempt=>bySession.set(attempt.sessionId,[...(bySession.get(attempt.sessionId)??[]),attempt]))
  const ordered=[...sessions].sort((a,b)=>a.startedAt.localeCompare(b.startedAt))
  const sessionMetrics:SessionPerformance[]=ordered.map(session=>{
    const rows=bySession.get(session.id)??[]
    const correct=rows.filter(attempt=>attempt.correct).length
    return {
      sessionId:session.id,
      startedAt:session.startedAt,
      endedAt:session.endedAt,
      mode:session.mode,
      attempts:rows.length,
      correct,
      accuracy:percent(correct,rows.length),
      averageMs:average(rows.map(attempt=>attempt.elapsedMs)),
    }
  })

  const scoreTrend:ScoreTrendPoint[]=[]
  let previousScore:number|null=null
  let latestScoreEstimate:number|null=null
  let latestScorePredictionBasis:ScorePredictionBasis|null=null
  ordered.forEach((session,index)=>{
    const historicalAttempts=attemptsForSessions(attempts,ordered.slice(0,index+1))
    const scoreSections=buildScoreSections(historicalAttempts,questionBank)
    const score=estimateOverallScore(scoreSections,historicalAttempts)
    latestScoreEstimate=score
    latestScorePredictionBasis=predictionBasis(scoreSections,Math.min(SCORE_SESSION_WINDOW,index+1),historicalAttempts)
    if(score===null)return
    scoreTrend.push({
      sessionId:session.id,
      startedAt:session.startedAt,
      score,
      delta:previousScore===null?0:score-previousScore,
      sessionNumber:index+1,
      calibrating:index+1<SCORE_SESSION_WINDOW,
    })
    previousScore=score
  })

  return {sessionMetrics,scoreTrend,latestScoreEstimate,latestScorePredictionBasis}
}

function weeklyScoreChange(scoreTrend:ScoreTrendPoint[]){
  const latest=scoreTrend[scoreTrend.length-1]
  if(!latest)return null
  const latestTime=new Date(latest.startedAt).getTime()
  if(!Number.isFinite(latestTime))return null
  const cutoff=latestTime-7*24*60*60*1000
  let comparison:ScoreTrendPoint|undefined
  for(const point of scoreTrend){
    const time=new Date(point.startedAt).getTime()
    if(Number.isFinite(time)&&time<=cutoff)comparison=point
    else if(Number.isFinite(time)&&time>cutoff)break
  }
  return comparison?latest.score-comparison.score:null
}

function erf(value:number){
  // Abramowitz-Stegun approximation; sufficient for UI confidence estimates.
  const sign=value<0?-1:1
  const x=Math.abs(value)
  const t=1/(1+.3275911*x)
  const y=1-(((((1.061405429*t-1.453152027)*t+1.421413741)*t-.284496736)*t+.254829592)*t)*Math.exp(-x*x)
  return sign*y
}

function probabilityWithin(points:number,sigma:number){
  if(sigma<=0)return 100
  return Math.round(100*erf(points/(sigma*Math.sqrt(2))))
}

function sampleStandardDeviation(values:number[]){
  if(values.length<2)return 0
  const mean=average(values)
  return Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/(values.length-1))
}

function buildScoreEstimateConfidence(
  basis:ScorePredictionBasis|null,
  scoreTrend:ScoreTrendPoint[],
):ScoreEstimateConfidence|null{
  if(!basis)return null
  const english=basis.sections.find(section=>section.subject==='english')
  const math=basis.sections.find(section=>section.subject==='math')
  if(!english||!math||english.observedQuestions<3||math.observedQuestions<3)return null

  // Approximate question-pool sampling uncertainty for each section using
  // Bernoulli variance at the observed success rate, then convert the
  // percentage-point uncertainty through the app's 600-point section scale.
  const sectionSigma=(successRate:number,questions:number)=>{
    const p=Math.max(.01,Math.min(.99,successRate/100))
    const sePercent=100*Math.sqrt(p*(1-p)/Math.max(1,questions))
    return sePercent*6
  }
  const readingWritingQuestionSigmaPoints=sectionSigma(english.successRate,english.observedQuestions)
  const mathQuestionSigmaPoints=sectionSigma(math.successRate,math.observedQuestions)
  const questionPoolSigma=Math.sqrt(
    readingWritingQuestionSigmaPoints**2+
    mathQuestionSigmaPoints**2
  )

  // Recent score movement captures instability not represented by question
  // sampling alone. Use up to the latest seven predictions.
  const recentScores=scoreTrend.slice(-7).map(point=>point.score)
  const trendSigma=sampleStandardDeviation(recentScores)

  // College Board reports about ±40 points standard error for an SAT total.
  const officialMeasurementSigma=40
  const sigmaPoints=Math.round(Math.sqrt(
    officialMeasurementSigma**2+
    questionPoolSigma**2+
    trendSigma**2
  ))

  const within40=probabilityWithin(40,sigmaPoints)
  const within50=probabilityWithin(50,sigmaPoints)
  const within80=probabilityWithin(80,sigmaPoints)
  const within100=probabilityWithin(100,sigmaPoints)
  const label=within80>=85?'High':within80>=75?'Moderate':within80>=60?'Developing':'Low'

  return {
    within40,
    within50,
    within80,
    within100,
    sigmaPoints,
    readingWritingQuestionSigmaPoints:Math.round(readingWritingQuestionSigmaPoints),
    mathQuestionSigmaPoints:Math.round(mathQuestionSigmaPoints),
    trendSigmaPoints:Math.round(trendSigma),
    label,
  }
}

function buildRecommendation(sections:SectionPerformance[]):PracticeRecommendation|null{
  const english=sections.find(section=>section.subject==='english')!
  const math=sections.find(section=>section.subject==='math')!
  if(!english.attempts&&!math.attempts)return null
  if(!english.attempts)return {subject:'english',label:english.label,reason:`You have ${math.attempts} Math attempts but no Reading & Writing baseline yet. Practice a few Reading & Writing questions next so the recommendation can compare both sections.`}
  if(!math.attempts)return {subject:'math',label:math.label,reason:`You have ${english.attempts} Reading & Writing attempts but no Math baseline yet. Practice a few Math questions next so the recommendation can compare both sections.`}

  let focus=english.successRate<math.successRate?english:math
  let other=focus.subject==='english'?math:english
  if(english.successRate===math.successRate){
    focus=english.averageMs>=math.averageMs?english:math
    other=focus.subject==='english'?math:english
  }

  const gap=Math.max(0,other.successRate-focus.successRate)
  const focusSeconds=Math.round(focus.averageMs/1000)
  const otherSeconds=Math.round(other.averageMs/1000)
  const reason=gap>=3
    ?`${focus.label} is ${gap} percentage points lower in success rate (${focus.successRate}% vs. ${other.successRate}%). Average time is ${focusSeconds}s per question.`
    :focusSeconds>otherSeconds
      ?`${focus.label} accuracy is close to ${other.label}, but it is currently slower (${focusSeconds}s vs. ${otherSeconds}s per question).`
      :`${focus.label} is currently the slightly weaker section when accuracy and response time are considered together.`

  return {subject:focus.subject,label:focus.label,reason}
}

export function buildPerformanceAnalytics(attempts:Attempt[],sessions:SessionSummary[],totalQuestions:number,questionBank:PracticeQuestion[]=QUESTION_BANK):PerformanceAnalytics{
  const correct=attempts.filter(attempt=>attempt.correct).length
  const sections=buildSections(attempts)
  const {sessionMetrics,scoreTrend,latestScoreEstimate,latestScorePredictionBasis}=buildSessions(attempts,sessions,questionBank)
  return {
    accuracy:percent(correct,attempts.length),
    averageMs:average(attempts.map(attempt=>attempt.elapsedMs)),
    sessions:sessions.length,
    questionsSeen:new Set(attempts.map(attempt=>attempt.questionId)).size,
    totalQuestions,
    sections,
    questions:buildQuestions(attempts),
    sessionMetrics,
    scoreTrend,
    latestScoreEstimate,
    weeklyScoreChange:weeklyScoreChange(scoreTrend),
    scorePredictionBasis:latestScorePredictionBasis,
    scoreEstimateConfidence:buildScoreEstimateConfidence(latestScorePredictionBasis,scoreTrend),
    recommendation:buildRecommendation(sections),
  }
}

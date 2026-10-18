import {useEffect,useState,type ReactNode} from 'react'
import {BookOpen,Check,Flame,Languages,RotateCcw,Sigma,Star} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexText from '../atoms/AlexText'
import DashboardCard from '../molecules/DashboardCard'
import {dashboardTypography} from '../theme'
import {loadVocabularyAttempts} from '../../lib/supabase'
import type {VocabularyAttempt} from '../../lib/vocabulary'
import type {Attempt,SessionSummary} from '../../types'

type Props={
  attempts:Attempt[]
  sessions:SessionSummary[]
  dailyQuestions:number
  failedQuestionCount:number
  recommendationLabel?:string
  recommendationReason?:string
  isExamDay?:boolean
  examLabel?:string|null
  signedIn:boolean
  vocabularyDailyTarget?:number
  onPracticeMath:()=>void
  onPracticeReadingWriting:()=>void
  onPracticeVocabulary:()=>void
  onReviewFailed:()=>void
}

const DAY_LABELS=['Mo','Tu','We','Th','Fr','Sa','Su']
function localDayKey(value:string|Date){
  const date=value instanceof Date?value:new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function startOfWeek(today:Date){
  const date=new Date(today.getFullYear(),today.getMonth(),today.getDate())
  const day=date.getDay()
  date.setDate(date.getDate()-(day===0?6:day-1))
  return date
}

export default function DailyPracticeGoals({
  attempts,sessions,dailyQuestions,failedQuestionCount,recommendationLabel='Keep practicing',recommendationReason,
  isExamDay=false,examLabel,signedIn,vocabularyDailyTarget=20,onPracticeMath,onPracticeReadingWriting,onPracticeVocabulary,onReviewFailed,
}:Props){
  const[vocabularyAttempts,setVocabularyAttempts]=useState<VocabularyAttempt[]>([])

  useEffect(()=>{
    if(!signedIn){setVocabularyAttempts([]);return}
    let cancelled=false
    void loadVocabularyAttempts()
      .then(rows=>{if(!cancelled)setVocabularyAttempts(rows)})
      .catch(error=>console.warn('Vocabulary goal history load failed',error))
    return()=>{cancelled=true}
  },[signedIn])

  const today=new Date()
  const todayKey=localDayKey(today)
  const todayAttempts=attempts.filter(attempt=>localDayKey(attempt.createdAt)===todayKey)
  const questionsDone=todayAttempts.length
  const vocabularyDone=vocabularyAttempts.filter(attempt=>localDayKey(attempt.createdAt)===todayKey).length
  const reviewedFailedQuestionIds=new Set<string>()
  const masteryByQuestion=new Map<string,{failed:boolean;correctAfterFailure:number}>()
  const previouslyFailedIds=new Set<string>()
  const orderedAttempts=attempts
    .map((attempt,index)=>({attempt,index}))
    .sort((a,b)=>a.attempt.createdAt.localeCompare(b.attempt.createdAt)||a.index-b.index)

  orderedAttempts.forEach(({attempt})=>{
    const mastery=masteryByQuestion.get(attempt.questionId)??{failed:false,correctAfterFailure:0}
    if(localDayKey(attempt.createdAt)===todayKey&&(mastery.failed||previouslyFailedIds.has(attempt.questionId))){
      reviewedFailedQuestionIds.add(attempt.questionId)
    }
    if(!attempt.correct){
      previouslyFailedIds.add(attempt.questionId)
      mastery.failed=true
      mastery.correctAfterFailure=0
    }else if(mastery.failed){
      mastery.correctAfterFailure+=1
      if(mastery.correctAfterFailure>=2)mastery.failed=false
    }
    masteryByQuestion.set(attempt.questionId,mastery)
  })

  sessions.forEach(session=>{
    if(!session.settings?.failedEverOnly)return
    const sessionAttempts=attempts.filter(attempt=>attempt.sessionId===session.id)
    sessionAttempts.forEach(attempt=>{
      if(localDayKey(attempt.createdAt)===todayKey)reviewedFailedQuestionIds.add(attempt.questionId)
    })
  })

  const reviewedFailedCount=reviewedFailedQuestionIds.size
  const noPracticeToday=isExamDay||dailyQuestions<=0
  const questionTarget=Math.max(1,dailyQuestions)
  const weekStart=startOfWeek(today)
  const weekDays=DAY_LABELS.map((label,index)=>{
    const date=new Date(weekStart)
    date.setDate(weekStart.getDate()+index)
    const key=localDayKey(date)
    const practiced=sessions.some(session=>localDayKey(session.endedAt||session.startedAt)===key)
      ||attempts.some(attempt=>localDayKey(attempt.createdAt)===key)
    return{label,key,practiced,isToday:key===todayKey}
  })
  const practicedDays=weekDays.filter(day=>day.practiced).length
  const streak=practicedDays
  const weeklyQuestions=attempts.filter(attempt=>new Date(attempt.createdAt)>=weekStart).length
  const weeklyMinutes=Math.round(attempts.filter(attempt=>new Date(attempt.createdAt)>=weekStart).reduce((total,attempt)=>total+attempt.elapsedMs,0)/60000)
  const daysToWeeklyStreak=Math.max(0,2-practicedDays)

  const actionSx={
    width:28,height:28,border:'1px solid #D7E0EA',bgcolor:'#fff',color:'#0B376D',
    '&:hover':{bgcolor:'#F3F7FB'},
  }

  return <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(auto-fit,minmax(min(100%,260px),1fr))',lg:'repeat(3,minmax(0,1fr))'},gap:1.5,minHeight:0,height:'100%',alignItems:'stretch'}}>
    <DashboardCard tone="white" variant="support" title="Today's goals">
      {noPracticeToday
        ?<AlexBox sx={{display:'grid',gap:.45}}>
          <AlexText sx={isExamDay?{fontFamily:'Georgia, "Times New Roman", serif',fontSize:dashboardTypography.supportTitle,fontWeight:700,lineHeight:1,letterSpacing:'-.02em',color:'#08275B'}:{fontSize:dashboardTypography.supportBody,fontWeight:800,color:'#08275B'}}>
            {isExamDay?`${examLabel??'Exam'} day`:'No practice planned'}
          </AlexText>
          <AlexText sx={{fontSize:dashboardTypography.supportSecondary,color:'#667085',lineHeight:1.35}}>
            {isExamDay?'No practice is expected today. This day will not count as missed practice.':'Your current plan does not require practice today.'}
          </AlexText>
        </AlexBox>
        :<AlexBox sx={{display:'grid',gap:{xs:1.05,xl:.65}}}>
          <GoalRow complete={questionsDone>=questionTarget} label="Practice questions" value={`${questionsDone}/${questionTarget}`}>
            <AlexIconButton label="Practice Math now" onClick={onPracticeMath} sx={actionSx}><Sigma size={15}/></AlexIconButton>
            <AlexIconButton label="Practice Reading & Writing now" onClick={onPracticeReadingWriting} sx={actionSx}><BookOpen size={15}/></AlexIconButton>
          </GoalRow>
          <GoalRow complete={vocabularyDone>=vocabularyDailyTarget} label="Practice vocabulary" value={`${vocabularyDone}/${vocabularyDailyTarget} words`}>
            <AlexIconButton label="Practice vocabulary now" onClick={onPracticeVocabulary} sx={actionSx}><Languages size={15}/></AlexIconButton>
          </GoalRow>
          <GoalRow complete={failedQuestionCount===0||reviewedFailedCount>0} label="Review failed questions" value={failedQuestionCount===0?'Clear':`${Math.min(reviewedFailedCount,1)}/1`}>
            <AlexIconButton label={failedQuestionCount===0?'No failed questions to review':'Review failed questions now'} disabled={failedQuestionCount===0} onClick={onReviewFailed} sx={actionSx}><RotateCcw size={15}/></AlexIconButton>
          </GoalRow>
        </AlexBox>}
    </DashboardCard>

    <DashboardCard tone="white" variant="support" icon={<Flame/>} title={`${streak} day streak`}>
      <AlexText sx={{fontSize:dashboardTypography.supportBody,lineHeight:1.25,fontWeight:400,color:'#111'}}>
        {daysToWeeklyStreak>0?`${daysToWeeklyStreak} days left to start your weekly streak!`:'Your weekly streak is underway!'}
      </AlexText>
      <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:{xs:.45,lg:.35,xl:.45},alignItems:'center',width:'100%',minWidth:0}}>
        {weekDays.map(day=><AlexBox key={day.key} sx={{
          width:'100%',aspectRatio:'1 / 1',maxWidth:{xs:36,lg:30,xl:28},justifySelf:'start',borderRadius:'5px',
          border:'1.5px solid',borderColor:day.practiced?'#B38CFF':day.isToday?'#111':'#C8D1DE',
          bgcolor:day.practiced?'#F7F2FF':'#fff',
          color:day.practiced?'#6F35E8':day.isToday?'#111':'#475467',
          display:'grid',placeItems:'center',
        }}>
          {day.practiced?<Check size={16} strokeWidth={2.2}/>:<AlexText sx={{fontSize:{xs:13.5,lg:11.5,xl:10.5},fontWeight:day.isToday?700:400,color:'inherit'}}>{day.label}</AlexText>}
        </AlexBox>)}
      </AlexBox>
      <AlexText sx={{fontSize:dashboardTypography.supportSecondary,fontWeight:400,lineHeight:1.2,color:'#667085',whiteSpace:{lg:'nowrap'},overflow:'hidden',textOverflow:'ellipsis'}}>
        {weeklyQuestions} questions completed · {weeklyMinutes} minutes learned
      </AlexText>
    </DashboardCard>

    <DashboardCard tone="lavender" variant="support" title="Recommended focus" value={recommendationLabel} sx={{display:{xs:'none',lg:'flex'}}}>
      {recommendationReason&&<AlexText sx={{fontSize:dashboardTypography.supportBody,lineHeight:1.4,fontWeight:400,color:'#475467'}}>{recommendationReason}</AlexText>}
    </DashboardCard>
  </AlexBox>
}

function GoalRow({complete,label,value,children}:{complete:boolean;label:string;value:string;children:ReactNode}){
  return <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'30px minmax(0,1fr) auto',xl:'24px minmax(0,1fr) auto'},alignItems:'center',columnGap:{xs:1.15,xl:.75},minWidth:0}}>
    <AlexBox aria-hidden="true" sx={{width:{xs:30,xl:24},height:{xs:30,xl:24},borderRadius:'50%',display:'grid',placeItems:'center',bgcolor:complete?'#E8F7EE':'#EEF2F7',color:complete?'#20935A':'#C7D1DF'}}>
      <Star size={17} fill="currentColor" strokeWidth={1.4}/>
    </AlexBox>
    <AlexText sx={{fontFamily:'inherit',fontSize:dashboardTypography.supportBody,fontWeight:400,lineHeight:1.3,color:'#111',minWidth:0}}>
      <AlexBox component="span" sx={{textDecoration:'underline',textUnderlineOffset:'2px'}}>{label}</AlexBox>
      <AlexBox component="span"> · {value}</AlexBox>
    </AlexText>
    <AlexBox sx={{display:'flex',alignItems:'center',gap:.45}}>{children}</AlexBox>
  </AlexBox>
}

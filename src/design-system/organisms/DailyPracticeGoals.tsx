import {Check,Flame,Star} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import DashboardCard from '../molecules/DashboardCard'
import {dashboardTypography} from '../theme'
import type {Attempt,SessionSummary} from '../../types'

type Props={
  attempts:Attempt[]
  sessions:SessionSummary[]
  dailyQuestions:number
  dailyMinutes:number
  failedQuestionCount:number
  recommendationLabel?:string
  recommendationReason?:string
  isExamDay?:boolean
  examLabel?:string|null
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

export default function DailyPracticeGoals({attempts,sessions,dailyQuestions,dailyMinutes,failedQuestionCount,recommendationLabel='Keep practicing',recommendationReason,isExamDay=false,examLabel}:Props){
  const today=new Date()
  const todayKey=localDayKey(today)
  const todayAttempts=attempts.filter(attempt=>localDayKey(attempt.createdAt)===todayKey)
  const questionsDone=todayAttempts.length
  const reviewedFailedQuestionIds=new Set<string>()
  const masteryByQuestion=new Map<string,{failed:boolean;correctAfterFailure:number}>()
  const previouslyFailedIds=new Set<string>()
  const orderedAttempts=attempts
    .map((attempt,index)=>({attempt,index}))
    .sort((a,b)=>a.attempt.createdAt.localeCompare(b.attempt.createdAt)||a.index-b.index)

  orderedAttempts.forEach(({attempt})=>{
    const mastery=masteryByQuestion.get(attempt.questionId)??{failed:false,correctAfterFailure:0}

    // A failed-question review counts when the question was already in the
    // failed pool before today's attempt, regardless of whether this retry
    // is answered correctly.
    // Older sessions may have lost their failed-only setting at completion.
    // Their prior incorrect answers still establish review credit, even when
    // the question has since reached mastery and left the failed pool.
    if(localDayKey(attempt.createdAt)===todayKey&&(mastery.failed||previouslyFailedIds.has(attempt.questionId))){
      reviewedFailedQuestionIds.add(attempt.questionId)
    }

    if(!attempt.correct){
      previouslyFailedIds.add(attempt.questionId)
      mastery.failed=true
      mastery.correctAfterFailure=0
    }else if(mastery.failed){
      mastery.correctAfterFailure+=1
      if(mastery.correctAfterFailure>=2){
        mastery.failed=false
      }
    }
    masteryByQuestion.set(attempt.questionId,mastery)
  })

  // Completed failed-only sessions are authoritative evidence that these
  // questions were reviewed while they were still in the failed pool. Keep
  // this credit even if correct answers remove them from the live pool.
  sessions.forEach(session=>{
    if(!session.settings?.failedEverOnly)return
    const sessionAttempts=attempts.filter(attempt=>attempt.sessionId===session.id)
    sessionAttempts.forEach(attempt=>{
      if(localDayKey(attempt.createdAt)===todayKey)reviewedFailedQuestionIds.add(attempt.questionId)
    })
  })

  const reviewedFailedCount=reviewedFailedQuestionIds.size
  const reviewedFailedToday=reviewedFailedCount>0
  const failedGoalDenominator=Math.max(failedQuestionCount,reviewedFailedCount)
  const minutesDone=Math.round(todayAttempts.reduce((total,attempt)=>total+attempt.elapsedMs,0)/60000)
  const noPracticeToday=isExamDay||dailyQuestions<=0
  const questionTarget=Math.max(1,dailyQuestions)
  const minuteTarget=Math.max(1,dailyMinutes)
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
  // Weekly progress always resets on Monday. Do not carry consecutive
  // practice days over from the previous week.
  const streak=practicedDays
  const goals=[
    {label:'Practice questions',value:`${questionsDone}/${questionTarget}`},
    {label:'Practice time',value:`${minutesDone}/${minuteTarget} min`},
    {label:'Review failed questions',value:failedGoalDenominator?`${reviewedFailedCount}/${failedGoalDenominator}`:'Clear'},
  ]
  const weeklyQuestions=attempts.filter(attempt=>new Date(attempt.createdAt)>=weekStart).length
  const weeklyMinutes=Math.round(attempts.filter(attempt=>new Date(attempt.createdAt)>=weekStart).reduce((total,attempt)=>total+attempt.elapsedMs,0)/60000)
  const daysToWeeklyStreak=Math.max(0,2-practicedDays)

  return <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(auto-fit,minmax(min(100%,260px),1fr))',lg:'repeat(3,minmax(0,1fr))'},gap:1.5,minHeight:0,height:'100%',alignItems:'stretch'}}>
    <DashboardCard tone="white" variant="support" title="Today's goals">
      {noPracticeToday
        ?<AlexBox sx={{display:'grid',gap:.45}}>
          <AlexText sx={{fontSize:dashboardTypography.supportBody,fontWeight:800,color:'#08275B'}}>
            {isExamDay?`${examLabel??'Exam'} day`:'No practice planned'}
          </AlexText>
          <AlexText sx={{fontSize:dashboardTypography.supportSecondary,color:'#667085',lineHeight:1.35}}>
            {isExamDay?'No practice is expected today. This day will not count as missed practice.':'Your current plan does not require practice today.'}
          </AlexText>
        </AlexBox>
        :<AlexBox sx={{display:'grid',gap:{xs:1.05,xl:.55}}}>
          {goals.map((goal,index)=>{const complete=index===0?questionsDone>=questionTarget:index===1?minutesDone>=minuteTarget:reviewedFailedToday;return <AlexBox key={goal.label} sx={{display:'grid',gridTemplateColumns:{xs:'30px minmax(0,1fr)',xl:'24px minmax(0,1fr)'},alignItems:'center',columnGap:{xs:1.15,xl:.75}}}>
            <AlexBox aria-hidden="true" sx={{width:{xs:30,xl:24},height:{xs:30,xl:24},borderRadius:'50%',display:'grid',placeItems:'center',bgcolor:complete?'#E8F7EE':'#EEF2F7',color:complete?'#20935A':'#C7D1DF'}}>
              <Star size={17} fill="currentColor" strokeWidth={1.4}/>
            </AlexBox>
            <AlexText sx={{fontFamily:'inherit',fontSize:dashboardTypography.supportBody,fontWeight:400,lineHeight:1.3,color:'#111',whiteSpace:'nowrap'}}>
              <AlexBox component="span" sx={{textDecoration:'underline',textUnderlineOffset:'2px'}}>{goal.label}</AlexBox>
              <AlexBox component="span" sx={{textDecoration:'none'}}> · {goal.value}</AlexBox>
            </AlexText>
          </AlexBox>})}
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
        {weeklyQuestions} items completed · {weeklyMinutes} minutes learned
      </AlexText>
    </DashboardCard>

    <DashboardCard tone="lavender" variant="support" title="Recommended focus" value={recommendationLabel} sx={{display:{xs:'none',lg:'flex'}}}>
      {recommendationReason&&<AlexText sx={{fontSize:dashboardTypography.supportBody,lineHeight:1.4,fontWeight:400,color:'#475467'}}>{recommendationReason}</AlexText>}
    </DashboardCard>
  </AlexBox>
}

import {useMemo,useState} from 'react'
import {CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexCalendarDay from '../atoms/AlexCalendarDay'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import AlexTooltip from '../atoms/AlexTooltip'
import {buildStudyPlanCalendarDays,type StudyPlanDayStatus} from '../../lib/studyPlanCalendar'
import type {PracticePlanRecommendation} from '../../lib/practicePlan'
import type {Attempt,SessionSummary,Settings} from '../../types'

type Props={
  sessions:SessionSummary[]
  attempts:Attempt[]
  settings:Settings
  recommendation:PracticePlanRecommendation
}

const STATUS_STYLE:Record<StudyPlanDayStatus,{bg:string;border:string;color:string;label:string}>={
  ahead:{bg:'#E5F7DC',border:'#AAD99A',color:'#315F25',label:'Ahead'},
  'on-track':{bg:'#E5F1FF',border:'#A9CEF0',color:'#245F9E',label:'On schedule'},
  behind:{bg:'#FFF0E7',border:'#F0C5AD',color:'#914D2C',label:'Below target'},
  planned:{bg:'#F2E9FF',border:'#DACAF0',color:'#6B4A91',label:'Planned'},
  neutral:{bg:'#FAFAF8',border:'#E8E4DD',color:'#98A2B3',label:'Not tracked'},
}

const WEEKDAYS=['S','M','T','W','T','F','S']

function monthTitle(year:number,month:number){
  return new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(new Date(year,month,1))
}

export default function StudyPlanCalendar({sessions,attempts,settings,recommendation}:Props){
  const today=new Date()
  const todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const [view,setView]=useState(()=>({year:today.getFullYear(),month:today.getMonth()}))
  const days=useMemo(()=>buildStudyPlanCalendarDays({
    year:view.year,
    month:view.month,
    sessions,
    attempts,
    recommendedSessionsPerDay:recommendation.recommendedSessionsPerDay,
    questionsPerSession:recommendation.questionsPerSession,
    today,
    examDate:settings.targetExamDate,
  }),[view.year,view.month,sessions,attempts,recommendation.recommendedSessionsPerDay,recommendation.questionsPerSession,settings.targetExamDate])

  const firstWeekday=new Date(view.year,view.month,1).getDay()
  const targetQuestions=Math.max(0,recommendation.recommendedSessionsPerDay*recommendation.questionsPerSession)
  function moveMonth(delta:number){
    const next=new Date(view.year,view.month+delta,1)
    setView({year:next.getFullYear(),month:next.getMonth()})
  }

  return <AlexSurface
    component="section"
    sx={{
      p:{xs:1.6,sm:1.75,xl:1.25},
      border:'1px solid #E4E7EC',
      bgcolor:'#fff',
      minWidth:0,
      height:{xs:'auto',lg:'100%'},
      minHeight:{xs:420,lg:0},
      display:'flex',
      flexDirection:'column',
    }}
  >
    <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1.25,mb:{xs:1.15,xl:.65}}}>
      <AlexBox sx={{display:'flex',alignItems:'center',gap:.75,minWidth:0}}>
        <CalendarDays size={16} color="#6558F5"/>
        <AlexText sx={{fontSize:10.2,fontWeight:800,lineHeight:1.2,textTransform:'uppercase',letterSpacing:'.075em',color:'#5B6575'}}>Practice calendar</AlexText>
      </AlexBox>
      <AlexText sx={{fontSize:10.5,fontWeight:800,color:'#667085',whiteSpace:'nowrap'}}>
        {targetQuestions>0?`${targetQuestions} questions/day`:'Flexible pace'}
      </AlexText>
    </AlexBox>

    <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',mb:{xs:1,xl:.55}}}>
      <AlexIconButton label="Previous month" onClick={()=>moveMonth(-1)}><ChevronLeft size={16}/></AlexIconButton>
      <AlexText sx={{fontSize:11.5,fontWeight:900,letterSpacing:'.045em',color:'#08275B',textTransform:'uppercase'}}>
        {monthTitle(view.year,view.month)}
      </AlexText>
      <AlexIconButton label="Next month" onClick={()=>moveMonth(1)}><ChevronRight size={16}/></AlexIconButton>
    </AlexBox>

    <AlexBox sx={{
      display:'grid',
      gridTemplateColumns:'repeat(7,minmax(0,1fr))',
      columnGap:.2,
      width:'92%',
      mx:'auto',
      mb:{xs:.7,xl:.35},
    }}>
      {WEEKDAYS.map((day,index)=><AlexText key={`${day}-${index}`} sx={{textAlign:'center',fontSize:9,fontWeight:850,color:'#667085'}}>{day}</AlexText>)}
    </AlexBox>

    <AlexBox sx={{
      display:'grid',
      gridTemplateColumns:'repeat(7,minmax(0,1fr))',
      gridAutoRows:{xs:'44px',sm:'46px',lg:'minmax(0,1fr)'},
      columnGap:.2,
      rowGap:{xs:.35,xl:.2},
      width:'92%',
      mx:'auto',
      flex:{xs:'0 0 auto',lg:'1 1 0'},
      minHeight:0,
      alignItems:'center',
      alignContent:'stretch',
      overflow:{xs:'visible',lg:'hidden'},
    }}>
      {Array.from({length:firstWeekday},(_,index)=><AlexBox key={`empty-${index}`} aria-hidden="true"/>)}
      {days.map(day=>{
        const style=STATUS_STYLE[day.status]
        const isToday=day.date===todayKey
        const isExamDate=Boolean(settings.targetExamDate&&day.date===settings.targetExamDate)
        const hasTrackedGoal=targetQuestions>0&&(day.status==='ahead'||day.status==='on-track'||day.status==='behind')
        const title=[
          style.label,
          isExamDate?'Exam date':'',
          day.practiced
            ?`${day.questionCount}${day.targetQuestionCount>0?` of ${day.targetQuestionCount}`:''} questions`
            :hasTrackedGoal?'No practice recorded':'',
        ].filter(Boolean).join(' · ')
        return <AlexTooltip
          key={day.date}
          title={title}
          arrow
          placement="top"
          enterDelay={100}
          enterNextDelay={50}
          leaveDelay={80}
          describeChild
          slotProps={{popper:{sx:{zIndex:1600}}}}
        >
          <AlexCalendarDay
            day={day.day}
            variant={isExamDate?'star':'circle'}
            backgroundColor={style.bg}
            borderColor={style.border}
            textColor={day.status==='neutral'?'#7A8495':'#08275B'}
            isToday={isToday}
            marker={day.practiced?'check':undefined}
            tabIndex={0}
            title={title}
            aria-label={`${day.date}: ${title}`}
          />
        </AlexTooltip>
      })}
    </AlexBox>

  </AlexSurface>
}

import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import SectionPanel from '../molecules/SectionPanel'
import type {PracticePlanRecommendation} from '../../lib/practicePlan'

type Props={recommendation:PracticePlanRecommendation;compact?:boolean}

function RecommendationBody({recommendation,compact}:{recommendation:PracticePlanRecommendation;compact:boolean}){
  const scoreGoalMet=recommendation.targetScore===null||(recommendation.estimatedScore!==null&&recommendation.scoreGap!==null&&recommendation.scoreGap<=0)
  const complete=recommendation.remainingQuestions===0&&scoreGoalMet
  const dailyMinutes=complete?0:recommendation.estimatedDailyMinutes
  const sessionLabel=recommendation.recommendedSessionsPerDay===1?'1 session':`${recommendation.recommendedSessionsPerDay} sessions`

  return <>
    <AlexBox sx={{display:'flex',alignItems:'baseline',gap:1.1,flexWrap:'wrap'}}>
      <AlexText sx={{fontSize:compact?28:38,fontWeight:900,lineHeight:1,color:'#08275B'}}>
        {complete?'On track':`${dailyMinutes} min/day`}
      </AlexText>
      {!complete&&<AlexText sx={{fontSize:13.5,color:'#667085'}}>
        {sessionLabel} · {recommendation.questionsPerSession} questions/session
      </AlexText>}
    </AlexBox>

    {!complete&&recommendation.planPhase==='final-review'&&
      <AlexText sx={{mt:1.15,fontSize:13.5,lineHeight:1.5,color:'#344054',fontWeight:650}}>
        {recommendation.practiceGuidance}
      </AlexText>}

    {!complete&&recommendation.focusLabel&&recommendation.focusSharePercent&&
      <AlexText sx={{mt:1.25,fontSize:13.5,lineHeight:1.5,color:'#344054'}}>
        Focus about {recommendation.focusSharePercent}% of targeted work on <b>{recommendation.focusLabel}</b>, and use the rest for mixed practice.
      </AlexText>}

    {!compact&&
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(3,minmax(0,1fr))'},gap:1.25,mt:2.25}}>
        <AlexSurface sx={{p:1.5,border:'1px solid #E4E7EC',borderRadius:2,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:11,fontWeight:800,color:'#667085',textTransform:'uppercase',letterSpacing:'.05em'}}>Practice estimate</AlexText>
          <AlexText sx={{fontSize:18,fontWeight:850,color:'#08275B',mt:.3}}>{recommendation.estimatedScore??'Need baseline'}</AlexText>
        </AlexSurface>
        <AlexSurface sx={{p:1.5,border:'1px solid #E4E7EC',borderRadius:2,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:11,fontWeight:800,color:'#667085',textTransform:'uppercase',letterSpacing:'.05em'}}>Target</AlexText>
          <AlexText sx={{fontSize:18,fontWeight:850,color:'#08275B',mt:.3}}>{recommendation.targetScore??'Not set'}</AlexText>
        </AlexSurface>
        <AlexSurface sx={{p:1.5,border:'1px solid #E4E7EC',borderRadius:2,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:11,fontWeight:800,color:'#667085',textTransform:'uppercase',letterSpacing:'.05em'}}>Days left</AlexText>
          <AlexText sx={{fontSize:18,fontWeight:850,color:'#08275B',mt:.3}}>{recommendation.daysRemaining}</AlexText>
        </AlexSurface>
      </AlexBox>}

    {!compact&&recommendation.estimatedScore===null&&recommendation.targetScore!==null&&
      <AlexText sx={{mt:1.5,fontSize:12.75,lineHeight:1.5,color:'#667085'}}>
        Complete practice in both sections to establish a score estimate and refine this recommendation.
      </AlexText>}
    {!compact&&scoreGoalMet&&recommendation.estimatedScore!==null&&
      <AlexText sx={{mt:1.5,fontSize:12.75,lineHeight:1.5,color:'#667085'}}>
        Keep sessions mixed and review missed questions to maintain consistency.
      </AlexText>}
  </>
}

export default function StudyPlanRecommendation({recommendation,compact=false}:Props){
  if(compact)return <RecommendationBody recommendation={recommendation} compact/>

  return <SectionPanel
    eyebrow={recommendation.planPhase==='final-review'?'Final review':'Daily plan'}
    title={recommendation.planPhase==='final-review'?'Review, don’t cram':'Recommended daily practice'}
    description={recommendation.planPhase==='final-review'
      ?'Keep the normal duration and use it for weak-concept retrieval and error review.'
      :'Based on a steady configured practice plan, with performance data used to choose what to practice rather than to inflate daily workload.'}
    tone="accent"
  >
    <RecommendationBody recommendation={recommendation} compact={false}/>
  </SectionPanel>
}

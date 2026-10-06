import {BarChart3,Clock3,Target,TrendingUp} from 'lucide-react'
import {useEffect,useState} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBarChart from '../atoms/AlexBarChart'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexLineChart from '../atoms/AlexLineChart'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexTextField from '../atoms/AlexTextField'
import AlexProgressThumbIcon from '../atoms/AlexProgressThumbIcon'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import MetricCard from '../molecules/MetricCard'
import SectionPanel from '../molecules/SectionPanel'
import DashboardCard from '../molecules/DashboardCard'
import PerformanceChartCard from '../molecules/PerformanceChartCard'
import QuestionStatsTable from '../molecules/QuestionStatsTable'
import type {PerformanceAnalytics} from '../../lib/performanceAnalytics'

export type PerformanceTimeRange='7d'|'14d'|'21d'|'30d'|'90d'|'all'|'custom'

type SessionReviewSummary={
  id:string
  endedAt:string
  correct:number
  total:number
  accuracy:number
}

type Props={
  summary:PerformanceAnalytics
  hasHistory:boolean
  compact?:boolean
  compactRecommendationExtra?:React.ReactNode
  questionsPdf?:ArrayBuffer|null
  answersPdf?:ArrayBuffer|null
  timeRange?:PerformanceTimeRange
  customStartDate?:string
  customEndDate?:string
  onTimeRangeChange?:(value:PerformanceTimeRange)=>void
  onCustomStartDateChange?:(value:string)=>void
  onCustomEndDateChange?:(value:string)=>void
  sessionHistory?:SessionReviewSummary[]
  onReviewSession?:(sessionId:string)=>void
}

const chartTheme={
  text:{fontSize:12,fill:'#475467'},
  axis:{ticks:{text:{fontSize:11,fill:'#667085'}},legend:{text:{fontSize:12,fill:'#475467'}}},
  grid:{line:{stroke:'#ECE8E1',strokeWidth:1}},
  tooltip:{container:{fontSize:12,borderRadius:8,boxShadow:'0 8px 30px rgba(16,24,40,.14)'}},
}

export default function PerformanceDashboard({
  summary,hasHistory,compact=false,compactRecommendationExtra=null,questionsPdf=null,answersPdf=null,
  timeRange='30d',customStartDate='',customEndDate='',onTimeRangeChange,onCustomStartDateChange,onCustomEndDateChange,
  sessionHistory=[],onReviewSession,
}:Props){
  const[selectedReviewSession,setSelectedReviewSession]=useState(sessionHistory[0]?.id??'')
  useEffect(()=>{
    if(!sessionHistory.length){
      setSelectedReviewSession('')
      return
    }
    if(!sessionHistory.some(session=>session.id===selectedReviewSession))setSelectedReviewSession(sessionHistory[0].id)
  },[sessionHistory,selectedReviewSession])
  const reviewSessionOptions=sessionHistory.map(session=>({
    value:session.id,
    label:`${new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(session.endedAt))} · ${session.accuracy}% · ${session.correct}/${session.total}`,
  }))
  const rangeLabel=timeRange==='7d'?'Last week'
    :timeRange==='14d'?'Last 2 weeks'
    :timeRange==='21d'?'Last 3 weeks'
    :timeRange==='30d'?'Last month'
    :timeRange==='90d'?'Last 3 months'
    :timeRange==='all'?'All time'
    :'Custom range'
  const answeredInRange=summary.sessionMetrics.reduce((sum,session)=>sum+session.attempts,0)

  const sectionAccuracy=summary.sections.filter(section=>section.attempts>0).map(section=>({section:section.label,success:section.successRate}))
  const sectionTime=summary.sections.filter(section=>section.attempts>0).map(section=>({section:section.label,seconds:Math.round(section.averageMs/1000)}))
  const questionStats=summary.questions.slice(0,18)
  const questionAccuracy=questionStats.map(question=>({question:`${question.subject==='math'?'Math':'R&W'} Q${question.questionNumber}`,success:question.successRate}))
  const questionTime=questionStats.map(question=>({question:`${question.subject==='math'?'Math':'R&W'} Q${question.questionNumber}`,seconds:Math.round(question.averageMs/1000)}))
  const dailySessionMetrics=new Map<string,{date:Date;attempts:number;correct:number}>()
  summary.sessionMetrics.forEach(session=>{
    const date=new Date(session.startedAt)
    const key=localDayKey(date)
    const current=dailySessionMetrics.get(key)??{date,attempts:0,correct:0}
    current.attempts+=session.attempts
    current.correct+=session.correct
    dailySessionMetrics.set(key,current)
  })
  const dailyAccuracy=[...dailySessionMetrics.values()]
    .sort((a,b)=>a.date.getTime()-b.date.getTime())
    .map(day=>({x:formatChartDay(day.date),y:day.attempts?Math.round(100*day.correct/day.attempts):0}))
  const sessionAccuracy=[{id:'Accuracy',data:dailyAccuracy}]
  const accuracyTickValues=sampleTickValues(dailyAccuracy.map(point=>point.x))

  const dailyScorePoints=new Map<string,(typeof summary.scoreTrend)[number]>()
  summary.scoreTrend.forEach(point=>{
    const key=localDayKey(new Date(point.startedAt))
    dailyScorePoints.set(key,point)
  })
  const dailyScoreTrend=[...dailyScorePoints.values()]
    .sort((a,b)=>new Date(a.startedAt).getTime()-new Date(b.startedAt).getTime())
  const calibratingScoreTrend=dailyScoreTrend
    .filter(point=>point.sessionNumber<=10)
    .map(point=>({x:formatChartDay(new Date(point.startedAt)),y:point.score}))
  const calibratedScoreTrend=dailyScoreTrend
    .filter(point=>point.sessionNumber>=10)
    .map(point=>({x:formatChartDay(new Date(point.startedAt)),y:point.score}))
  const scoreTrend=[
    {id:'Calibrating',data:calibratingScoreTrend},
    {id:'10-session prediction',data:calibratedScoreTrend},
  ].filter(series=>series.data.length)
  const scoreTickValues=sampleTickValues(dailyScoreTrend.map(point=>formatChartDay(new Date(point.startedAt))))
  const latestDelta=summary.scoreTrend.length?summary.scoreTrend[summary.scoreTrend.length-1].delta:0
  const weeklyScoreValue=summary.weeklyScoreChange===null?'—':summary.weeklyScoreChange===0?'0':`${summary.weeklyScoreChange>0?'+':''}${summary.weeklyScoreChange}`
  const weeklyScoreColor=summary.weeklyScoreChange===null||summary.weeklyScoreChange===0
    ?'#667085'
    :summary.weeklyScoreChange>0?'#027A48':'#B42318'
  const progressDelta=summary.weeklyScoreChange??latestDelta
  const progressDirection=progressDelta<0?'down' as const:'up' as const
  const progressWord=!hasHistory?'Building':progressDelta>0?'Improving':progressDelta<0?'Keep going':'Steady'
  const progressColor=progressDirection==='up'?'#027A48':'#B42318'
  const progressTone=progressDirection==='up'?'green' as const:'peach' as const
  const scoreBasis=summary.scorePredictionBasis
  const scoreBasisText=scoreBasis
    ?`Based on ${scoreBasis.sessionCount} recent completed session${scoreBasis.sessionCount===1?'':'s'} · ${scoreBasis.questionCount} unique questions · ${scoreBasis.averageQuestionSuccessRate}% average question success. ${scoreBasis.sections.map(section=>`${section.label}: ${section.successRate}% across ${section.questions} question${section.questions===1?'':'s'}`).join(' · ')}.`
    :''
  const isScoreCalibrating=Boolean(scoreBasis&&scoreBasis.sessionCount<10)
  const scoreCalibrationText=scoreBasis
    ?isScoreCalibrating
      ?`Calibrating · ${scoreBasis.sessionCount}/10 completed sessions`
      :'Calibrated · rolling 10-session question pool'
    :''

  if(compact)return <AlexBox sx={{
    display:'grid',
    gridTemplateRows:{xs:'auto auto',xl:'minmax(0,73%) minmax(0,27%)'},
    gap:{xs:1.5,sm:2.5,xl:1.25},
    minWidth:0,
    height:'100%',

  }}>
    <AlexBox sx={{
      display:'grid',
      gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',md:'repeat(3,minmax(0,1fr))',lg:'repeat(5,minmax(0,1fr))'},
      gap:1,
      minHeight:0,
    }}>
      <MetricCard compact tone="blue" icon={<Target/>} label="Accuracy" value={hasHistory?`${summary.accuracy}%`:'—'}/>
      <MetricCard compact tone="cream" icon={<Clock3/>} label="Avg. time" value={hasHistory?formatMs(summary.averageMs):'—'}/>
      <MetricCard compact tone="green" icon={<BarChart3/>} label="Questions seen" value={`${summary.questionsSeen}/${summary.totalQuestions}`}/>
      <MetricCard compact tone="peach" icon={<TrendingUp/>} label="7-day score trend" value={weeklyScoreValue} valueColor={weeklyScoreColor}/>
      <MetricCard
        compact
        tone={progressTone}
        icon={<AlexProgressThumbIcon direction={progressDirection}/>}
        label="Overall progress"
        value={progressWord}
        valueColor={progressColor}
        valueFontSize={22}
      />
      {summary.recommendation&&<DashboardCard
        tone="lavender"
        variant="support"
        title="Recommended focus"
        value={summary.recommendation.label}
        sx={{display:{xs:'flex',lg:'none'},minHeight:{xs:160,sm:0}}}
      >
        <AlexText sx={{fontSize:{xs:11.5,sm:12},lineHeight:1.35,color:'#475467'}}>
          {summary.recommendation.reason}
        </AlexText>
      </DashboardCard>}
    </AlexBox>
    {compactRecommendationExtra&&<AlexBox sx={{minHeight:0}}>{compactRecommendationExtra}</AlexBox>}
  </AlexBox>

  return <AlexBox>
    {!compact&&<AlexBox>
      <AlexText sx={{fontSize:12,textTransform:'uppercase',letterSpacing:'.12em',fontWeight:800,color:'#6558F5'}}>Performance</AlexText>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:32,md:46},lineHeight:1.08,my:1,color:'#08275B'}}>Your practice trends</AlexText>
      <AlexText sx={{color:'#667085',maxWidth:720}}>See your current performance first, then expand deeper breakdowns only when you need them.</AlexText>
    </AlexBox>}

    {!compact&&<AlexBox sx={{mt:2.5}}><SectionPanel
      eyebrow="Selected period"
      title={`Performance in ${rangeLabel}`}
      description="Essential stats for the selected time range. Score prediction remains based on the rolling scoring model."
      action={onTimeRangeChange?<AlexBox sx={{width:{xs:'100%',sm:260},display:'grid',gap:1}}>
        <AlexDropdown
          id="performance-time-range"
          label="Time frame"
          value={timeRange}
          options={[
            {value:'7d',label:'Last week'},
            {value:'14d',label:'Last 2 weeks'},
            {value:'21d',label:'Last 3 weeks'},
            {value:'30d',label:'Last month'},
            {value:'90d',label:'Last 3 months'},
            {value:'all',label:'All time'},
            {value:'custom',label:'Custom dates'},
          ]}
          onChange={onTimeRangeChange}
        />
        {timeRange==='custom'&&<AlexBox sx={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1}}>
          <AlexTextField
            label="From"
            type="date"
            value={customStartDate}
            onChange={event=>onCustomStartDateChange?.(event.target.value)}
            slotProps={{inputLabel:{shrink:true}}}
          />
          <AlexTextField
            label="To"
            type="date"
            value={customEndDate}
            onChange={event=>onCustomEndDateChange?.(event.target.value)}
            slotProps={{inputLabel:{shrink:true}}}
          />
        </AlexBox>}
      </AlexBox>:undefined}
    >
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',lg:'repeat(4,minmax(0,1fr))'},gap:{xs:1,sm:1.25}}}>
        {[
          {label:'Accuracy',value:hasHistory?`${summary.accuracy}%`:'—'},
          {label:'Sessions',value:String(summary.sessions)},
          {label:'Avg. time',value:hasHistory?formatMs(summary.averageMs):'—'},
          {label:'Questions answered',value:String(answeredInRange)},
        ].map(item=><AlexBox key={item.label} sx={{p:{xs:1.5,sm:1.75},border:'1px solid #EAECF0',borderRadius:2,bgcolor:'#FAFBFC',minWidth:0}}>
          <AlexText sx={{fontSize:12,color:'#667085',fontWeight:750}}>{item.label}</AlexText>
          <AlexText sx={{mt:.35,fontSize:{xs:22,sm:26},lineHeight:1.1,fontWeight:850,color:'#08275B'}}>{item.value}</AlexText>
        </AlexBox>)}
      </AlexBox>
      {hasHistory&&summary.recommendation&&<AlexBox sx={{mt:1.5,p:{xs:1.5,sm:1.75},borderRadius:2,bgcolor:'#F7F5FF',border:'1px solid #E5E0FF',display:'grid',gridTemplateColumns:{xs:'1fr',sm:'auto minmax(0,1fr)'},gap:{xs:.4,sm:1.25},alignItems:'baseline'}}>
        <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#6558F5'}}>Focus</AlexText>
        <AlexBox sx={{minWidth:0}}>
          <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>{summary.recommendation.label}</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.25,lineHeight:1.45}}>{summary.recommendation.reason}</AlexText>
        </AlexBox>
      </AlexBox>}
    </SectionPanel></AlexBox>}

    {!hasHistory&&!compact&&<AlexSurface sx={{p:3.5,mt:2.5,border:'1px solid #E6E2DB'}}>
      <AlexText component="h2" sx={{fontSize:22,fontWeight:750,mb:1}}>No sessions in this range</AlexText>
      <AlexText sx={{color:'#667085'}}>Choose a wider time frame or complete another practice session.</AlexText>
    </AlexSurface>}

    {hasHistory&&!compact&&<>
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',xl:'1fr 1fr'},gap:2,mt:2.5}}>
        <PerformanceChartCard title="Daily success trend" description="Accuracy across practice days in the selected time range.">
          <AlexLineChart
            data={sessionAccuracy}
            margin={{top:20,right:25,bottom:52,left:54}}
            xScale={{type:'point'}}
            yScale={{type:'linear',min:0,max:100,stacked:false,reverse:false}}
            curve="monotoneX"
            colors={['#6558F5']}
            lineWidth={3}
            pointSize={8}
            pointBorderWidth={2}
            useMesh
            enableArea
            areaOpacity={0.08}
            axisBottom={{legend:'Day',legendPosition:'middle',legendOffset:40,tickValues:accuracyTickValues}}
            axisLeft={{legend:'Accuracy %',legendPosition:'middle',legendOffset:-44}}
            theme={chartTheme}
            ariaLabel="Accuracy trend by practice day"
          />
        </PerformanceChartCard>
        <PerformanceChartCard title="Practice score prediction" description={summary.latestScoreEstimate?`${scoreCalibrationText} · latest ${summary.latestScoreEstimate}${latestDelta===0?'':` · ${latestDelta>0?'+':''}${latestDelta} from prior scored session`}.`:'More cross-section history is needed before a score prediction is available.'}>
          {scoreTrend.length&&scoreTrend.some(series=>series.data.length)?<AlexLineChart
            data={scoreTrend}
            margin={{top:20,right:25,bottom:52,left:58}}
            xScale={{type:'point'}}
            yScale={{type:'linear',min:400,max:1600,stacked:false,reverse:false}}
            curve="linear"
            colors={['#F79009','#F79009']}
            lineWidth={3}
            pointSize={8}
            pointBorderWidth={2}
            useMesh
            layers={['grid','markers','axes','areas',PredictionPhaseLines,'points','slices','mesh','legends']}
            axisBottom={{legend:'Day',legendPosition:'middle',legendOffset:40,tickValues:scoreTickValues}}
            axisLeft={{legend:'Predicted score',legendPosition:'middle',legendOffset:-48}}
            theme={chartTheme}
            ariaLabel="Practice SAT score prediction trend"
          />:<EmptyChart message="Not enough cross-section history yet."/>}
        </PerformanceChartCard>
      </AlexBox>

      {scoreBasis&&<AlexAccordion
        sx={{mt:1.5}}
        summary={<AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:850,color:'#08275B'}}>Score prediction details</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>How the rolling practice estimate is calculated</AlexText>
        </AlexBox>}
      >
        <AlexText sx={{fontSize:13,color:'#667085',lineHeight:1.6}}>
          {scoreBasisText} Sessions 1–9 are provisional; session 10 starts the full rolling 10-session question-pool prediction. Each unique question is weighted equally by its success rate within that window. This is a practice trend, not an official College Board score.
        </AlexText>
      </AlexAccordion>}

      <AlexAccordion
        sx={{mt:1.5}}
        summary={<AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:850,color:'#08275B'}}>Section breakdown</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>Accuracy and response time by section</AlexText>
        </AlexBox>}
      >
        <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',xl:'1fr 1fr'},gap:2}}>
          <PerformanceChartCard title="Success by section" description="Correct answers as a percentage of all attempts in each section.">
            <AlexBarChart
              data={sectionAccuracy}
              keys={['success']}
              indexBy="section"
              margin={{top:10,right:20,bottom:52,left:54}}
              padding={0.36}
              valueScale={{type:'linear',min:0,max:100}}
              colors={['#6558F5']}
              borderRadius={5}
              enableGridY
              enableLabel
              label={value=>`${value.value}%`}
              axisBottom={{legend:'Section',legendPosition:'middle',legendOffset:42}}
              axisLeft={{legend:'Success %',legendPosition:'middle',legendOffset:-44}}
              theme={chartTheme}
              role="img"
              ariaLabel="Success rate by SAT section"
            />
          </PerformanceChartCard>
          <PerformanceChartCard title="Average time by section" description="Average response time across all attempts.">
            <AlexBarChart
              data={sectionTime}
              keys={['seconds']}
              indexBy="section"
              margin={{top:10,right:20,bottom:52,left:58}}
              padding={0.36}
              colors={['#12B76A']}
              borderRadius={5}
              enableLabel
              label={value=>`${value.value}s`}
              axisBottom={{legend:'Section',legendPosition:'middle',legendOffset:42}}
              axisLeft={{legend:'Seconds',legendPosition:'middle',legendOffset:-46}}
              theme={chartTheme}
              role="img"
              ariaLabel="Average response time by SAT section"
            />
          </PerformanceChartCard>
        </AlexBox>
      </AlexAccordion>

      <AlexAccordion
        sx={{mt:1.5}}
        summary={<AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:850,color:'#08275B'}}>Question details</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>Weakest questions, time per question, and detailed history</AlexText>
        </AlexBox>}
      >
        <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',xl:'1fr 1fr'},gap:2}}>
          <PerformanceChartCard title="Question success" description="Weakest attempted questions first. Repeat attempts are included in each success rate." minHeight={Math.max(340,questionAccuracy.length*30)}>
            <AlexBarChart
              data={questionAccuracy}
              keys={['success']}
              indexBy="question"
              layout="horizontal"
              margin={{top:10,right:34,bottom:48,left:92}}
              padding={0.28}
              valueScale={{type:'linear',min:0,max:100}}
              colors={['#6558F5']}
              borderRadius={4}
              enableLabel
              label={value=>`${value.value}%`}
              axisBottom={{legend:'Success %',legendPosition:'middle',legendOffset:38}}
              axisLeft={{tickSize:0,tickPadding:8}}
              theme={chartTheme}
              role="img"
              ariaLabel="Success rate by question"
            />
          </PerformanceChartCard>
          <PerformanceChartCard title="Time by question" description="Average time spent on the same attempted questions." minHeight={Math.max(340,questionTime.length*30)}>
            <AlexBarChart
              data={questionTime}
              keys={['seconds']}
              indexBy="question"
              layout="horizontal"
              margin={{top:10,right:34,bottom:48,left:92}}
              padding={0.28}
              colors={['#12B76A']}
              borderRadius={4}
              enableLabel
              label={value=>`${value.value}s`}
              axisBottom={{legend:'Average seconds',legendPosition:'middle',legendOffset:38}}
              axisLeft={{tickSize:0,tickPadding:8}}
              theme={chartTheme}
              role="img"
              ariaLabel="Average response time by question"
            />
          </PerformanceChartCard>
        </AlexBox>
        <AlexBox sx={{mt:2}}><QuestionStatsTable questions={summary.questions} questionsPdf={questionsPdf} answersPdf={answersPdf}/></AlexBox>
      </AlexAccordion>

      {sessionHistory.length>0&&<AlexAccordion
        sx={{mt:1.5}}
        summary={<AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:850,color:'#08275B'}}>Session review</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>Open any completed session in read-only review</AlexText>
        </AlexBox>}
      >
        <AlexBox sx={{pt:1.75,borderTop:'1px solid #EAECF0'}}>
          <AlexBox
            sx={{
              display:'grid',
              gridTemplateColumns:{xs:'1fr',sm:'minmax(0,360px) 110px'},
              gap:{xs:1.25,sm:1.5},
              alignItems:'center',
              justifyContent:'end',
              minWidth:0,
            }}
          >
            <AlexDropdown
              id="performance-session-review"
              label="Completed session"
              value={selectedReviewSession}
              options={reviewSessionOptions}
              onChange={setSelectedReviewSession}
            />
            <AlexButton
              tone="secondary"
              disabled={!selectedReviewSession}
              onClick={()=>selectedReviewSession&&onReviewSession?.(selectedReviewSession)}
              sx={{width:'100%'}}
            >
              Review
            </AlexButton>
          </AlexBox>
        </AlexBox>
      </AlexAccordion>}
    </>}
  </AlexBox>
}

function PredictionPhaseLines({series}:{series:readonly any[]}){
  return <g aria-hidden="true">
    {series.map(serie=>{
      const points=serie.data
        .map((point:any)=>point.position)
        .filter((point:any)=>Number.isFinite(point?.x)&&Number.isFinite(point?.y))
      if(points.length<2)return null
      const d=points.map((point:any,index:number)=>`${index===0?'M':'L'}${point.x},${point.y}`).join(' ')
      return <path
        key={String(serie.id)}
        d={d}
        fill="none"
        stroke={serie.color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={String(serie.id)==='Calibrating'?'3 7':undefined}
      />
    })}
  </g>
}

function EmptyChart({message}:{message:string}){
  return <AlexBox sx={{height:'100%',display:'grid',placeItems:'center',textAlign:'center',px:3}}><AlexText sx={{color:'#667085'}}>{message}</AlexText></AlexBox>
}

function formatMs(ms:number){
  const seconds=Math.round(ms/1000)
  return seconds<60?`${seconds}s`:`${Math.floor(seconds/60)}m ${seconds%60}s`
}

function localDayKey(date:Date){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

function formatChartDay(date:Date){
  return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(date)
}

function sampleTickValues(values:string[],maxTicks=10){
  const unique=[...new Set(values)]
  if(unique.length<=maxTicks)return unique
  const step=Math.ceil(unique.length/maxTicks)
  const sampled=unique.filter((_value,index)=>index%step===0)
  const last=unique[unique.length-1]
  if(sampled[sampled.length-1]!==last)sampled.push(last)
  return sampled
}

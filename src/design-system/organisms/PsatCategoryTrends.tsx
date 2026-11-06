import {useMemo,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexLineChart from '../atoms/AlexLineChart'
import AlexText from '../atoms/AlexText'
import AlexAccordion from '../atoms/AlexAccordion'
import {buildRecentCategoryTrend} from '../../lib/psatCategoryTrends'
import {PSAT_DOMAINS} from '../../lib/psatDomains'
import type {Attempt,PracticeQuestion,Subject} from '../../types'

type Props={
  questions:PracticeQuestion[]
  attempts:Attempt[]
  sessions:Array<{id:string;endedAt:string}>
}
const colors=['#3159AC','#21A59B','#B88C36','#8664B0']

export default function PsatCategoryTrends({questions,attempts,sessions}:Props){
  const [subject,setSubject]=useState<Subject>('english')
  const trend=useMemo(()=>buildRecentCategoryTrend(attempts,sessions,questions),[attempts,sessions,questions])
  const recent=trend.slice(-30)
  const current=trend.at(-1)
  const domains=PSAT_DOMAINS.filter(domain=>domain.subject===subject)
  const series=domains.map(domain=>({
    id:domain.label,
    data:recent.flatMap(point=>{
      const detail=point.domains.find(item=>item.domain===domain.id)
      return detail?.accuracy===null||detail?.accuracy===undefined?[]:[{x:point.date,y:detail.accuracy}]
    }),
  })).filter(line=>line.data.length)
  const dates=recent.map(point=>point.date)
  const tickValues=dates.filter((_,index)=>index===0||index===dates.length-1||index%Math.max(1,Math.ceil(dates.length/6))===0)
  return <AlexAccordion
    defaultExpanded={false}
    summary={<AlexBox sx={{minWidth:0,pr:1}}>
      <AlexText component="h2" sx={{fontSize:15,fontWeight:600,color:'#1D2939'}}>Category performance over time</AlexText>
      <AlexText sx={{fontSize:12,color:'#667085',mt:.2}}>Latest 120 distinct questions · 60 per section</AlexText>
    </AlexBox>}
  >
    <AlexBox sx={{display:'flex',justifyContent:'flex-end',mb:2}}>
      <AlexBox sx={{width:{xs:'100%',sm:235}}}>
        <AlexDropdown id="category-trend-subject" label="Section" value={subject} onChange={setSubject} options={[
          {value:'english',label:'Reading & Writing'},
          {value:'math',label:'Math'},
        ]}/>
      </AlexBox>
    </AlexBox>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1,mb:1.5}}>
      {domains.map((domain,index)=>{
        const currentValue=current?.domains.find(item=>item.domain===domain.id)
        return <AlexBox key={domain.id} sx={{border:'1px solid #EAECF0',borderRadius:2,p:1.4,minWidth:0}}>
          <AlexBox sx={{display:'flex',gap:.6,alignItems:'start'}}>
            <AlexBox sx={{width:8,height:8,bgcolor:colors[index],borderRadius:10,flexShrink:0,mt:.45}}/>
            <AlexText sx={{fontSize:12,fontWeight:600,color:'#475467',lineHeight:1.35}}>{domain.label}</AlexText>
          </AlexBox>
          <AlexText sx={{fontSize:23,fontWeight:600,color:'#1D2939',mt:.65}}>{currentValue?.accuracy===null||currentValue?.accuracy===undefined?'—':`${currentValue.accuracy}%`}</AlexText>
          <AlexText sx={{fontSize:11.5,color:'#667085'}}>{currentValue?.questions??0} distinct questions</AlexText>
        </AlexBox>
      })}
    </AlexBox>
    {series.length?<AlexBox sx={{height:{xs:270,md:325},minWidth:0}}>
      <AlexLineChart
        data={series}
        margin={{top:20,right:22,bottom:58,left:55}}
        xScale={{type:'point'}}
        yScale={{type:'linear',min:0,max:100,stacked:false,reverse:false}}
        curve="monotoneX"
        colors={colors}
        lineWidth={2}
        pointSize={5}
        pointBorderWidth={1}
        useMesh
        axisBottom={{tickValues,legend:'Practice date',legendPosition:'middle',legendOffset:45,format:value=>String(value).slice(5)}}
        axisLeft={{legend:'Weighted accuracy %',legendPosition:'middle',legendOffset:-45}}
        theme={{text:{fontSize:11,fill:'#667085'},axis:{ticks:{text:{fontSize:10,fill:'#667085'}}},grid:{line:{stroke:'#EEF1F5',strokeWidth:1}}}}
        ariaLabel={`${subject==='english'?'Reading and Writing':'Math'} SAT content-area accuracy across recent practice dates`}
      />
    </AlexBox>:<AlexBox sx={{py:5,textAlign:'center'}}>
      <AlexText sx={{fontSize:13,color:'#667085'}}>No categorized practice attempts yet for this section.</AlexText>
    </AlexBox>}
    <AlexText sx={{fontSize:11.5,color:'#667085',mt:1}}>Daily snapshots use the same distinct-question window and recency weighting as the practice score estimate. This is practice accuracy, not an official PSAT content-area score.</AlexText>
  </AlexAccordion>
}

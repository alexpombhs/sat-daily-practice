import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'
import SectionPanel from '../molecules/SectionPanel'
import {buildQuestionMastery} from '../../lib/questionMastery'
import {practiceTestLabel} from '../../lib/questionBank'
import type {Attempt,PracticeQuestion} from '../../types'

type Status='new'|'successful'|'failed'|'reviewed'
const COLORS:Record<Status,string>={
  new:'#DDE3EB',
  successful:'#21965B',
  failed:'#D84A54',
  reviewed:'#F0A44A',
}
const LABELS:Record<Status,string>={
  new:'New',
  successful:'Successful',
  failed:'Failed',
  reviewed:'Reviewed',
}
const order:Status[]=['successful','reviewed','failed','new']

export type CoverageGroup={id:string;label:string;total:number;counts:Record<Status,number>}

export function buildCoverageGroups(questions:PracticeQuestion[],attempts:Attempt[],recoveryCorrectAnswers=2):CoverageGroup[]{
  const mastery=buildQuestionMastery(attempts,recoveryCorrectAnswers)
  const sets=[...new Set(questions.map(question=>question.practiceTestId))].sort((a,b)=>Number(a.split('-').pop())-Number(b.split('-').pop()))
  const group=(id:string,label:string,items:PracticeQuestion[]):CoverageGroup=>{
    const counts:Record<Status,number>={new:0,successful:0,failed:0,reviewed:0}
    items.forEach(question=>{
      const state=mastery.get(question.id)
      if(!state?.attempted)counts.new++
      else if(state.failed){
        if(state.correctAfterFailure>0)counts.reviewed++
        else counts.failed++
      }else counts.successful++
    })
    return{id,label,total:items.length,counts}
  }
  return[
    group('all','All practice tests',questions),
    ...sets.map(id=>group(id,practiceTestLabel(id),questions.filter(question=>question.practiceTestId===id))),
  ]
}

function CoverageDonut({group,large=false}:{group:CoverageGroup;large?:boolean}){
  const total=Math.max(1,group.total)
  let progress=0
  const stops=order.map(status=>{
    const start=progress
    progress+=group.counts[status]/total*100
    return `${COLORS[status]} ${start}% ${progress}%`
  })
  return <AlexBox sx={{border:'1px solid #EAECF0',borderRadius:2,p:2,display:'flex',flexDirection:'column',alignItems:'center',gap:large?1.5:.65,minWidth:0,justifyContent:'center',height:'100%',boxSizing:'border-box'}}>
    <AlexText sx={{fontSize:large?16:12.5,fontWeight:800,color:'#08275B',textAlign:'center'}}>{group.label}</AlexText>
    <AlexBox role="img" aria-label={`${group.label}: ${group.total} questions. ${order.map(status=>`${LABELS[status]} ${group.counts[status]}`).join(', ')}`} sx={{width:large?220:104,height:large?220:104,borderRadius:'50%',background:`conic-gradient(${stops.join(',')})`,display:'grid',placeItems:'center'}}>
      <AlexBox sx={{width:large?148:72,height:large?148:72,borderRadius:'50%',bgcolor:'#fff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <AlexText sx={{fontSize:large?34:20,fontWeight:850,lineHeight:1,color:'#08275B'}}>{group.total}</AlexText>
        <AlexText sx={{fontSize:large?12:10,color:'#667085'}}>questions</AlexText>
      </AlexBox>
    </AlexBox>
    <AlexText sx={{fontSize:large?12.5:11,color:'#475467',textAlign:'center'}}>{group.total-group.counts.new} practiced / {group.total}</AlexText>
    <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:large?.75:.25,width:'100%'}}>
      {order.map(status=><AlexBox key={status} sx={{display:'flex',alignItems:'center',gap:.65,minWidth:0}}>
        <AlexBox sx={{width:9,height:9,borderRadius:'50%',bgcolor:COLORS[status],flexShrink:0}}/>
        <AlexText sx={{fontSize:large?11.5:10,color:'#475467'}}>{LABELS[status]} <b>{group.counts[status]}</b></AlexText>
      </AlexBox>)}
    </AlexBox>
  </AlexBox>
}

export default function QuestionCoverageCharts({questions,attempts,recoveryCorrectAnswers=2}:{questions:PracticeQuestion[];attempts:Attempt[];recoveryCorrectAnswers?:number}){
  const groups=buildCoverageGroups(questions,attempts,recoveryCorrectAnswers)
  return <SectionPanel
    eyebrow="Question bank coverage"
    title="Practice by test"
    description="One count per question across your full practice history. Green: successful or fully recovered. Red: still failed. Orange: correctly retried but not yet fully recovered. Gray: not attempted."
  >
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'minmax(0,1fr) minmax(0,3fr)'},gap:1.5,alignItems:'stretch'}}>
      {groups[0]&&<CoverageDonut group={groups[0]} large/>}
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(3,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1,alignContent:'start'}}>
        {groups.slice(1).map(group=><CoverageDonut key={group.id} group={group}/>)}
      </AlexBox>
    </AlexBox>
  </SectionPanel>
}

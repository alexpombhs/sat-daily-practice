import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'
import AlexDropdown from '../atoms/AlexDropdown'
import SectionPanel from '../molecules/SectionPanel'
import {buildQuestionMastery} from '../../lib/questionMastery'
import {reviewConceptGroup} from '../../lib/conceptReview'
import {practiceTestLabel} from '../../lib/questionBank'
import type {Attempt,PracticeQuestion} from '../../types'

export type Breakdown='status'|'difficulty'|'subject'|'concept'
export type CoverageSlice={label:string;count:number;color:string}
export type CoverageGroup={id:string;label:string;total:number;practiced:number;slices:CoverageSlice[]}

const palette=['#4A75C4','#35A77C','#E9A348','#9C6ADE','#D96573','#2E9BAA','#A08B5C','#64748B','#CE73B4','#8BBF50']
const STATUS_COLORS={New:'#DDE3EB',Successful:'#21965B',Failed:'#D84A54',Reviewed:'#F0A44A'}
const DIFFICULTY_COLORS={Easy:'#35A77C',Medium:'#E9A348',Advanced:'#D96573',Unrated:'#DDE3EB'}
const SUBJECT_COLORS={Math:'#4A75C4','Reading & Writing':'#9C6ADE'}
const DESCRIPTION:Record<Breakdown,string>={
  status:'New, successful, failed, and reviewed questions, based on full practice history.',
  difficulty:'Distribution by Easy, Medium, and Advanced. Questions without an assigned level appear as Unrated.',
  subject:'How questions are divided between Math and Reading & Writing.',
  concept:'Related question concepts are grouped into broader SAT skills. Each question counts once; questions without concept tags appear as Untagged.',
}

function labelFor(question:PracticeQuestion,breakdown:Breakdown,mastery:ReturnType<typeof buildQuestionMastery>):string{
  if(breakdown==='status'){
    const state=mastery.get(question.id)
    if(!state?.attempted)return 'New'
    if(!state.failed)return 'Successful'
    return state.correctAfterFailure>0?'Reviewed':'Failed'
  }
  if(breakdown==='difficulty'){
    return question.difficulty==='easy'?'Easy':question.difficulty==='medium'?'Medium':question.difficulty==='advanced'?'Advanced':'Unrated'
  }
  if(breakdown==='subject')return question.subject==='math'?'Math':'Reading & Writing'
  return question.concepts?.some(tag=>tag.trim())?reviewConceptGroup(question.concepts,question.subject):'Untagged'
}

export function buildCoverageGroups(questions:PracticeQuestion[],attempts:Attempt[],recoveryCorrectAnswers=2,breakdown:Breakdown='status'):CoverageGroup[]{
  const mastery=buildQuestionMastery(attempts,recoveryCorrectAnswers)
  const tests=[...new Set(questions.map(q=>q.practiceTestId))].sort((a,b)=>Number(a.split('-').pop())-Number(b.split('-').pop()))
  const allLabels=[...new Set(questions.map(q=>labelFor(q,breakdown,mastery)))].sort((a,b)=>a.localeCompare(b))
  const preferred=breakdown==='status'?['Successful','Reviewed','Failed','New']
    :breakdown==='difficulty'?['Easy','Medium','Advanced','Unrated']
    :breakdown==='subject'?['Math','Reading & Writing']
    :allLabels.filter(label=>label!=='Untagged').concat(allLabels.includes('Untagged')?['Untagged']:[])
  const labels=preferred.filter(label=>allLabels.includes(label))
  const colorFor=(label:string,index:number)=>{
    if(breakdown==='status')return STATUS_COLORS[label as keyof typeof STATUS_COLORS]
    if(breakdown==='difficulty')return DIFFICULTY_COLORS[label as keyof typeof DIFFICULTY_COLORS]
    if(breakdown==='subject')return SUBJECT_COLORS[label as keyof typeof SUBJECT_COLORS]
    return label==='Untagged'?'#DDE3EB':palette[index%palette.length]
  }
  const make=(id:string,label:string,items:PracticeQuestion[]):CoverageGroup=>{
    const counts=new Map<string,number>()
    items.forEach(question=>{
      const key=labelFor(question,breakdown,mastery)
      counts.set(key,(counts.get(key)??0)+1)
    })
    return{
      id,label,total:items.length,
      practiced:items.filter(question=>mastery.get(question.id)?.attempted).length,
      slices:labels.filter(key=>(counts.get(key)??0)>0).map(key=>({label:key,count:counts.get(key)??0,color:colorFor(key,labels.indexOf(key))})),
    }
  }
  return[
    make('all','All practice tests',questions),
    ...tests.map(test=>make(test,practiceTestLabel(test),questions.filter(q=>q.practiceTestId===test))),
  ]
}

function CoverageDonut({group,large=false}:{group:CoverageGroup;large?:boolean}){
  const total=Math.max(1,group.total)
  let offset=0
  const stops=group.slices.map(slice=>{
    const start=offset
    offset+=slice.count/total*100
    return `${slice.color} ${start}% ${offset}%`
  })
  const background=stops.length?`conic-gradient(${stops.join(',')})`:'#DDE3EB'
  return <AlexBox sx={{border:'1px solid #EAECF0',borderRadius:2,p:large?2:1,display:'flex',flexDirection:'column',alignItems:'center',gap:large?1.5:.65,minWidth:0,justifyContent:'center',height:'100%',boxSizing:'border-box'}}>
    <AlexText sx={{fontSize:large?16:12.5,fontWeight:800,color:'#08275B',textAlign:'center'}}>{group.label}</AlexText>
    <AlexBox role="img" aria-label={`${group.label}: ${group.total} questions. ${group.slices.map(slice=>`${slice.label} ${slice.count}`).join(', ')}`} sx={{width:large?220:104,height:large?220:104,borderRadius:'50%',background,display:'grid',placeItems:'center',flexShrink:0}}>
      <AlexBox sx={{width:large?148:72,height:large?148:72,borderRadius:'50%',bgcolor:'#fff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <AlexText sx={{fontSize:large?34:20,fontWeight:850,lineHeight:1,color:'#08275B'}}>{group.total}</AlexText>
        <AlexText sx={{fontSize:large?12:10,color:'#667085'}}>questions</AlexText>
      </AlexBox>
    </AlexBox>
    <AlexText sx={{fontSize:large?12.5:11,color:'#475467',textAlign:'center'}}>{group.practiced} practiced / {group.total}</AlexText>
    {large&&<AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:.75,width:'100%'}}>
      {group.slices.map(slice=><AlexBox key={slice.label} title={slice.label} sx={{display:'flex',alignItems:'center',gap:.65,minWidth:0}}>
        <AlexBox sx={{width:9,height:9,borderRadius:'50%',bgcolor:slice.color,flexShrink:0}}/>
        <AlexText sx={{fontSize:large?11.5:10,color:'#475467',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{slice.label} <b>{slice.count}</b></AlexText>
      </AlexBox>)}
    </AlexBox>}
  </AlexBox>
}

export default function QuestionCoverageCharts({questions,attempts,recoveryCorrectAnswers=2}:{questions:PracticeQuestion[];attempts:Attempt[];recoveryCorrectAnswers?:number}){
  const[breakdown,setBreakdown]=useState<Breakdown>('status')
  const groups=buildCoverageGroups(questions,attempts,recoveryCorrectAnswers,breakdown)
  return <SectionPanel eyebrow="Question bank coverage" title="Practice by test" description={DESCRIPTION[breakdown]}>
    <AlexBox sx={{width:{xs:'100%',sm:260},mb:1.75}}>
      <AlexDropdown id="question-coverage-breakdown" label="Chart breakdown" value={breakdown} onChange={setBreakdown} options={[
        {value:'status',label:'Question status'},
        {value:'difficulty',label:'Difficulty level'},
        {value:'subject',label:'Subject'},
        {value:'concept',label:'Primary concept'},
      ]}/>
    </AlexBox>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'minmax(0,1fr) minmax(0,3fr)'},gap:1.5,alignItems:'stretch'}}>
      {groups[0]&&<CoverageDonut group={groups[0]} large/>}
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(3,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1,alignContent:'start'}}>
        {groups.slice(1).map(group=><CoverageDonut key={group.id} group={group}/>)}
      </AlexBox>
    </AlexBox>
  </SectionPanel>
}

import {ChevronDown,ChevronUp} from 'lucide-react'
import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexInfoTooltipButton from '../atoms/AlexInfoTooltipButton'
import AlexText from '../atoms/AlexText'
import {failedQuestionIds} from '../../lib/questionMastery'
import {questionPsatDomain,type PsatDomainId} from '../../lib/psatDomains'
import type {Attempt,PracticeQuestion} from '../../types'

type Props={domain:PsatDomainId;questions:PracticeQuestion[];attempts:Attempt[];recoveryCorrectAnswers:number}

export default function PsatTopicBreakdown({domain,questions,attempts,recoveryCorrectAnswers}:Props){
  const[expanded,setExpanded]=useState(false)
  const[all,setAll]=useState(false)
  const inDomain=questions.filter(q=>questionPsatDomain(q)===domain)
  const ids=new Set(inDomain.map(q=>q.id))
  const relevant=attempts.filter(a=>ids.has(a.questionId))
  const seen=new Set(relevant.map(a=>a.questionId)).size
  const unresolved=failedQuestionIds(relevant,recoveryCorrectAnswers).size

  const byTopic=new Map<string,{label:string;ids:Set<string>}>()
  for(const question of inDomain){
    for(const raw of question.concepts??[]){
      const label=raw.trim()
      if(!label)continue
      const key=label.toLowerCase()
      const existing=byTopic.get(key)??{label,ids:new Set<string>()}
      existing.ids.add(question.id)
      byTopic.set(key,existing)
    }
  }
  const topics=[...byTopic.values()].sort((a,b)=>b.ids.size-a.ids.size||a.label.localeCompare(b.label))

  return <AlexBox sx={{mt:.3}}>
    <AlexBox sx={{display:'flex',alignItems:'center',gap:.4}}>
      <AlexButton
        tone="quiet"
        disabled={!topics.length}
        onClick={()=>setExpanded(previous=>!previous)}
        endIcon={expanded?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
        sx={{fontSize:11.5,fontWeight:500,minHeight:25,p:'0 4px',textTransform:'none',color:'#64748B'}}
      >
        {expanded?'Hide topics':`${topics.length} topics`}
      </AlexButton>
      <AlexInfoTooltipButton
        label="Practice question coverage"
        title={<span>{inDomain.length} questions in your bank. {seen} distinct questions practiced; {unresolved} currently unresolved. This is app practice history, not an official PSAT domain score.</span>}
      />
    </AlexBox>
    {expanded&&<AlexBox sx={{mt:.6,pl:1.2,borderLeft:'2px solid #EDF1F7'}}>
      {(all?topics:topics.slice(0,5)).map(topic=>{
        const matching=relevant.filter(a=>topic.ids.has(a.questionId))
        const attempted=new Set(matching.map(a=>a.questionId)).size
        const accuracy=matching.length?Math.round(matching.filter(a=>a.correct).length/matching.length*100):null
        return <AlexBox key={topic.label} sx={{display:'flex',gap:1,alignItems:'baseline',justifyContent:'space-between',py:.65}}>
          <AlexText sx={{fontSize:11.5,fontWeight:500,color:'#475467',minWidth:0}}>{topic.label}</AlexText>
          <AlexText sx={{fontSize:10.5,color:'#98A2B3',whiteSpace:'nowrap'}}>
            {attempted}/{topic.ids.size}{accuracy!==null?` · ${accuracy}%`:''}
          </AlexText>
        </AlexBox>
      })}
      {topics.length>5&&<AlexButton tone="quiet" onClick={()=>setAll(value=>!value)} sx={{fontSize:11,fontWeight:500,minHeight:27,px:.5}}>
        {all?'Show fewer':`Show all ${topics.length}`}
      </AlexButton>}
    </AlexBox>}
  </AlexBox>
}

import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexText from '../atoms/AlexText'
import {failedQuestionIds} from '../../lib/questionMastery'
import {questionPsatDomain,type PsatDomainId} from '../../lib/psatDomains'
import type {Attempt,PracticeQuestion} from '../../types'

type Props={domain:PsatDomainId;questions:PracticeQuestion[];attempts:Attempt[];recoveryCorrectAnswers:number}
export default function PsatTopicBreakdown({domain,questions,attempts,recoveryCorrectAnswers}:Props){
  const[expanded,setExpanded]=useState(false)
  const[all,setAll]=useState(false)
  const inDomain=questions.filter(question=>questionPsatDomain(question)===domain)
  const ids=new Set(inDomain.map(q=>q.id))
  const relevant=attempts.filter(a=>ids.has(a.questionId))
  const attemptedIds=new Set(relevant.map(a=>a.questionId))
  const unresolved=failedQuestionIds(relevant,recoveryCorrectAnswers)
  const topicMap=new Map<string,{label:string;ids:Set<string>}>()
  for(const question of inDomain){
    for(const value of question.concepts??[]){
      const label=value.trim()
      if(!label)continue
      const key=label.toLowerCase()
      const entry=topicMap.get(key)??{label,ids:new Set<string>()}
      entry.ids.add(question.id)
      topicMap.set(key,entry)
    }
  }
  const topics=[...topicMap.values()].sort((a,b)=>b.ids.size-a.ids.size||a.label.localeCompare(b.label))
  return <AlexBox sx={{mt:1}}>
    <AlexText sx={{color:'#667085',fontSize:12}}>
      Practice bank: {inDomain.length} questions · {attemptedIds.size} seen · {unresolved.size} unresolved
    </AlexText>
    {topics.length>0&&<AlexButton tone="quiet" onClick={()=>setExpanded(!expanded)} sx={{fontSize:12.5,p:0,mt:.75}}>
      {expanded?'Hide subtopics':`Show ${topics.length} subtopics`}
    </AlexButton>}
    {expanded&&<AlexBox sx={{display:'grid',gap:.5,mt:1}}>
      {(all?topics:topics.slice(0,6)).map(topic=>{
        const topicAttempts=relevant.filter(a=>topic.ids.has(a.questionId))
        const seen=new Set(topicAttempts.map(a=>a.questionId)).size
        const accuracy=topicAttempts.length?Math.round(topicAttempts.filter(a=>a.correct).length/topicAttempts.length*100):null
        return <AlexBox key={topic.label} sx={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:1,bgcolor:'#F4F7FD',borderRadius:1,p:.85}}>
          <AlexText sx={{fontSize:12.5,color:'#344054',fontWeight:700}}>{topic.label}</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085'}}>{seen}/{topic.ids.size} seen · {accuracy===null?'Not practiced':`${accuracy}% accurate`}</AlexText>
        </AlexBox>
      })}
      {topics.length>6&&<AlexButton tone="quiet" onClick={()=>setAll(!all)} sx={{justifySelf:'start',fontSize:12}}>
        {all?'Show fewer':`Show all ${topics.length}`}
      </AlexButton>}
      <AlexText sx={{fontSize:11.5,color:'#667085'}}>Based on existing question concept tags; one question can appear in several subtopics.</AlexText>
    </AlexBox>}
  </AlexBox>
}

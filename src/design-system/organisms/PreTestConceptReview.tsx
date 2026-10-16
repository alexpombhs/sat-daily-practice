import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexText from '../atoms/AlexText'
import type {Attempt,PracticeQuestion} from '../../types'
import type {ConceptPriority} from '../../lib/conceptReview'

type Props={
  concepts:ConceptPriority[]
  questions:PracticeQuestion[]
  attempts:Attempt[]
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
}

export default function PreTestConceptReview({concepts,questions,attempts,onPractice,onReview}:Props){
  const [expanded,setExpanded]=useState<string|null>(null)
  const questionHistory=new Map<string,Attempt[]>()
  attempts.forEach(attempt=>questionHistory.set(attempt.questionId,[...(questionHistory.get(attempt.questionId)??[]),attempt]))
  const prioritized=concepts.slice(0,12)

  return <AlexBox sx={{display:'flex',flexDirection:'column',gap:1.5,maxWidth:1100,mx:'auto',width:'100%'}}>
    <AlexBox sx={{mb:1}}>
      <AlexText component="h1" sx={{fontSize:{xs:26,sm:33},fontWeight:850,color:'#08275B'}}>Pre-Test Review</AlexText>
      <AlexText sx={{fontSize:14.5,color:'#53657C',mt:.5}}>
        Concepts are ranked from most challenging to easier based on past accuracy, repeated mistakes, and recent success. Select a concept, then practice or review any question.
      </AlexText>
    </AlexBox>
    {prioritized.length===0&&<AlexText>No previously challenging concepts found in your practice history.</AlexText>}
    {prioritized.map((concept,index)=>{
      const tagged=questions.filter(question=>question.concepts?.includes(concept.concept))
      const items=tagged.map(question=>{
        const history=[...(questionHistory.get(question.id)??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
        const missed=history.filter(a=>!a.correct).length
        return {question,missed,history,latest:history[history.length-1]}
      }).sort((a,b)=>b.missed-a.missed||Number(Boolean(a.latest?.correct))-Number(Boolean(b.latest?.correct))||a.history.length-b.history.length||a.question.number-b.question.number)
      const open=(expanded??prioritized[0].concept)===concept.concept
      return <AlexBox key={concept.concept} sx={{border:'1px solid #DCE4EF',borderRadius:2,bgcolor:'#fff',overflow:'hidden'}}>
        <AlexBox
          onClick={()=>setExpanded(open?'':concept.concept)}
          role="button"
          tabIndex={0}
          onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setExpanded(open?'':concept.concept)}}}
          sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1.5,p:1.7,cursor:'pointer',bgcolor:open?'#EFF5FD':'#fff'}}
        >
          <AlexBox sx={{minWidth:0}}>
            <AlexText sx={{fontWeight:850,fontSize:16,color:'#08275B'}}>{index+1}. {concept.concept}</AlexText>
            <AlexText sx={{fontSize:12.5,color:'#60738A',mt:.4}}>{concept.accuracy}% historical accuracy · {concept.incorrect} incorrect attempts · {items.length} related questions</AlexText>
          </AlexBox>
          <AlexText sx={{color:'#365578',fontSize:13,fontWeight:750}}>{open?'Hide':'View questions'}</AlexText>
        </AlexBox>
        {open&&<AlexBox sx={{p:1.3,display:'flex',flexDirection:'column',gap:.7}}>
          <AlexText sx={{fontSize:12,color:'#69788A',mb:.3}}>Previously missed questions first, followed by other practice questions.</AlexText>
          {items.map(({question,missed,history,latest})=><AlexBox key={question.id} sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1.2,p:1,flexWrap:'wrap',borderBottom:'1px solid #EFF1F5'}}>
            <AlexBox sx={{minWidth:0}}>
              <AlexText sx={{fontWeight:750,color:'#08275B',fontSize:13.5}}>{question.subject==='math'?'Math':'Reading & Writing'} · {question.practiceTestId.replace('practice-test-','Test ')} · {question.module.toUpperCase()} · Question {question.number}</AlexText>
              <AlexText sx={{fontSize:12,color:'#627184'}}>{missed>0?`Previously missed ${missed} time${missed===1?'':'s'}`:history.length?'Previously correct':'Not attempted'}{latest?` · Latest: ${latest.correct?'correct':'incorrect'}`:''}</AlexText>
            </AlexBox>
            <AlexBox sx={{display:'flex',gap:.8}}>
              <AlexButton tone="secondary" onClick={()=>onReview(question)}>Review</AlexButton>
              <AlexButton onClick={()=>onPractice(question)}>Practice</AlexButton>
            </AlexBox>
          </AlexBox>)}
        </AlexBox>}
      </AlexBox>
    })}
  </AlexBox>
}

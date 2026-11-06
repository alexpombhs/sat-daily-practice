import {useMemo,useState} from 'react'
import {X} from 'lucide-react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexDrawer from '../atoms/AlexDrawer'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexText from '../atoms/AlexText'
import type {PreTestCoachDomain} from '../../lib/preTestCoaching'
import type {ReviewQuestion} from '../../lib/preTestReviewAnalytics'
import type {PracticeQuestion} from '../../types'

type Props={
  insight:PreTestCoachDomain|undefined
  rows:ReviewQuestion[]
  onReview:(question:PracticeQuestion)=>void
  stale?:boolean
}

function questionLabel(question:PracticeQuestion){
  return 'Test '+question.practiceTestId.replace('practice-test-','')+' · '+question.module.toUpperCase()+' · Q'+question.number
}

export default function PreTestCoachingPanel({insight,rows,onReview,stale=false}:Props){
  const [exampleFocus,setExampleFocus]=useState<number|null>(null)
  const byId=useMemo(()=>new Map(rows.map(row=>[row.question.id,row])),[rows])
  const focus=exampleFocus===null?undefined:insight?.focus[exampleFocus]
  const examples=focus?.examples.flatMap(example=>{
    const row=byId.get(example.questionId)
    return row?.first&&!row.first.correct?[{example,row}]:[]
  })??[]

  return <AlexBox sx={{minWidth:0}}>
    <AlexAccordion summary={<AlexBox>
      <AlexText sx={{fontSize:13.5,fontWeight:600,color:'#08275B'}}>Personalized coaching</AlexText>
      <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>
        {insight?insight.focus.length+' targeted strategies · optional question examples':'No individually reviewed coaching report yet'}
      </AlexText>
    </AlexBox>}>
      {insight?<AlexBox sx={{display:'grid',gap:1.2}}>
        <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{insight.summary}</AlexText>
        {insight.focus.map((item,index)=>{
          const count=item.examples.filter(example=>{
            const row=byId.get(example.questionId)
            return Boolean(row?.first&&!row.first.correct)
          }).length
          return <AlexBox key={item.title} sx={{borderTop:'1px solid #EDF0F5',pt:1.15,display:'grid',gap:.55}}>
            <AlexText sx={{fontSize:13,fontWeight:600,color:'#08275B'}}>{index+1}. {item.title}</AlexText>
            <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{item.observation}</AlexText>
            <AlexText sx={{fontSize:12.5,color:'#344054',lineHeight:1.55}}>
              <AlexText component="span" sx={{fontWeight:600}}>Try this: </AlexText>{item.strategy}
            </AlexText>
            {count>0&&<AlexButton tone="secondary" onClick={()=>setExampleFocus(index)}
              sx={{fontSize:11.5,minHeight:30,justifySelf:'start',mt:.2}}>
              Review {count} {count===1?'example':'examples'}
            </AlexButton>}
          </AlexBox>
        })}
        <AlexBox sx={{bgcolor:'#F8FAF8',borderLeft:'2px solid #85A995',px:1.2,py:1}}>
          <AlexText sx={{fontSize:12,fontWeight:600,color:'#344054'}}>What is going well</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.25,lineHeight:1.5}}>{insight.strength}</AlexText>
        </AlexBox>
        {stale&&<AlexText sx={{fontSize:11.5,color:'#667085'}}>Additional practice has been recorded since these coaching notes. Live statistics include the newer attempts.</AlexText>}
        <AlexText sx={{fontSize:11,color:'#98A2B3'}}>Coaching is a reviewed interpretation of actual first answers, not an automatic diagnosis.</AlexText>
      </AlexBox>:<AlexText sx={{fontSize:12.5,color:'#667085'}}>The current question statistics remain available. Individual written coaching has not been reviewed for this account.</AlexText>}
    </AlexAccordion>

    <AlexDrawer anchor="right" open={exampleFocus!==null} onClose={()=>setExampleFocus(null)}
      sx={{'& .MuiDrawer-paper':{width:{xs:'100%',sm:510},maxWidth:'100vw',boxSizing:'border-box'}}}>
      <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:1.5,p:2,borderBottom:'1px solid #E4E7EC'}}>
        <AlexBox sx={{minWidth:0}}>
          <AlexText component="h2" sx={{fontSize:17,fontWeight:600,color:'#08275B'}}>Examples from your answers</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.35}}>{focus?.title??'Review examples'}</AlexText>
        </AlexBox>
        <AlexIconButton label="Close coaching examples" onClick={()=>setExampleFocus(null)}><X size={18}/></AlexIconButton>
      </AlexBox>
      <AlexBox sx={{p:2,display:'grid',gap:1.25}}>
        {examples.map(({example,row})=><AlexBox key={example.questionId} sx={{border:'1px solid #E4E7EC',borderRadius:2,p:1.5,display:'grid',gap:.8}}>
          <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{questionLabel(row.question)}</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085'}}>First answer: {row.first?.selectedAnswer} · Correct: {row.first?.correctAnswer} · {row.question.difficulty??'Unrated'}</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{example.note}</AlexText>
          <AlexButton tone="secondary" sx={{fontSize:12,minHeight:32,justifySelf:'start'}}
            onClick={()=>{setExampleFocus(null);onReview(row.question)}}>Review question and explanation</AlexButton>
        </AlexBox>)}
      </AlexBox>
    </AlexDrawer>
  </AlexBox>
}

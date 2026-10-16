import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexText from '../atoms/AlexText'
import type {Attempt,PracticeQuestion,Subject} from '../../types'
import type {ConceptPriority} from '../../lib/conceptReview'

type Props={
  concepts:ConceptPriority[]
  questions:PracticeQuestion[]
  attempts:Attempt[]
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
}

function displayConcept(value:string){
  return value.trim().replace(/\b[a-z]/g,letter=>letter.toUpperCase())
}

export default function PreTestConceptReview({concepts,questions,attempts,onPractice,onReview}:Props){
  const [subject,setSubject]=useState<Subject>('math')
  const [selectedConcept,setSelectedConcept]=useState<string|null>(null)
  const byId=new Map(questions.map(question=>[question.id,question]))
  const historyById=new Map<string,Attempt[]>()
  for(const attempt of attempts)historyById.set(attempt.questionId,[...(historyById.get(attempt.questionId)??[]),attempt])

  // Subjects are filtered before choosing a concept. Sort within each subject
  // by actual failure percentage; number of attempts is the tie-break.
  const ranked=concepts.filter(item=>item.questionIds.some(id=>byId.get(id)?.subject===subject))
    .sort((a,b)=>b.failureRate-a.failureRate||b.attempts-a.attempts||b.unresolved-a.unresolved||a.concept.localeCompare(b.concept))
  const active=ranked.find(item=>item.concept===selectedConcept)??ranked[0]
  const items=(active?questions.filter(q=>q.subject===subject&&q.concepts?.includes(active.concept)):[])
    .map(question=>{
      const history=[...(historyById.get(question.id)??[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
      const failures=history.filter(a=>!a.correct).length
      return {question,history,failures,latest:history[history.length-1]}
    })
    .sort((a,b)=>b.failures-a.failures||Number(!a.latest?.correct)-Number(!b.latest?.correct)||b.history.length-a.history.length||a.question.number-b.question.number)

  return <AlexBox sx={{display:'flex',flexDirection:'column',width:'100%',height:'100%',minHeight:0,gap:1.5}}>
    <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',flexWrap:'wrap',gap:1.5,bgcolor:'#EAF3FF',border:'1px solid #D9E7F8',borderRadius:2,p:{xs:1.5,md:2}}}>
      <AlexBox>
        <AlexText sx={{fontSize:11,fontWeight:850,color:'#245F9E',letterSpacing:'.11em'}}>PERSONALIZED PRACTICE</AlexText>
        <AlexText component="h1" sx={{fontSize:{xs:25,md:31},fontFamily:'Georgia, serif',fontWeight:750,color:'#08275B'}}>Pre-Test Review</AlexText>
        <AlexText sx={{fontSize:13,color:'#475F7C'}}>Choose a subject. Concepts are ranked by historical failure rate, highest first.</AlexText>
      </AlexBox>
      <AlexBox sx={{display:'flex',p:.4,bgcolor:'#fff',borderRadius:2,border:'1px solid #D9E7F8',gap:.5}}>
        <AlexButton tone={subject==='math'?'primary':'secondary'} onClick={()=>{setSubject('math');setSelectedConcept(null)}}>Math</AlexButton>
        <AlexButton tone={subject==='english'?'primary':'secondary'} onClick={()=>{setSubject('english');setSelectedConcept(null)}}>Reading &amp; Writing</AlexButton>
      </AlexBox>
    </AlexBox>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',md:'minmax(250px,.85fr) minmax(0,2fr)'},gap:1.5,minHeight:0,flex:1}}>
      <AlexBox sx={{bgcolor:'#fff',border:'1px solid #E2E6ED',borderRadius:2,p:1.2,overflowY:'auto',minHeight:0}}>
        <AlexText sx={{fontSize:12,fontWeight:850,color:'#657389',letterSpacing:'.07em',mb:1}}>CONCEPTS · HARDEST FIRST</AlexText>
        {ranked.length===0&&<AlexText sx={{fontSize:13,color:'#69788A'}}>No previously missed concepts in this subject.</AlexText>}
        {ranked.map((item,index)=>{
          const selected=active?.concept===item.concept
          return <AlexBox key={item.concept} onClick={()=>setSelectedConcept(item.concept)} role="button" tabIndex={0}
            onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelectedConcept(item.concept)}}}
            sx={{border:selected?'1px solid #8CAEDB':'1px solid transparent',borderBottom:selected?'1px solid #8CAEDB':'1px solid #E9EDF3',borderRadius:1.5,p:1.15,mb:.35,cursor:'pointer',bgcolor:selected?'#EAF3FF':'#fff','&:hover':{bgcolor:'#F2F7FD'}}}>
            <AlexBox sx={{display:'flex',justifyContent:'space-between',gap:1,alignItems:'center'}}>
              <AlexText sx={{fontSize:13.5,fontWeight:800,color:'#08275B'}}>{index+1}. {displayConcept(item.concept)}</AlexText>
              <AlexText sx={{fontSize:12.5,fontWeight:850,color:'#9A4C27',whiteSpace:'nowrap'}}>{Math.round(item.failureRate)}% missed</AlexText>
            </AlexBox>
            <AlexText sx={{fontSize:11.5,color:'#667085',mt:.4}}>{item.incorrect} incorrect / {item.attempts} attempts</AlexText>
          </AlexBox>
        })}
      </AlexBox>
      <AlexBox sx={{bgcolor:'#fff',border:'1px solid #E2E6ED',borderRadius:2,p:{xs:1.2,md:1.8},minHeight:0,overflowY:'auto'}}>
        {active?<>
          <AlexText sx={{fontSize:11.5,color:'#667085',fontWeight:850,letterSpacing:'.07em'}}>CONCEPT REVIEW</AlexText>
          <AlexText component="h2" sx={{fontFamily:'Georgia, serif',fontSize:{xs:21,md:26},fontWeight:750,color:'#08275B',mt:.4}}>{displayConcept(active.concept)}</AlexText>
          <AlexText sx={{fontSize:13,color:'#5A6B80',mt:.5,mb:1.5}}>{Math.round(active.failureRate)}% historical failure rate · {items.length} related questions. Previously failed questions appear first.</AlexText>
          <AlexBox sx={{display:'flex',flexDirection:'column',gap:.8}}>
            {items.map(({question,history,failures,latest},index)=><AlexBox key={question.id} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,p:1.2,border:'1px solid #E6EAF0',borderRadius:1.5,flexWrap:'wrap'}}>
              <AlexBox>
                <AlexText sx={{fontSize:13.5,fontWeight:800,color:'#08275B'}}>{index+1}. Test {question.practiceTestId.replace('practice-test-','')} · {question.module.toUpperCase()} · Question {question.number}</AlexText>
                <AlexText sx={{fontSize:12,color:'#607088',mt:.35}}>{failures>0?`Previously missed ${failures} time${failures===1?'':'s'}`:history.length?'Previously correct':'New question'}{latest?` · Most recent: ${latest.correct?'correct':'incorrect'}`:''}</AlexText>
              </AlexBox>
              <AlexBox sx={{display:'flex',gap:.7}}>
                <AlexButton tone="secondary" onClick={()=>onReview(question)}>Review</AlexButton>
                <AlexButton onClick={()=>onPractice(question)}>Practice</AlexButton>
              </AlexBox>
            </AlexBox>)}
          </AlexBox>
        </>:<AlexText sx={{color:'#667085'}}>Select a subject with practice history to see its concepts.</AlexText>}
      </AlexBox>
    </AlexBox>
  </AlexBox>
}

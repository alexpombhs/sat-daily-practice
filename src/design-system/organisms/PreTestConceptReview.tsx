import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexTabs from '../atoms/AlexTabs'
import AlexText from '../atoms/AlexText'
import type {Attempt,PracticeQuestion,Subject} from '../../types'
import {reviewConceptGroup,type ConceptPriority} from '../../lib/conceptReview'

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
  const ranked=concepts.filter(item=>item.questionIds.some(id=>byId.get(id)?.subject===subject)).slice(0,7)
    .sort((a,b)=>b.failureRate-a.failureRate||b.attempts-a.attempts||b.unresolved-a.unresolved||a.concept.localeCompare(b.concept))
  const totalSubjectQuestions=questions.filter(q=>q.subject===subject).length
  const reviewQuestionIds=new Set(ranked.flatMap(item=>questions.filter(q=>q.subject===subject&&q.concepts?.length&&reviewConceptGroup(q.concepts,q.subject)===item.concept).map(q=>q.id)))
  const totalReviewQuestions=reviewQuestionIds.size
  const active=ranked.find(item=>item.concept===selectedConcept)??ranked[0]
  const items=(active?questions.filter(q=>q.subject===subject&&q.concepts?.length&&reviewConceptGroup(q.concepts,q.subject)===active.concept):[])
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
        <AlexText sx={{fontSize:13,color:'#475F7C'}}>Choose a subject. Concepts with lower historical success rates are reviewed first.</AlexText>
      </AlexBox>
      <AlexTabs
        value={subject}
        options={[{value:'math',label:'Math'},{value:'english',label:'Reading & Writing'}]}
        onChange={next=>{setSubject(next);setSelectedConcept(null)}}
        aria-label="Pre-Test Review subject"
        sx={{minHeight:40,alignSelf:'flex-end',maxWidth:'100%',borderBottom:'1px solid #BFD1E7','& .MuiTab-root':{minHeight:40,px:{xs:1.2,sm:2},fontSize:13.5},'& .MuiTabs-indicator':{height:3}}}
      />
    </AlexBox>
    <AlexBox sx={{display:'flex',alignItems:'center',gap:{xs:1,sm:2},flexWrap:'wrap',bgcolor:'#fff',border:'1px solid #E2E6ED',borderRadius:2,p:{xs:1.2,sm:1.5}}}>
      <AlexBox sx={{minWidth:120}}>
        <AlexText sx={{fontSize:11,color:'#667085',fontWeight:800,textTransform:'uppercase'}}>Review Questions</AlexText>
        <AlexText sx={{fontSize:21,fontWeight:850,color:'#08275B'}}>{totalReviewQuestions}</AlexText>
      </AlexBox>
      <AlexBox sx={{borderLeft:'1px solid #E2E6ED',pl:{xs:1,sm:2},minWidth:120}}>
        <AlexText sx={{fontSize:11,color:'#667085',fontWeight:800,textTransform:'uppercase'}}>Subject Bank</AlexText>
        <AlexText sx={{fontSize:21,fontWeight:850,color:'#08275B'}}>{totalSubjectQuestions}</AlexText>
      </AlexBox>
      <AlexBox sx={{borderLeft:'1px solid #E2E6ED',pl:{xs:1,sm:2}}}>
        <AlexText sx={{fontSize:11,color:'#667085',fontWeight:800,textTransform:'uppercase'}}>Priority Concepts</AlexText>
        <AlexText sx={{fontSize:21,fontWeight:850,color:'#08275B'}}>{ranked.length}</AlexText>
      </AlexBox>
    </AlexBox>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',md:'minmax(250px,.85fr) minmax(0,2fr)'},gap:1.5,minHeight:0,flex:1}}>
      <AlexBox sx={{bgcolor:'#fff',border:'1px solid #E2E6ED',borderRadius:2,p:1.2,overflowY:'auto',minHeight:0}}>
        <AlexText sx={{fontSize:12,fontWeight:850,color:'#657389',letterSpacing:'.07em',mb:1}}>TOP REVIEW CONCEPTS · HARDEST FIRST</AlexText>
        {ranked.length===0&&<AlexText sx={{fontSize:13,color:'#69788A'}}>No previously missed concepts in this subject.</AlexText>}
        {ranked.map((item,index)=>{
          const selected=active?.concept===item.concept
          return <AlexButtonBase key={item.concept} onClick={()=>setSelectedConcept(item.concept)}
            sx={{border:selected?'1px solid #8CAEDB':'1px solid transparent',borderBottom:selected?'1px solid #8CAEDB':'1px solid #E9EDF3',borderRadius:1.5,p:1.15,mb:.35,width:'100%',display:'block',textAlign:'left',cursor:'pointer',bgcolor:selected?'#EAF3FF':'#fff','&:hover':{bgcolor:'#F2F7FD'}}}>
            <AlexBox sx={{display:'flex',justifyContent:'space-between',gap:1,alignItems:'center'}}>
              <AlexText sx={{fontSize:13.5,fontWeight:800,color:'#08275B'}}>{index+1}. {displayConcept(item.concept)}</AlexText>
              <AlexText sx={{fontSize:12.5,fontWeight:850,color:'#9A4C27',whiteSpace:'nowrap'}}>{item.accuracy}% success</AlexText>
            </AlexBox>
            <AlexText sx={{fontSize:11.5,color:'#667085',mt:.4}}>{item.correct} correct / {item.attempts} attempts</AlexText>
          </AlexButtonBase>
        })}
      </AlexBox>
      <AlexBox sx={{bgcolor:'#fff',border:'1px solid #E2E6ED',borderRadius:2,p:{xs:1.2,md:1.8},minHeight:0,overflowY:'auto'}}>
        {active?<>
          <AlexText sx={{fontSize:11.5,color:'#667085',fontWeight:850,letterSpacing:'.07em'}}>CONCEPT REVIEW</AlexText>
          <AlexText component="h2" sx={{fontFamily:'Georgia, serif',fontSize:{xs:21,md:26},fontWeight:750,color:'#08275B',mt:.4}}>{displayConcept(active.concept)}</AlexText>
          <AlexText sx={{fontSize:13,color:'#5A6B80',mt:.5,mb:1.5}}>{active.accuracy}% historical success rate · {items.length} related questions. Previously failed questions appear first.</AlexText>
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

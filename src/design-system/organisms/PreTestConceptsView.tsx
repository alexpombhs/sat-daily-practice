
import {useMemo,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'
import type {Attempt,PracticeQuestion,Subject} from '../../types'
import type {PreTestCoachingSnapshot} from '../../lib/preTestCoaching'
import PreTestCoachingPanel from '../molecules/PreTestCoachingPanel'
import {reviewConceptGroup,type ConceptPriority} from '../../lib/conceptReview'
import {buildPreTestQuestionRows} from '../../lib/preTestReviewAnalytics'
import PreTestReviewWorkspace from './PreTestReviewWorkspace'

type Props={
  concepts:ConceptPriority[]
  subject:Subject
  questions:PracticeQuestion[]
  attempts:Attempt[]
  coaching:PreTestCoachingSnapshot|null
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
  onStartGroup:(subject:Subject,label:string,questionIds:string[])=>void
}

function displayConcept(value:string){
  return value.trim().replace(/\b[a-z]/g,letter=>letter.toUpperCase())
}

export default function PreTestConceptsView({concepts,subject,questions,attempts,coaching,onPractice,onReview,onStartGroup}:Props){
  const [selectedConcept,setSelectedConcept]=useState<string|null>(null)
  const available=useMemo(()=>questions.filter(q=>q.subject===subject),[questions,subject])
  const ids=new Set(available.map(q=>q.id))
  // Preserve the original concept assignment and historical-priority ranking.
  const ranked=concepts.filter(item=>item.questionIds.some(id=>ids.has(id))).slice(0,7)
    .sort((a,b)=>b.failureRate-a.failureRate||b.attempts-a.attempts||b.unresolved-a.unresolved||a.concept.localeCompare(b.concept))
  const active=ranked.find(item=>item.concept===selectedConcept)??ranked[0]
  const groupedQuestions=active?available.filter(q=>q.concepts?.length&&reviewConceptGroup(q.concepts,q.subject)===active.concept):[]
  const rows=buildPreTestQuestionRows(groupedQuestions,attempts)
  const insight=active?coaching?.analysis.concepts?.[active.concept]:undefined
  const stale=Boolean(coaching?.basedOnAttemptAt&&attempts.some(attempt=>attempt.createdAt>coaching.basedOnAttemptAt!))
  const options=ranked.map(item=>({
    id:item.concept,label:displayConcept(item.concept),
    score:String(item.accuracy)+'%',
    detail:String(item.correct)+' correct / '+String(item.attempts)+' attempts',
  }))

  return <AlexBox sx={{display:'grid',gap:1.25,minWidth:0}}>
    <AlexText sx={{fontSize:12.5,color:'#667085'}}>
      Original concept groups, ordered by historical errors. Select a group to see its questions or start a targeted session.
    </AlexText>
    <PreTestReviewWorkspace
      groups={options}
      selectedId={active?.concept??null}
      onSelect={setSelectedConcept}
      title={active?displayConcept(active.concept):'Concept review'}
      subtitle={active?String(active.accuracy)+'% historical success · '+String(rows.length)+' questions in this group.':'Choose a concept to begin.'}
      rows={rows}
      onStartGroup={ids=>active&&onStartGroup(subject,active.concept,ids)}
      onPractice={onPractice}
      onReview={onReview}
      details={<PreTestCoachingPanel insight={insight} rows={rows} onReview={onReview} stale={stale}/>}
    />
  </AlexBox>
}

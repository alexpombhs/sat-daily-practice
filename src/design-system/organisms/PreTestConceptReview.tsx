import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexTabs from '../atoms/AlexTabs'
import AlexText from '../atoms/AlexText'
import AlexViewToggle from '../atoms/AlexViewToggle'
import type {ConceptPriority} from '../../lib/conceptReview'
import type {PreTestCoachingSnapshot} from '../../lib/preTestCoaching'
import type {PsatScoreReport} from '../../lib/psatDomains'
import type {Attempt,PracticeQuestion,Subject} from '../../types'
import PreTestConceptsView from './PreTestConceptsView'
import PreTestSatCategoriesView from './PreTestSatCategoriesView'

type ReviewView='concepts'|'categories'
type Props={
  concepts:ConceptPriority[]
  questions:PracticeQuestion[]
  attempts:Attempt[]
  coaching:PreTestCoachingSnapshot|null
  psatResults:PsatScoreReport[]
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
  onStartGroup:(subject:Subject,label:string,questionIds:string[])=>void
}

export default function PreTestConceptReview({concepts,questions,attempts,coaching,psatResults,onPractice,onReview,onStartGroup}:Props){
  const [view,setView]=useState<ReviewView>('concepts')
  const [subject,setSubject]=useState<Subject>('math')

  return <AlexBox sx={{width:'100%',maxWidth:1220,mx:'auto',p:{xs:1.5,md:2.5},display:'grid',gap:2,minWidth:0}}>
    <AlexBox sx={{display:'flex',alignItems:{xs:'stretch',sm:'flex-end'},justifyContent:'space-between',gap:1.5,flexWrap:'wrap'}}>
      <AlexBox sx={{minWidth:0}}>
        <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:26,md:31},fontWeight:500,color:'#08275B'}}>Pre-test Review</AlexText>
        <AlexText sx={{fontSize:13,color:'#667085',mt:.45}}>
          {view==='concepts'?'Review the concepts you have missed most often.':'Review official SAT content areas and open detailed coaching when needed.'}
        </AlexText>
      </AlexBox>
      <AlexViewToggle
        value={view}
        onChange={setView}
        ariaLabel="Pre-test review view"
        options={[{value:'concepts',label:'Concepts'},{value:'categories',label:'SAT categories'}]}
      />
    </AlexBox>
    <AlexTabs
      value={subject}
      onChange={setSubject}
      aria-label="Pre-test Review subject"
      options={[{value:'math',label:'Math'},{value:'english',label:'Reading & Writing'}]}
      sx={{width:'fit-content',maxWidth:'100%'}}
    />
    {view==='concepts'
      ?<PreTestConceptsView
        concepts={concepts}
        subject={subject}
        questions={questions}
        attempts={attempts}
        onPractice={onPractice}
        onReview={onReview}
        onStartGroup={onStartGroup}
      />
      :<PreTestSatCategoriesView
        subject={subject}
        questions={questions}
        attempts={attempts}
        coaching={coaching}
        psatResults={psatResults}
        onPractice={onPractice}
        onReview={onReview}
        onStartGroup={onStartGroup}
      />}
  </AlexBox>
}

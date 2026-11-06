import {useMemo,useState} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexTabs from '../atoms/AlexTabs'
import AlexText from '../atoms/AlexText'
import {CRAFT_SKILLS,buildPreTestDomainReview,craftSubskill,reviewQuestionOrder,summarizeDomain,type CraftSubskill} from '../../lib/preTestReviewAnalytics'
import {PSAT_DOMAINS,type PsatDomainId,type PsatScoreReport} from '../../lib/psatDomains'
import type {PreTestCoachingSnapshot} from '../../lib/preTestCoaching'
import type {Attempt,PracticeQuestion,Subject} from '../../types'

type Props={
  questions:PracticeQuestion[]
  attempts:Attempt[]
  coaching:PreTestCoachingSnapshot|null
  psatResults:PsatScoreReport[]
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
  onStartCategory:(category:PsatDomainId)=>void
}
type QuestionFilter='missed'|'unseen'|'all'
type SkillFilter=CraftSubskill|'all'

const score=(value:number|null)=>value===null?'—':`${value}%`

export default function PreTestConceptReview({questions,attempts,coaching,psatResults,onPractice,onReview,onStartCategory}:Props){
  const [subject,setSubject]=useState<Subject>('english')
  const [selectedDomain,setSelectedDomain]=useState<PsatDomainId>('craft-structure')
  const [questionFilter,setQuestionFilter]=useState<QuestionFilter>('missed')
  const [skillFilter,setSkillFilter]=useState<SkillFilter>('all')
  const [showAll,setShowAll]=useState(false)
  const sections=useMemo(()=>buildPreTestDomainReview(questions,attempts,subject),[questions,attempts,subject])
  const active=sections.find(section=>section.domain===selectedDomain)??sections[0]
  const insight=active?coaching?.analysis.domains?.[active.domain]:undefined
  const subjectReports=[...psatResults].sort((a,b)=>a.year-b.year).slice(-2)
  const bands=subjectReports.filter(report=>Boolean(active&&report.bands?.[active.domain])).map(report=>`${report.year}: ${report.bands[active!.domain]}`)
  const skillStats=active?.domain==='craft-structure'
    ?(Object.keys(CRAFT_SKILLS) as CraftSubskill[]).map(key=>({
      key,meta:CRAFT_SKILLS[key],
      stats:summarizeDomain(active.domain,CRAFT_SKILLS[key].label,active.questions.filter(row=>craftSubskill(row.question)===key)),
    }))
    :[]
  const scoped=active&&skillFilter!=='all'&&active.domain==='craft-structure'
    ?{...active,questions:active.questions.filter(row=>craftSubskill(row.question)===skillFilter)}
    :active
  const items=scoped?reviewQuestionOrder(scoped,questionFilter):[]
  const displayed=showAll?items:items.slice(0,12)
  const lookup=new Map(questions.map(question=>[question.id,question]))
  const recordedAfterSnapshot=coaching?.basedOnAttemptAt
    ?attempts.some(attempt=>attempt.createdAt>coaching.basedOnAttemptAt!)
    :false

  const switchSubject=(next:Subject)=>{
    setSubject(next)
    setSelectedDomain(PSAT_DOMAINS.find(domain=>domain.subject===next)!.id)
    setSkillFilter('all')
    setQuestionFilter('missed')
    setShowAll(false)
  }
  const switchDomain=(next:PsatDomainId)=>{
    setSelectedDomain(next)
    setSkillFilter('all')
    setQuestionFilter('missed')
    setShowAll(false)
  }

  return <AlexBox sx={{width:'100%',maxWidth:1260,mx:'auto',display:'grid',gap:2.25,p:{xs:1.5,sm:2.5,lg:3}}}>
    <AlexBox sx={{display:'flex',alignItems:{xs:'stretch',sm:'flex-end'},justifyContent:'space-between',gap:2,flexWrap:'wrap'}}>
      <AlexBox>
        <AlexText sx={{fontSize:11.5,fontWeight:600,color:'#476DA6',letterSpacing:'.05em'}}>SAT CONTENT AREAS</AlexText>
        <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontWeight:500,fontSize:{xs:27,md:32},lineHeight:1.2,mt:.3}}>Pre-test Review</AlexText>
        <AlexText sx={{fontSize:13,color:'#667085',mt:.6,maxWidth:760}}>Find recurring mistakes in the eight official SAT content areas. First attempts show performance on unfamiliar questions; corrected reviews show progress.</AlexText>
      </AlexBox>
      <AlexTabs value={subject} onChange={switchSubject} aria-label="Pre-test subject" options={[{value:'english',label:'Reading & Writing'},{value:'math',label:'Math'}]} sx={{maxWidth:'100%'}}/>
    </AlexBox>

    {coaching?.analysis.headline&&<AlexBox sx={{bgcolor:'#F6F9FD',border:'1px solid #DFE9F8',borderRadius:2,p:1.75}}>
      <AlexText sx={{fontSize:12,fontWeight:600,color:'#245F9E',mb:.4}}>Individually reviewed coaching</AlexText>
      <AlexText sx={{fontSize:13,color:'#344054',lineHeight:1.55}}>{coaching.analysis.headline}</AlexText>
      {recordedAfterSnapshot&&<AlexText sx={{mt:.6,fontSize:11.5,color:'#667085'}}>New practice has been recorded since this coaching review. The category statistics below are current; the coaching notes reflect the earlier snapshot.</AlexText>}
    </AlexBox>}

    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'minmax(250px,.75fr) minmax(0,2fr)'},gap:1.75,minWidth:0,alignItems:'start'}}>
      <AlexBox component="nav" aria-label="SAT content areas" sx={{p:1.25,bgcolor:'#fff',border:'1px solid #E4E7EC',borderRadius:2,display:'grid',gap:.5}}>
        <AlexText sx={{px:1,py:.5,fontSize:11.5,fontWeight:600,color:'#667085'}}>SELECT CONTENT AREA</AlexText>
        {sections.map(section=>{
          const selected=active?.domain===section.domain
          return <AlexButtonBase key={section.domain} onClick={()=>switchDomain(section.domain)}
            aria-current={selected?'true':undefined}
            sx={{width:'100%',display:'grid',gap:.45,textAlign:'left',px:1.25,py:1.1,borderRadius:1.6,bgcolor:selected?'#EEF5FF':'transparent',border:selected?'1px solid #B6CBE7':'1px solid transparent','&:hover':{bgcolor:'#F5F8FD'}}}>
            <AlexBox sx={{display:'flex',justifyContent:'space-between',gap:1.5,alignItems:'center'}}>
              <AlexText sx={{fontWeight:600,fontSize:13.5,color:selected?'#12477F':'#344054'}}>{section.label}</AlexText>
              <AlexText sx={{fontWeight:600,fontSize:12.5,color:'#344054',whiteSpace:'nowrap'}}>{score(section.firstAccuracy)}</AlexText>
            </AlexBox>
            <AlexText sx={{fontSize:11.5,color:'#667085'}}>{section.attempted}/{section.questions.length} practiced · {section.firstMisses} first-try misses</AlexText>
          </AlexButtonBase>
        })}
      </AlexBox>

      {active&&<AlexBox sx={{minWidth:0,display:'grid',gap:1.6}}>
        <AlexBox sx={{border:'1px solid #E4E7EC',bgcolor:'#fff',borderRadius:2,p:{xs:1.5,md:2}}}>
          <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,flexWrap:'wrap'}}>
            <AlexText component="h2" sx={{fontSize:17,fontWeight:600,color:'#08275B'}}>{active.label}</AlexText>
            <AlexButton onClick={()=>onStartCategory(active.domain)} sx={{fontSize:12.5,minHeight:34}}>Practice this category</AlexButton>
          </AlexBox>
          {bands.length>0&&<AlexText sx={{fontSize:11.5,color:'#667085',mt:.55}}>Official PSAT bands · {bands.join(' · ')}</AlexText>}
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1.5,mt:1.75}}>
            {[
              {label:'First-try accuracy',value:score(active.firstAccuracy),detail:`${active.firstCorrect} of ${active.attempted} new`},
              {label:'Most recent answers',value:score(active.latestAccuracy),detail:'Includes reviewed attempts'},
              {label:'First misses',value:String(active.firstMisses),detail:`${active.reviewedCorrections} later corrected`},
              {label:'Unseen questions',value:String(active.unseen),detail:`${active.advancedAttempted} advanced tried`},
            ].map(metric=><AlexBox key={metric.label} sx={{minWidth:0}}>
              <AlexText sx={{fontSize:11.5,color:'#667085'}}>{metric.label}</AlexText>
              <AlexText sx={{fontSize:22,fontWeight:600,color:'#08275B',my:.15}}>{metric.value}</AlexText>
              <AlexText sx={{fontSize:11,color:'#667085'}}>{metric.detail}</AlexText>
            </AlexBox>)}
          </AlexBox>
        </AlexBox>

        {active.domain==='craft-structure'&&<AlexBox sx={{border:'1px solid #E4E7EC',bgcolor:'#fff',borderRadius:2,p:1.5}}>
          <AlexText sx={{fontSize:13,fontWeight:600,color:'#344054',mb:1}}>Craft and Structure · subskills</AlexText>
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(3,minmax(0,1fr))'},gap:1}}>
            {skillStats.map(item=><AlexButtonBase key={item.key} onClick={()=>{setSkillFilter(prev=>prev===item.key?'all':item.key);setQuestionFilter('missed');setShowAll(false)}}
              sx={{p:1.1,bgcolor:skillFilter===item.key?'#EEF5FF':'#FAFBFC',border:skillFilter===item.key?'1px solid #8EAED5':'1px solid #E4E7EC',borderRadius:1.5,textAlign:'left',display:'grid',gap:.3,alignContent:'start',minWidth:0}}>
              <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{item.meta.label}</AlexText>
              <AlexText sx={{fontSize:18,fontWeight:600,color:'#08275B'}}>{score(item.stats.firstAccuracy)}</AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085'}}>{item.stats.attempted} distinct · {item.stats.firstMisses} first misses</AlexText>
            </AlexButtonBase>)}
          </AlexBox>
        </AlexBox>}

        <AlexAccordion defaultExpanded summary={<AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:600,color:'#08275B'}}>Personalized coaching notes</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.2}}>Answer-specific patterns and strategies, reviewed against question history</AlexText>
        </AlexBox>}>
          {insight?<AlexBox sx={{display:'grid',gap:1.7}}>
            <AlexText sx={{fontSize:13,color:'#344054',lineHeight:1.55}}>{insight.summary}</AlexText>
            <AlexBox sx={{bgcolor:'#F7FAF7',borderLeft:'2px solid #71A18A',px:1.5,py:1}}>
              <AlexText sx={{fontSize:12,fontWeight:600,color:'#344054'}}>What is going well</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#475467',mt:.25}}>{insight.strength}</AlexText>
            </AlexBox>
            {insight.focus.map((focus,index)=><AlexBox key={index} sx={{display:'grid',gap:.7,borderTop:index?'1px solid #E9EDF3':undefined,pt:index?1.6:0}}>
              <AlexText sx={{fontSize:13.5,fontWeight:600,color:'#08275B'}}>{focus.title}</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{focus.observation}</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#344054',lineHeight:1.55}}><AlexText component="span" sx={{fontWeight:600}}>Try this: </AlexText>{focus.strategy}</AlexText>
              <AlexBox sx={{display:'grid',gap:.5}}>
                {focus.examples.filter(example=>lookup.has(example.questionId)).map(example=><AlexBox key={example.questionId} sx={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:1.25,py:.7,borderTop:'1px solid #F0F2F6'}}>
                  <AlexBox sx={{minWidth:0}}>
                    <AlexText sx={{fontSize:11.5,fontWeight:600,color:'#344054'}}>{questionLabel(lookup.get(example.questionId)!)}</AlexText>
                    <AlexText sx={{fontSize:12,color:'#667085',mt:.2,lineHeight:1.4}}>{example.note}</AlexText>
                  </AlexBox>
                  <AlexButton tone="quiet" onClick={()=>onReview(lookup.get(example.questionId)!)} sx={{fontSize:11.5,p:0,minHeight:26,flexShrink:0}}>Review</AlexButton>
                </AlexBox>)}
              </AlexBox>
            </AlexBox>)}
            <AlexText sx={{fontSize:11.5,color:'#98A2B3'}}>Coaching notes are a dated review of actual answer choices, not automatic diagnoses. New questions test whether skills transfer.</AlexText>
          </AlexBox>:<AlexText sx={{fontSize:13,color:'#667085',lineHeight:1.55}}>A reviewed, individual coaching report is not saved for this account yet. The live SAT category results and question history remain available below.</AlexText>}
        </AlexAccordion>

        <AlexBox sx={{border:'1px solid #E4E7EC',bgcolor:'#fff',borderRadius:2,p:{xs:1.35,md:1.75}}}>
          <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1.5,flexWrap:'wrap',mb:1.25}}>
            <AlexBox>
              <AlexText component="h3" sx={{fontSize:14,fontWeight:600,color:'#08275B'}}>Questions to review</AlexText>
              <AlexText sx={{fontSize:12,color:'#667085',mt:.15}}>Original answers distinguish new-question mistakes from corrections.</AlexText>
            </AlexBox>
            <AlexTabs value={questionFilter} options={[{value:'missed',label:'First missed'},{value:'unseen',label:'Unseen'},{value:'all',label:'All'}]} onChange={value=>{setQuestionFilter(value);setShowAll(false)}} aria-label="Review question filter"/>
          </AlexBox>
          {active.domain==='craft-structure'&&<AlexBox sx={{maxWidth:260,mb:1.25}}>
            <AlexDropdown id="review-craft-subskill" label="Subskill" value={skillFilter} onChange={value=>{setSkillFilter(value);setShowAll(false)}} options={[{value:'all',label:'All subskills'},...skillStats.map(s=>({value:s.key,label:s.meta.label}))]}/>
          </AlexBox>}
          {displayed.length===0&&<AlexText sx={{fontSize:12.5,color:'#667085',py:2}}>No questions in this group. Try Unseen or All.</AlexText>}
          {displayed.map((item,index)=><AlexBox key={item.question.id} sx={{py:1,borderTop:index?'1px solid #EFF1F5':undefined,display:'flex',justifyContent:'space-between',alignItems:'center',gap:1.25,flexWrap:'wrap'}}>
            <AlexBox sx={{minWidth:0}}>
              <AlexText sx={{fontWeight:600,fontSize:12.5,color:'#344054'}}>{questionLabel(item.question)}</AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>{!item.first?'Not yet attempted':`First: ${item.first.correct?'correct':`chose ${item.first.selectedAnswer} · answer ${item.first.correctAnswer}`}`}
                {item.first&&item.attemptCount>1?` · ${item.last?.correct?'correct on latest review':'latest review missed'}`:''}
                {' · '}{item.question.difficulty??'Unrated'}</AlexText>
            </AlexBox>
            <AlexBox sx={{display:'flex',gap:.75}}>
              {item.first&&<AlexButton tone="secondary" sx={{minHeight:30,fontSize:11.5}} onClick={()=>onReview(item.question)}>Explanation</AlexButton>}
              <AlexButton sx={{minHeight:30,fontSize:11.5}} onClick={()=>onPractice(item.question)}>Open</AlexButton>
            </AlexBox>
          </AlexBox>)}
          {!showAll&&items.length>12&&<AlexButton tone="quiet" onClick={()=>setShowAll(true)} sx={{fontSize:12,mt:1}}>Show all {items.length} questions</AlexButton>}
        </AlexBox>
      </AlexBox>}
    </AlexBox>
  </AlexBox>
}

function questionLabel(question:PracticeQuestion){
  return `${question.practiceTestId.replace('practice-test-','Test ')} · ${question.module.toUpperCase()} · Q${question.number}`
}

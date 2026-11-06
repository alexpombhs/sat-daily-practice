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
  subject:Subject
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

export default function PreTestSatCategoriesView({subject,questions,attempts,coaching,psatResults,onPractice,onReview,onStartCategory}:Props){
  const [selectedDomain,setSelectedDomain]=useState<PsatDomainId>('craft-structure')
  const [questionFilter,setQuestionFilter]=useState<QuestionFilter>('missed')
  const [skillFilter,setSkillFilter]=useState<SkillFilter>('all')
  const [questionsOpen,setQuestionsOpen]=useState(false)
  const [showAll,setShowAll]=useState(false)
  const sections=useMemo(()=>buildPreTestDomainReview(questions,attempts,subject),[questions,attempts,subject])
  const active=sections.find(section=>section.domain===selectedDomain)??sections[0]
  const insight=active?coaching?.analysis.domains?.[active.domain]:undefined
  const relevantBands=[...psatResults].sort((a,b)=>a.year-b.year).slice(-2)
    .filter(report=>Boolean(active&&report.bands?.[active.domain]))
    .map(report=>`${report.year}: ${report.bands[active!.domain]}`)
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
  const displayed=showAll?items:items.slice(0,8)
  const lookup=useMemo(()=>new Map(questions.map(question=>[question.id,question])),[questions])
  const recordedAfterSnapshot=Boolean(coaching?.basedOnAttemptAt&&attempts.some(a=>a.createdAt>coaching.basedOnAttemptAt!))

  const chooseDomain=(id:PsatDomainId)=>{
    setSelectedDomain(id)
    setSkillFilter('all')
    setQuestionFilter('missed')
    setQuestionsOpen(false)
    setShowAll(false)
  }

  return <AlexBox sx={{display:'grid',gap:1.5,minWidth:0}}>
    <AlexBox sx={{display:'grid',gap:.75}}>
      <AlexText sx={{fontSize:12,color:'#667085'}}>Choose a SAT reporting category</AlexText>
      <AlexBox component="nav" aria-label="SAT reporting categories" sx={{
        display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',lg:'repeat(4,minmax(0,1fr))'},gap:1,
      }}>
        {sections.map(section=>{
          const selected=active?.domain===section.domain
          return <AlexButtonBase key={section.domain} onClick={()=>chooseDomain(section.domain)}
            aria-current={selected?'true':undefined}
            sx={{minWidth:0,display:'grid',gap:.4,alignContent:'space-between',textAlign:'left',p:{xs:1,sm:1.4},minHeight:87,
              border:selected?'1px solid #7799CE':'1px solid #E4E7EC',borderRadius:2,
              backgroundColor:selected?'#EEF5FF':'#fff','&:hover':{backgroundColor:'#F4F8FF'}}}>
            <AlexText sx={{fontWeight:600,fontSize:12.5,color:selected?'#12477F':'#344054',lineHeight:1.35}}>{section.label}</AlexText>
            <AlexBox sx={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:1}}>
              <AlexText sx={{fontSize:17,fontWeight:600,color:'#08275B'}}>{score(section.firstAccuracy)}</AlexText>
              <AlexText sx={{fontSize:10.5,color:'#667085'}}>{section.attempted} tried</AlexText>
            </AlexBox>
          </AlexButtonBase>
        })}
      </AlexBox>
    </AlexBox>

    {active&&<>
      <AlexBox sx={{border:'1px solid #E4E7EC',backgroundColor:'#fff',borderRadius:2,p:{xs:1.5,sm:2},display:'grid',gap:1.1}}>
        <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
          <AlexText component="h2" sx={{fontSize:16,fontWeight:600,color:'#08275B'}}>{active.label}</AlexText>
          <AlexButton sx={{fontSize:12,minHeight:34}} onClick={()=>onStartCategory(active.domain)}>Practice category</AlexButton>
        </AlexBox>
        {relevantBands.length>0&&<AlexText sx={{fontSize:11.5,color:'#667085'}}>PSAT score bands · {relevantBands.join(' · ')}</AlexText>}
        <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:1.2,borderTop:'1px solid #EDF0F5',pt:1.1}}>
          {[
            {label:'First try',value:score(active.firstAccuracy),detail:`${active.attempted} distinct`},
            {label:'First missed',value:String(active.firstMisses),detail:`${active.reviewedCorrections} corrected`},
            {label:'Not yet tried',value:String(active.unseen),detail:'In question bank'},
          ].map(item=><AlexBox key={item.label} sx={{minWidth:0}}>
            <AlexText sx={{fontSize:11.5,color:'#667085'}}>{item.label}</AlexText>
            <AlexText sx={{fontSize:21,fontWeight:600,color:'#08275B',lineHeight:1.45}}>{item.value}</AlexText>
            <AlexText sx={{fontSize:10.5,color:'#98A2B3'}}>{item.detail}</AlexText>
          </AlexBox>)}
        </AlexBox>
        {insight?.focus[0]&&<AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.5}}>
          <AlexText component="span" sx={{fontWeight:600}}>Review focus: </AlexText>{insight.focus[0].title}
        </AlexText>}
      </AlexBox>

      {active.domain==='craft-structure'&&<AlexAccordion
        key={active.domain+'-skills'}
        summary={<AlexBox>
          <AlexText sx={{fontWeight:600,fontSize:13.5,color:'#08275B'}}>Subskill breakdown</AlexText>
          <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>Words in Context · Text Structure and Purpose · Cross-Text Connections</AlexText>
        </AlexBox>}>
        <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(3,minmax(0,1fr))'},gap:1}}>
          {skillStats.map(item=><AlexButtonBase key={item.key} onClick={()=>{
            setSkillFilter(item.key);setQuestionFilter('missed');setQuestionsOpen(true);setShowAll(false)
          }} sx={{display:'grid',gap:.3,textAlign:'left',border:skillFilter===item.key?'1px solid #7799CE':'1px solid #E4E7EC',
            borderRadius:1.5,p:1.1,backgroundColor:skillFilter===item.key?'#EEF5FF':'#FAFBFC'}}>
            <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{item.meta.label}</AlexText>
            <AlexText sx={{fontSize:17,fontWeight:600,color:'#08275B'}}>{score(item.stats.firstAccuracy)}</AlexText>
            <AlexText sx={{fontSize:11.5,color:'#667085'}}>{item.stats.attempted} tried · {item.stats.firstMisses} missed</AlexText>
          </AlexButtonBase>)}
        </AlexBox>
        <AlexText sx={{fontSize:11.5,color:'#667085',mt:1}}>Select a subskill to open its missed questions below. Subskills help interpret an already reviewed SAT category.</AlexText>
      </AlexAccordion>}

      <AlexAccordion key={active.domain+'-coaching'} summary={<AlexBox>
        <AlexText sx={{fontWeight:600,fontSize:13.5,color:'#08275B'}}>Personalized coaching</AlexText>
        <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>{insight?`${insight.focus.length} focused strategies with question examples`:'No individual coaching report saved for this account'}</AlexText>
      </AlexBox>}>
        {insight?<AlexBox sx={{display:'grid',gap:1.15}}>
          <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{insight.summary}</AlexText>
          <AlexBox sx={{bgcolor:'#F8FAF8',borderLeft:'2px solid #85A995',p:1.2}}>
            <AlexText sx={{fontSize:12,fontWeight:600,color:'#344054'}}>What is going well</AlexText>
            <AlexText sx={{fontSize:12.5,color:'#667085',mt:.25,lineHeight:1.5}}>{insight.strength}</AlexText>
          </AlexBox>
          {insight.focus.map((focus,index)=><AlexAccordion key={focus.title} summary={<AlexBox sx={{minWidth:0}}>
            <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{index+1}. {focus.title}</AlexText>
          </AlexBox>}>
            <AlexBox sx={{display:'grid',gap:1}}>
              <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{focus.observation}</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#344054',lineHeight:1.55}}>
                <AlexText component="span" sx={{fontWeight:600}}>How to improve: </AlexText>{focus.strategy}
              </AlexText>
              {focus.examples.filter(example=>lookup.has(example.questionId)).map(example=><AlexBox key={example.questionId}
                sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1.5,py:.7,borderTop:'1px solid #EDF0F5'}}>
                <AlexBox sx={{minWidth:0}}>
                  <AlexText sx={{fontSize:11.5,fontWeight:600,color:'#344054'}}>{questionLabel(lookup.get(example.questionId)!)}</AlexText>
                  <AlexText sx={{fontSize:12,color:'#667085',mt:.2,lineHeight:1.45}}>{example.note}</AlexText>
                </AlexBox>
                <AlexButton tone="secondary" sx={{fontSize:11.5,minHeight:30,flexShrink:0}} onClick={()=>onReview(lookup.get(example.questionId)!)}>Review</AlexButton>
              </AlexBox>)}
            </AlexBox>
          </AlexAccordion>)}
          {recordedAfterSnapshot&&<AlexText sx={{fontSize:11.5,color:'#667085'}}>More practice has been recorded since these notes were written. Live statistics above include the newer answers.</AlexText>}
          <AlexText sx={{fontSize:11,color:'#98A2B3'}}>Individual coaching is a reviewed snapshot of answer choices, not an automatic diagnosis.</AlexText>
        </AlexBox>:<AlexText sx={{fontSize:12.5,color:'#667085'}}>Practice history and SAT category statistics are available for this account. Individual written coaching must be reviewed and saved separately.</AlexText>}
      </AlexAccordion>

      <AlexAccordion key={active.domain+'-questions'} expanded={questionsOpen} onChange={(_event,expanded)=>setQuestionsOpen(expanded)}
        summary={<AlexBox>
          <AlexText sx={{fontSize:13.5,fontWeight:600,color:'#08275B'}}>Review and practice questions</AlexText>
          <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>{active.firstMisses} first-try misses · {active.unseen} unseen questions</AlexText>
        </AlexBox>}>
        <AlexBox sx={{display:'grid',gap:1}}>
          <AlexTabs
            value={questionFilter}
            onChange={value=>{setQuestionFilter(value);setShowAll(false)}}
            options={[{value:'missed',label:'First missed'},{value:'unseen',label:'Unseen'},{value:'all',label:'All'}]}
            aria-label="Choose review questions"
          />
          {active.domain==='craft-structure'&&<AlexBox sx={{maxWidth:280,mt:.65}}>
            <AlexDropdown id="review-craft-subskill" label="Subskill" value={skillFilter}
              onChange={value=>{setSkillFilter(value);setShowAll(false)}}
              options={[{value:'all',label:'All subskills'},...skillStats.map(item=>({value:item.key,label:item.meta.label}))]}/>
          </AlexBox>}
          {displayed.length===0&&<AlexText sx={{fontSize:12.5,color:'#667085',py:1.5}}>No questions match these filters. Try another status or subskill.</AlexText>}
          {displayed.map((item,index)=><AlexBox key={item.question.id}
            sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,flexWrap:'wrap',
              py:1,borderTop:index?'1px solid #EEF0F4':undefined}}>
            <AlexBox sx={{minWidth:0}}>
              <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{questionLabel(item.question)}</AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085',mt:.25}}>
                {!item.first?'Unseen':item.first.correct?'Correct on first try':`First: ${item.first.selectedAnswer} · Answer: ${item.first.correctAnswer}`}
                {item.first&&item.attemptCount>1?` · ${item.last?.correct?'Corrected on review':'Still missed'}`:''}
                {' · '}{item.question.difficulty??'Unrated'}
              </AlexText>
            </AlexBox>
            <AlexBox sx={{display:'flex',gap:.65}}>
              {item.first&&<AlexButton tone="secondary" sx={{minHeight:30,fontSize:11.5}} onClick={()=>onReview(item.question)}>Explanation</AlexButton>}
              <AlexButton sx={{minHeight:30,fontSize:11.5}} onClick={()=>onPractice(item.question)}>Open</AlexButton>
            </AlexBox>
          </AlexBox>)}
          {!showAll&&items.length>8&&<AlexButton tone="quiet" sx={{fontSize:12,justifySelf:'start'}} onClick={()=>setShowAll(true)}>Show all {items.length} questions</AlexButton>}
        </AlexBox>
      </AlexAccordion>
    </>}
  </AlexBox>
}

function questionLabel(question:PracticeQuestion){
  return `${question.practiceTestId.replace('practice-test-','Test ')} · ${question.module.toUpperCase()} · Q${question.number}`
}

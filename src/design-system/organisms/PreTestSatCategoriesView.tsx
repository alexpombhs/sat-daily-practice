
import {useMemo,useState} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexText from '../atoms/AlexText'
import {CRAFT_SKILLS,buildPreTestDomainReview,craftSubskill,summarizeDomain,type CraftSubskill} from '../../lib/preTestReviewAnalytics'
import {PSAT_DOMAINS,type PsatDomainId,type PsatScoreReport} from '../../lib/psatDomains'
import type {PreTestCoachingSnapshot} from '../../lib/preTestCoaching'
import type {Attempt,PracticeQuestion,Subject} from '../../types'
import PreTestReviewWorkspace from './PreTestReviewWorkspace'

type Props={
  subject:Subject
  questions:PracticeQuestion[]
  attempts:Attempt[]
  coaching:PreTestCoachingSnapshot|null
  psatResults:PsatScoreReport[]
  onPractice:(question:PracticeQuestion)=>void
  onReview:(question:PracticeQuestion)=>void
  onStartGroup:(subject:Subject,label:string,ids:string[])=>void
}

export default function PreTestSatCategoriesView({subject,questions,attempts,coaching,psatResults,onPractice,onReview,onStartGroup}:Props){
  const [selectedDomain,setSelectedDomain]=useState<PsatDomainId>('craft-structure')
  const [skillFilter,setSkillFilter]=useState<CraftSubskill|'all'>('all')
  const sections=useMemo(()=>buildPreTestDomainReview(questions,attempts,subject),[questions,attempts,subject])
  const active=sections.find(section=>section.domain===selectedDomain)??sections[0]
  const insight=active?coaching?.analysis.domains?.[active.domain]:undefined
  const labels=useMemo(()=>new Map(questions.map(question=>[question.id,question])),[questions])
  const reports=[...psatResults].sort((a,b)=>a.year-b.year).slice(-2)
  const bands=reports.filter(item=>Boolean(active&&item.bands?.[active.domain]))
    .map(item=>String(item.year)+': '+item.bands[active!.domain])
  const skillStats=active?.domain==='craft-structure'
    ?(Object.keys(CRAFT_SKILLS) as CraftSubskill[]).map(key=>({
      key,label:CRAFT_SKILLS[key].label,
      summary:summarizeDomain(active.domain,CRAFT_SKILLS[key].label,active.questions.filter(row=>craftSubskill(row.question)===key)),
    }))
    :[]
  const rows=active&&active.domain==='craft-structure'&&skillFilter!=='all'
    ?active.questions.filter(row=>craftSubskill(row.question)===skillFilter)
    :active?.questions??[]
  const title=active?.label??'SAT category'
  const groupLabel=active?.domain==='craft-structure'&&skillFilter!=='all'
    ?title+' · '+CRAFT_SKILLS[skillFilter].label
    :title
  const stale=Boolean(coaching?.basedOnAttemptAt&&attempts.some(attempt=>attempt.createdAt>coaching.basedOnAttemptAt!))
  const options=sections.map(item=>({
    id:item.domain,label:item.label,
    score:item.firstAccuracy===null?'—':String(item.firstAccuracy)+'%',
    detail:String(item.attempted)+'/'+String(item.questions.length)+' practiced · '+String(item.firstMisses)+' first misses',
  }))

  return <AlexBox sx={{display:'grid',gap:1.2,minWidth:0}}>
    <AlexText sx={{fontSize:12.5,color:'#667085'}}>
      Official SAT reporting categories. Select a group to review individual questions or begin a focused session.
    </AlexText>
    <PreTestReviewWorkspace
      groups={options}
      selectedId={active?.domain??null}
      onSelect={id=>{setSelectedDomain(id as PsatDomainId);setSkillFilter('all')}}
      title={groupLabel}
      subtitle={bands.length?'Official PSAT bands · '+bands.join(' · '):'Performance on questions assigned to this official SAT category.'}
      rows={rows}
      onStartGroup={ids=>active&&onStartGroup(subject,groupLabel,ids)}
      onPractice={onPractice}
      onReview={onReview}
      details={<AlexBox sx={{display:'grid',gap:1,mt:.15}}>
        {active?.domain==='craft-structure'&&<AlexAccordion summary={<AlexBox>
          <AlexText sx={{fontWeight:600,fontSize:13.5,color:'#08275B'}}>Subskill breakdown</AlexText>
          <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>Words in Context, Structure and Purpose, Cross-Text Connections</AlexText>
        </AlexBox>}>
          <AlexBox sx={{display:'grid',gap:1}}>
            <AlexDropdown id="pretest-craft-skill" label="Review subskill"
              value={skillFilter}
              options={[{value:'all',label:'All Craft and Structure'},...skillStats.map(item=>({value:item.key,label:item.label}))]}
              onChange={setSkillFilter}/>
            <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(3,minmax(0,1fr))'},gap:1,mt:.25}}>
              {skillStats.map(item=><AlexBox key={item.key} sx={{border:'1px solid #E4E7EC',borderRadius:1.4,p:1}}>
                <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{item.label}</AlexText>
                <AlexText sx={{fontSize:16,fontWeight:600,color:'#08275B'}}>
                  {item.summary.firstAccuracy===null?'—':String(item.summary.firstAccuracy)+'%'}
                </AlexText>
                <AlexText sx={{fontSize:11.5,color:'#667085'}}>
                  {item.summary.attempted} attempted · {item.summary.firstMisses} first misses
                </AlexText>
              </AlexBox>)}
            </AlexBox>
            <AlexText sx={{fontSize:11.5,color:'#667085'}}>Selecting a subskill filters both the individual questions and the group practice session to that subskill.</AlexText>
          </AlexBox>
        </AlexAccordion>}
        <AlexAccordion summary={<AlexBox>
          <AlexText sx={{fontWeight:600,fontSize:13.5,color:'#08275B'}}>Personalized coaching</AlexText>
          <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>{insight?String(insight.focus.length)+' strategies based on reviewed answers':'No individual coaching report saved'}</AlexText>
        </AlexBox>}>
          {insight?<AlexBox sx={{display:'grid',gap:1.15}}>
            <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{insight.summary}</AlexText>
            <AlexBox sx={{bgcolor:'#F8FAF8',borderLeft:'2px solid #85A995',p:1.2}}>
              <AlexText sx={{fontSize:12,fontWeight:600,color:'#344054'}}>What is going well</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#667085',mt:.25}}>{insight.strength}</AlexText>
            </AlexBox>
            {insight.focus.map((focus,index)=><AlexAccordion key={focus.title} summary={<AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>{index+1}. {focus.title}</AlexText>}>
              <AlexBox sx={{display:'grid',gap:1}}>
                <AlexText sx={{fontSize:12.5,color:'#475467',lineHeight:1.55}}>{focus.observation}</AlexText>
                <AlexText sx={{fontSize:12.5,color:'#344054',lineHeight:1.55}}>
                  <AlexText component="span" sx={{fontWeight:600}}>How to improve: </AlexText>{focus.strategy}
                </AlexText>
                {focus.examples.filter(example=>labels.has(example.questionId)).map(example=><AlexBox key={example.questionId}
                  sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1.2,py:.65,borderTop:'1px solid #EDF0F5'}}>
                  <AlexBox sx={{minWidth:0}}>
                    <AlexText sx={{fontSize:11.5,fontWeight:600,color:'#344054'}}>
                      {'Test '+labels.get(example.questionId)!.practiceTestId.replace('practice-test-','')+' · Q'+labels.get(example.questionId)!.number}
                    </AlexText>
                    <AlexText sx={{fontSize:12,color:'#667085',mt:.2,lineHeight:1.45}}>{example.note}</AlexText>
                  </AlexBox>
                  <AlexButton tone="secondary" sx={{fontSize:11.5,minHeight:30,flexShrink:0}}
                    onClick={()=>onReview(labels.get(example.questionId)!)}>Review</AlexButton>
                </AlexBox>)}
              </AlexBox>
            </AlexAccordion>)}
            {stale&&<AlexText sx={{fontSize:11.5,color:'#667085'}}>More questions have been answered since this coaching snapshot. Live statistics above include the new results.</AlexText>}
            <AlexText sx={{fontSize:11,color:'#98A2B3'}}>These notes were reviewed for this account; they are not an automatic diagnosis.</AlexText>
          </AlexBox>:<AlexText sx={{fontSize:12.5,color:'#667085'}}>Live SAT category statistics remain available. Individual written coaching must be reviewed and saved separately.</AlexText>}
        </AlexAccordion>
      </AlexBox>}
    />
  </AlexBox>
}

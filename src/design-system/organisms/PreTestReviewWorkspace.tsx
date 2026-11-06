
import {useState,type ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexTabs from '../atoms/AlexTabs'
import AlexText from '../atoms/AlexText'
import {orderedGroupSessionQuestionIds,sortReviewQuestionRows,type ReviewQuestion} from '../../lib/preTestReviewAnalytics'
import type {PracticeQuestion} from '../../types'

export type PreTestGroupOption={id:string;label:string;score:string;detail:string}
type Props={
  groups:PreTestGroupOption[]
  selectedId:string|null
  onSelect:(id:string)=>void
  title:string
  subtitle:string
  rows:ReviewQuestion[]
  onStartGroup:(ids:string[])=>void
  onPractice:(q:PracticeQuestion)=>void
  onReview:(q:PracticeQuestion)=>void
  details?:ReactNode
}
type QuestionFilter='all'|'missed'|'unseen'

export default function PreTestReviewWorkspace({groups,selectedId,onSelect,title,subtitle,rows,onStartGroup,onPractice,onReview,details}:Props){
  const [filter,setFilter]=useState<QuestionFilter>('all')
  const [showAll,setShowAll]=useState(false)
  const seen=rows.filter(item=>item.first)
  const firstCorrect=seen.filter(item=>item.first?.correct).length
  const firstAccuracy=seen.length?Math.round(100*firstCorrect/seen.length):null
  const visible=sortReviewQuestionRows(rows,filter)
  const shown=showAll?visible:visible.slice(0,8)

  return <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',md:'minmax(245px,.86fr) minmax(0,2fr)'},alignItems:'start',gap:1.5,minWidth:0}}>
    <AlexBox component="nav" aria-label="Pre-test review groups" sx={{border:'1px solid #E4E7EC',borderRadius:2,p:1.25,bgcolor:'#fff',display:'grid',gap:.4,minWidth:0}}>
      <AlexText sx={{px:.8,py:.55,fontSize:11.5,fontWeight:600,color:'#667085'}}>REVIEW GROUPS</AlexText>
      {groups.length===0&&<AlexText sx={{fontSize:12.5,color:'#667085',p:1}}>No groups with practice history in this subject.</AlexText>}
      {groups.map(group=>{
        const selected=group.id===selectedId
        return <AlexButtonBase key={group.id} onClick={()=>{onSelect(group.id);setFilter('all');setShowAll(false)}}
          aria-current={selected?'true':undefined}
          sx={{display:'grid',gridTemplateRows:'minmax(48px,1fr) auto',rowGap:.7,
            p:1.15,textAlign:'left',width:'100%',minWidth:0,minHeight:116,borderRadius:1.5,
            border:selected?'1px solid #96B6DC':'1px solid transparent',
            borderBottom:selected?'1px solid #96B6DC':'1px solid #EEF0F3',
            bgcolor:selected?'#EFF6FF':'#fff','&:hover':{bgcolor:'#F5F9FE'}}}>
          <AlexBox sx={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 52px',alignItems:'start',columnGap:1,minWidth:0}}>
            <AlexText sx={{fontWeight:600,fontSize:13,lineHeight:1.4,color:selected?'#0D477F':'#344054',overflowWrap:'break-word'}}>{group.label}</AlexText>
            <AlexText sx={{fontWeight:600,fontSize:12.5,lineHeight:1.4,color:'#48647E',whiteSpace:'nowrap',textAlign:'right',fontVariantNumeric:'tabular-nums'}}>{group.score}</AlexText>
          </AlexBox>
          <AlexText sx={{fontSize:11.25,lineHeight:1.4,color:'#667085',minHeight:30}}>{group.detail}</AlexText>
        </AlexButtonBase>
      })}
    </AlexBox>
    <AlexBox key={selectedId??'empty'} sx={{border:'1px solid #E4E7EC',borderRadius:2,bgcolor:'#fff',p:{xs:1.4,sm:1.9},display:'grid',gap:1.35,minWidth:0}}>
      {selectedId?<>
        <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:{xs:'flex-start',sm:'center'},gap:1.25,flexWrap:'wrap'}}>
          <AlexBox sx={{minWidth:0}}>
            <AlexText component="h2" sx={{fontSize:{xs:17,md:19},fontWeight:600,color:'#08275B'}}>{title}</AlexText>
            <AlexText sx={{fontSize:12,color:'#667085',mt:.4,lineHeight:1.45}}>{subtitle}</AlexText>
          </AlexBox>
          <AlexButton disabled={rows.length===0} sx={{fontSize:12,minHeight:34,whiteSpace:'nowrap'}}
            onClick={()=>onStartGroup(orderedGroupSessionQuestionIds(rows))}>Start group session</AlexButton>
        </AlexBox>
        <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:1,borderTop:'1px solid #EDF0F5',pt:1.2}}>
          {[
            {label:'First-try accuracy',value:firstAccuracy===null?'—':String(firstAccuracy)+'%',detail:String(seen.length)+' attempted'},
            {label:'First-try misses',value:String(seen.length-firstCorrect),detail:'On distinct questions'},
            {label:'Not yet attempted',value:String(rows.length-seen.length),detail:String(rows.length)+' in group'},
          ].map(item=><AlexBox key={item.label} sx={{minWidth:0}}>
            <AlexText sx={{fontSize:11.5,color:'#667085'}}>{item.label}</AlexText>
            <AlexText sx={{fontSize:20,fontWeight:600,color:'#08275B',lineHeight:1.45}}>{item.value}</AlexText>
            <AlexText sx={{fontSize:10.5,color:'#98A2B3'}}>{item.detail}</AlexText>
          </AlexBox>)}
        </AlexBox>
        {details}
        <AlexBox sx={{borderTop:'1px solid #EDF0F5',pt:1.3,display:'grid',gap:1}}>
          <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,flexWrap:'wrap'}}>
            <AlexBox>
              <AlexText component="h3" sx={{fontSize:14,fontWeight:600,color:'#08275B'}}>Individual questions</AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085'}}>Review explanations or practice one question at a time.</AlexText>
            </AlexBox>
            <AlexTabs value={filter} onChange={next=>{setFilter(next);setShowAll(false)}}
              options={[{value:'all',label:'All'},{value:'missed',label:'First missed'},{value:'unseen',label:'Unseen'}]}
              aria-label="Question history filter"
              sx={{'& .MuiTab-root':{minHeight:34,px:1.2,py:.5,fontSize:12},minHeight:34}}/>
          </AlexBox>
          {shown.length===0&&<AlexText sx={{fontSize:12.5,color:'#667085',py:1.5}}>No questions match this filter. Try All or another group.</AlexText>}
          {shown.map((row,index)=><AlexBox key={row.question.id}
            sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1.1,flexWrap:'wrap',py:1,borderTop:index?'1px solid #EEF1F5':undefined}}>
            <AlexBox sx={{minWidth:0}}>
              <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054'}}>
                {'Test '+row.question.practiceTestId.replace('practice-test-','')+' · '+row.question.module.toUpperCase()+' · Q'+row.question.number}
              </AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085',mt:.2}}>
                {!row.first?'Not attempted':row.first.correct?'First try correct':'First try missed · '+row.attemptCount+' attempts'}
                {row.first&&row.attemptCount>1?' · '+(row.last?.correct?'Correct on latest review':'Latest review missed'):''}
                {' · '}{row.question.difficulty??'Unrated'}
              </AlexText>
            </AlexBox>
            <AlexBox sx={{display:'flex',gap:.65}}>
              {row.first&&<AlexButton tone="secondary" onClick={()=>onReview(row.question)} sx={{fontSize:11.5,minHeight:30}}>Review</AlexButton>}
              <AlexButton onClick={()=>onPractice(row.question)} sx={{fontSize:11.5,minHeight:30}}>Practice</AlexButton>
            </AlexBox>
          </AlexBox>)}
          {!showAll&&visible.length>8&&<AlexButton tone="quiet" onClick={()=>setShowAll(true)}
            sx={{fontSize:12,justifySelf:'start'}}>Show all {visible.length} questions</AlexButton>}
        </AlexBox>
      </>:<AlexText sx={{fontSize:13,color:'#667085',py:2}}>Select a group to review its questions.</AlexText>}
    </AlexBox>
  </AlexBox>
}

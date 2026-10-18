import {useState,type MouseEvent} from 'react'
import {Button,Menu,MenuItem} from '@mui/material'
import {ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexText from '../atoms/AlexText'
import PracticeProgress from '../molecules/PracticeProgress'

type Props={
  moduleLabel:string
  subjectLabel:string
  sourceTestLabel:string
  sessionSummary:string
  failedOrder?:'math-first'|'reading-first'|'mixed'
  onFailedOrderChange?:(order:'math-first'|'reading-first'|'mixed')=>void
  current:number
  total:number
  canGoPrevious:boolean
  canGoNext:boolean
  isLast:boolean
  onPrevious:()=>void
  onNext:()=>void
  reviewMode?:boolean
}

export default function PracticeSessionHeader({moduleLabel,subjectLabel,sourceTestLabel,sessionSummary,failedOrder,onFailedOrderChange,current,total,canGoPrevious,canGoNext,isLast,onPrevious,onNext,reviewMode=false}:Props){
  const[orderAnchor,setOrderAnchor]=useState<HTMLElement|null>(null)
  const orderLabels={'math-first':'Math first','reading-first':'Reading first',mixed:'Mixed order'}
  const selectOrder=(order:'math-first'|'reading-first'|'mixed')=>{setOrderAnchor(null);onFailedOrderChange?.(order)}
  return <AlexBox component="header" className="practice-topbar">
    <AlexBox className="practice-title">
      <AlexText component="span">{reviewMode?'SESSION REVIEW':'SAT PRACTICE'}</AlexText>
      <AlexText component="b">{moduleLabel}</AlexText>
      <AlexText sx={{fontSize:11,color:"#475467"}}>{sourceTestLabel}</AlexText>
    </AlexBox>
    <AlexBox className="progress-block" sx={{display:'flex',flexDirection:'column',gap:.15,minWidth:0}}>
      <PracticeProgress label={subjectLabel} current={current} total={total}/>
      <AlexBox sx={{display:'flex',alignItems:'center',gap:.9,flexWrap:'wrap'}}>
        <AlexText sx={{fontSize:11.5,color:'#52627A'}}>{sessionSummary}</AlexText>
        {failedOrder&&onFailedOrderChange&&<>
          <Button size="small" onClick={(event:MouseEvent<HTMLButtonElement>)=>setOrderAnchor(event.currentTarget)} endIcon={<ChevronDown size={12}/>} aria-haspopup="menu" aria-expanded={Boolean(orderAnchor)} sx={{textTransform:'none',minWidth:0,minHeight:22,p:'0 4px',fontSize:11.5,fontWeight:650,lineHeight:1.2,color:'#0B376D',whiteSpace:'nowrap','&:hover':{bgcolor:'#EDF2F8'}}}>
            Order: {orderLabels[failedOrder]}
          </Button>
          <Menu anchorEl={orderAnchor} open={Boolean(orderAnchor)} onClose={()=>setOrderAnchor(null)} MenuListProps={{'aria-label':'Failed question review order'}} PaperProps={{sx:{minWidth:155,boxShadow:'0 8px 24px rgba(16,24,40,.12)'}}}>
            {(['math-first','reading-first','mixed'] as const).map(order=><MenuItem key={order} selected={failedOrder===order} onClick={()=>selectOrder(order)} sx={{fontSize:13,minHeight:36}}>{orderLabels[order]}</MenuItem>)}
          </Menu>
        </>}
      </AlexBox>
    </AlexBox>
    <AlexBox className="question-nav">
      <AlexIconButton
        label="Previous question"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        sx={{
          display:{xs:'inline-flex',sm:'none'},
          width:38,
          height:38,
          borderRadius:'50%',
          border:'1px solid #9EB2CC',
          bgcolor:'#fff',
          color:'#0B376D',
          '&:hover':{bgcolor:'#F4F8FD'},
          '&.Mui-disabled':{bgcolor:'#E8E8E6',borderColor:'#D9D9D6',color:'#A5A7AA'},
        }}
      >
        <ChevronLeft size={19}/>
      </AlexIconButton>
      <AlexButton
        aria-label="Previous question"
        tone="secondary"
        startIcon={<ChevronLeft size={18}/>}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        sx={{display:{xs:'none',sm:'inline-flex'}}}
      >
        Previous
      </AlexButton>

      <AlexIconButton
        label={isLast?(reviewMode?'Finish review':'Finish practice'):'Next question'}
        onClick={onNext}
        disabled={!canGoNext}
        sx={{
          display:{xs:'inline-flex',sm:'none'},
          width:38,
          height:38,
          borderRadius:'50%',
          border:'1px solid #9EB2CC',
          bgcolor:'#fff',
          color:'#0B376D',
          '&:hover':{bgcolor:'#F4F8FD'},
          '&.Mui-disabled':{bgcolor:'#E8E8E6',borderColor:'#D9D9D6',color:'#A5A7AA'},
        }}
      >
        <ChevronRight size={19}/>
      </AlexIconButton>
      <AlexButton
        aria-label={isLast?(reviewMode?'Finish review':'Finish practice'):'Next question'}
        endIcon={<ChevronRight size={18}/>}
        onClick={onNext}
        disabled={!canGoNext}
        sx={{display:{xs:'none',sm:'inline-flex'}}}
      >
        {isLast?(reviewMode?'Finish review':'Finish'):'Next'}
      </AlexButton>
    </AlexBox>
  </AlexBox>
}

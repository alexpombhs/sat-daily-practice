import {ChevronLeft,ChevronRight} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexText from '../atoms/AlexText'
import PracticeProgress from '../molecules/PracticeProgress'

type Props={
  moduleLabel:string
  subjectLabel:string
  current:number
  total:number
  canGoPrevious:boolean
  canGoNext:boolean
  isLast:boolean
  onPrevious:()=>void
  onNext:()=>void
  reviewMode?:boolean
}

export default function PracticeSessionHeader({moduleLabel,subjectLabel,current,total,canGoPrevious,canGoNext,isLast,onPrevious,onNext,reviewMode=false}:Props){
  return <AlexBox component="header" className="practice-topbar">
    <AlexBox className="practice-title">
      <AlexText component="span">{reviewMode?'SESSION REVIEW':'SAT PRACTICE'}</AlexText>
      <AlexText component="b">{moduleLabel}</AlexText>
    </AlexBox>
    <AlexBox className="progress-block"><PracticeProgress label={subjectLabel} current={current} total={total}/></AlexBox>
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

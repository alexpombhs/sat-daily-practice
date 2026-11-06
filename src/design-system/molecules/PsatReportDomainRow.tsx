import {ArrowUpRight} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexInfoTooltipButton from '../atoms/AlexInfoTooltipButton'
import AlexText from '../atoms/AlexText'
import {PSAT_DOMAIN_WEIGHTS,ScoreRangeBar} from './PsatScoreBars'
import PsatTopicBreakdown from './PsatTopicBreakdown'
import type {PsatDomainId} from '../../lib/psatDomains'
import type {Attempt,PracticeQuestion} from '../../types'

type Props={
  domain:PsatDomainId
  label:string
  band?:string
  questions:PracticeQuestion[]
  attempts:Attempt[]
  recoveryCorrectAnswers:number
  onPractice?:()=>void
}

export default function PsatReportDomainRow({domain,label,band,questions,attempts,recoveryCorrectAnswers,onPractice}:Props){
  const weight=PSAT_DOMAIN_WEIGHTS[domain]
  return <AlexBox sx={{py:1.45,borderTop:'1px solid #F0F2F6','&:first-of-type':{borderTop:0}}}>
    <AlexBox sx={{display:'flex',alignItems:'center',gap:.4,minWidth:0}}>
      <AlexText sx={{fontSize:12.5,fontWeight:600,color:'#344054',lineHeight:1.4,flex:1,minWidth:0}}>
        {label}
      </AlexText>
      <AlexInfoTooltipButton
        label={`About ${label}`}
        title={<span>{weight.percent}% of this PSAT section, approximately {weight.questions} questions. The displayed range is from the official score report; practice progress comes from your app question bank.</span>}
      />
      {onPractice&&<AlexIconButton
        label={`Practice ${label}`}
        onClick={onPractice}
        sx={{p:.4,color:'#3458CE'}}
      ><ArrowUpRight size={15}/></AlexIconButton>}
    </AlexBox>
    <AlexBox sx={{mt:.45}}>
      <ScoreRangeBar band={band}/>
    </AlexBox>
    <PsatTopicBreakdown
      domain={domain}
      questions={questions}
      attempts={attempts}
      recoveryCorrectAnswers={recoveryCorrectAnswers}
    />
  </AlexBox>
}

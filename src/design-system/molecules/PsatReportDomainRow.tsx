import AlexBox from '../atoms/AlexBox'
import AlexInfoTooltipButton from '../atoms/AlexInfoTooltipButton'
import AlexText from '../atoms/AlexText'
import {PSAT_DOMAIN_WEIGHTS,ScoreRangeBar} from './PsatScoreBars'
import type {PsatDomainId} from '../../lib/psatDomains'

type Props={domain:PsatDomainId;label:string;band?:string}

export default function PsatReportDomainRow({domain,label,band}:Props){
  const weight=PSAT_DOMAIN_WEIGHTS[domain]
  return <AlexBox sx={{py:1.35,borderTop:'1px solid #F3F4F6'}}>
    <AlexText sx={{fontSize:12.5,fontWeight:600,lineHeight:1.35,color:'#344054'}}>{label}</AlexText>
    <AlexBox sx={{display:'flex',alignItems:'center',gap:.1,mt:.05,mb:.65}}>
      <AlexText sx={{fontSize:10.5,color:'#667085'}}>
        {weight.percent}% of section, {weight.questions} questions
      </AlexText>
      <AlexInfoTooltipButton
        label={`About ${label}`}
        title={`This domain represents about ${weight.percent}% of the PSAT section (${weight.questions} questions). The blue bar shows the range reported by College Board.`}
      />
    </AlexBox>
    <ScoreRangeBar band={band}/>
  </AlexBox>
}

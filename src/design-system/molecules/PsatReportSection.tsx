import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'
import {PSAT_DOMAINS,type PsatScoreReport} from '../../lib/psatDomains'
import {SectionScoreBar} from './PsatScoreBars'
import PsatReportDomainRow from './PsatReportDomainRow'
import type {Subject} from '../../types'

type Props={subject:Subject;report:PsatScoreReport}
const order=['craft-structure','expression-ideas','information-ideas','standard-conventions','algebra','advanced-math','problem-solving-data','geometry-trigonometry']

export default function PsatReportSection({subject,report}:Props){
  const english=subject==='english'
  const name=english?'Reading and Writing':'Math'
  const score=english?report.readingWriting:report.math
  const domains=PSAT_DOMAINS.filter(domain=>domain.subject===subject)
    .sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id))
  return <AlexBox component="section" aria-label={name} sx={{minWidth:0}}>
    <AlexText component="h3" sx={{fontSize:16,fontWeight:600,color:'#1D2939',mb:1.6}}>{name}</AlexText>
    <AlexText sx={{fontSize:11.5,color:'#667085',mb:.2}}>Your {name} Score</AlexText>
    <SectionScoreBar score={score}/>
    <AlexText sx={{fontSize:11.5,color:'#475467',fontWeight:600,mt:3,mb:1.3}}>Content areas</AlexText>
    {domains.map(domain=><PsatReportDomainRow key={domain.id} domain={domain.id} label={domain.label} band={report.bands?.[domain.id]}/>)}
  </AlexBox>
}

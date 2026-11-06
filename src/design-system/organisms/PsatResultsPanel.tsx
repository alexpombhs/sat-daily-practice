import {Plus,Trash2} from 'lucide-react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import {PSAT_DOMAINS,type PsatDomainId,type PsatScoreReport} from '../../lib/psatDomains'
import {PSAT_DOMAIN_WEIGHTS,ScoreRangeBar,SectionScoreBar} from '../molecules/PsatScoreBars'
import PsatTopicBreakdown from '../molecules/PsatTopicBreakdown'
import type {Attempt,PracticeQuestion} from '../../types'

type Props={
  results:PsatScoreReport[]
  onChange:(results:PsatScoreReport[])=>void
  onPracticeDomain?:(domain:PsatDomainId)=>void
  questions?:PracticeQuestion[]
  attempts?:Attempt[]
  recoveryCorrectAnswers?:number
}

const BAND_OPTIONS=[
  {value:'',label:'Not recorded'},
  {value:'490–540',label:'490–540'},
  {value:'550–600',label:'550–600'},
  {value:'610–670',label:'610–670'},
  {value:'680–760',label:'680–760'},
]

function reportTotal(report:PsatScoreReport){
  return report.readingWriting!==null&&report.math!==null?report.readingWriting+report.math:null
}

export default function PsatResultsPanel({results,onChange,onPracticeDomain,questions=[],attempts=[],recoveryCorrectAnswers=2}:Props){
  const sorted=[...results].sort((a,b)=>b.year-a.year)
  function addResult(){
    let year=new Date().getFullYear()
    while(results.some(item=>item.year===year))year--
    onChange([...results,{year,readingWriting:null,math:null,percentile:null,bands:{}}])
  }
  function updateResult(index:number,patch:Partial<PsatScoreReport>){
    const updated=results.map((report,i)=>i===index?{...report,...patch}:report)
    onChange(updated)
  }
  function updateNumber(index:number,field:'year'|'readingWriting'|'math'|'percentile',value:string){
    if(value===''){
      if(field!=='year')updateResult(index,{[field]:null})
      return
    }
    const numeric=Number(value)
    if(!Number.isInteger(numeric))return
    if(field==='year'&&(numeric<2000||numeric>2100))return
    if((field==='readingWriting'||field==='math')&&(numeric<0||numeric>760))return
    if(field==='percentile'&&(numeric<0||numeric>100))return
    updateResult(index,{[field]:numeric})
  }

  return <AlexSurface sx={{border:'1px solid #E4E7EC',bgcolor:'#F7F9FD',p:{xs:1.75,sm:2.5},borderRadius:2.5}}>
    <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:{xs:'flex-start',sm:'center'},gap:1.5,flexWrap:'wrap'}}>
      <AlexBox>
        <AlexText component="h2" sx={{fontSize:22,fontWeight:850,color:'#08275B'}}>PSAT/NMSQT score report</AlexText>
        <AlexText sx={{fontSize:12.5,color:'#667085',mt:.35}}>Enter your score reports and the College Board skill ranges. They are saved in your private account settings when signed in.</AlexText>
      </AlexBox>
      <AlexButton tone="secondary" startIcon={<Plus size={15}/>} onClick={addResult}>Add PSAT result</AlexButton>
    </AlexBox>
    {!results.length&&<AlexText sx={{mt:2,color:'#667085',fontSize:13.5}}>No PSAT results recorded yet. Add your score report to compare years and jump to focused practice.</AlexText>}
    <AlexBox sx={{display:'grid',gap:1.5,mt:results.length?2:0}}>
      {sorted.map((report,displayIndex)=>{
        const index=results.indexOf(report)
        const total=reportTotal(report)
        return <AlexAccordion key={report.year} defaultExpanded={displayIndex===0} summary={<AlexBox sx={{width:'100%',display:'flex',alignItems:'center',gap:1,justifyContent:'space-between',pr:1,flexWrap:'wrap'}}>
          <AlexText sx={{color:'#08275B',fontWeight:850}}>PSAT/NMSQT {report.year}</AlexText>
          <AlexText sx={{fontWeight:800,color:'#08275B'}}>{total??'—'} <AlexText component="span" sx={{fontSize:12,color:'#667085'}}> / 1520</AlexText></AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085'}}>R&W {report.readingWriting??'—'} · Math {report.math??'—'}{report.percentile!==null?` · ${report.percentile}th percentile`:''}</AlexText>
        </AlexBox>}>
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1,mb:1.5}}>
            <AlexDropdown id={`psat-year-${index}`} label="Exam year" value={String(report.year)} options={Array.from({length:21},(_,i)=>({value:String(2015+i),label:String(2015+i)}))} onChange={value=>updateNumber(index,'year',value)}/>
            <AlexTextField type="number" label="Reading & Writing" value={report.readingWriting??''} inputProps={{min:0,max:760,step:10}} onChange={event=>updateNumber(index,'readingWriting',event.target.value)}/>
            <AlexTextField type="number" label="Math" value={report.math??''} inputProps={{min:0,max:760,step:10}} onChange={event=>updateNumber(index,'math',event.target.value)}/>
            <AlexTextField type="number" label="Percentile (optional)" value={report.percentile??''} inputProps={{min:0,max:100}} onChange={event=>updateNumber(index,'percentile',event.target.value)}/>
          </AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054',mb:1}}>Content area score ranges</AlexText>
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'repeat(2,minmax(0,1fr))'},gap:1}}>
            {PSAT_DOMAINS.map(domain=><AlexBox key={domain.id} sx={{display:'flex',alignItems:'center',gap:1,p:1,border:'1px solid #EEF1F4',borderRadius:1.5,minWidth:0}}>
              <AlexBox sx={{flex:1,minWidth:0}}>
                <AlexText sx={{fontSize:12.5,fontWeight:750,color:'#344054',mb:.5}}>{domain.label}</AlexText>
                <AlexDropdown id={`psat-${report.year}-${domain.id}`} label="Score range" value={report.bands?.[domain.id]??''} options={BAND_OPTIONS} onChange={value=>updateResult(index,{bands:{...(report.bands??{}),[domain.id]:value}})}/>
              </AlexBox>
              {onPracticeDomain&&<AlexButton tone="quiet" sx={{fontSize:12,px:1,minWidth:0,alignSelf:'end',mb:.4}} onClick={()=>onPracticeDomain(domain.id)}>Practice</AlexButton>}
            </AlexBox>)}
          </AlexBox>
          <AlexBox sx={{display:'flex',justifyContent:'flex-end',mt:1.5}}>
            <AlexIconButton label={`Remove PSAT ${report.year} result`} onClick={()=>onChange(results.filter((_,i)=>i!==index))}><Trash2 size={16}/></AlexIconButton>
          </AlexBox>
        </AlexAccordion>
      })}
    </AlexBox>
    <AlexText sx={{fontSize:12,color:'#667085',mt:1.5}}>PSAT scores are historical exam results, not interchangeable with the app's SAT practice estimate. Category filters use the question bank's existing concept tags.</AlexText>
  </AlexSurface>
}

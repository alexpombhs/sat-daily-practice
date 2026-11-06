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
import PsatReportSection from '../molecules/PsatReportSection'

type Props={
  results:PsatScoreReport[]
  onChange:(results:PsatScoreReport[])=>void
  onPracticeDomain?:(domain:PsatDomainId)=>void
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

export default function PsatResultsPanel({results,onChange}:Props){
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

  return <AlexSurface sx={{border:'1px solid #E4E7EC',bgcolor:'#fff',p:{xs:1.5,sm:2},borderRadius:2}}>
    <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:{xs:'flex-start',sm:'center'},gap:1.5,flexWrap:'wrap'}}>
      <AlexBox>
        <AlexText component="h2" sx={{fontSize:16,fontWeight:600,color:'#1D2939'}}>PSAT/NMSQT score report</AlexText>
      </AlexBox>
      <AlexButton tone="quiet" startIcon={<Plus size={14}/>} sx={{fontSize:12.5,fontWeight:500,minHeight:30}} onClick={addResult}>Add result</AlexButton>
    </AlexBox>
    {!results.length&&<AlexText sx={{mt:2,color:'#667085',fontSize:13.5}}>No PSAT results recorded.</AlexText>}
    <AlexBox sx={{display:'grid',gap:1.5,mt:results.length?2:0}}>
      {sorted.map((report,displayIndex)=>{
        const index=results.indexOf(report)
        const total=reportTotal(report)
        return <AlexAccordion key={report.year} defaultExpanded={displayIndex===0} summary={<AlexBox sx={{width:'100%',display:'flex',alignItems:'center',gap:1,justifyContent:'space-between',pr:1,flexWrap:'wrap'}}>
          <AlexText sx={{color:'#08275B',fontWeight:600,fontSize:13}}>PSAT/NMSQT {report.year}</AlexText>
          <AlexText sx={{fontWeight:600,fontSize:15,color:'#1D2939'}}>{total??'—'} <AlexText component="span" sx={{fontSize:12,color:'#667085'}}> / 1520</AlexText></AlexText>
          <AlexText sx={{fontSize:11.5,color:'#98A2B3'}}>R&W {report.readingWriting??'—'} · Math {report.math??'—'}{report.percentile!==null?` · ${report.percentile}th percentile`:''}</AlexText>
        </AlexBox>}>
          <AlexBox sx={{display:'grid',gap:1.75,mb:2}}>
            <AlexBox sx={{borderBottom:'1px solid #ECEFF4',pb:1.7,display:'flex',gap:1.2,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
              <AlexText sx={{fontSize:12,color:'#667085'}}>Your PSAT/NMSQT Total Score</AlexText>
              <AlexText sx={{fontSize:28,lineHeight:1.25,fontWeight:600,color:'#1D2939'}}>{total??'—'} <AlexText component="span" sx={{fontSize:12,color:'#98A2B3'}}>/ 1520</AlexText></AlexText>
            </AlexBox>
            <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'repeat(2,minmax(0,1fr))'},columnGap:{lg:5},rowGap:3}}>
              <PsatReportSection subject="english" report={report}/>
              <PsatReportSection subject="math" report={report}/>
            </AlexBox>
          </AlexBox>
          <AlexAccordion summary={<AlexBox>
            <AlexText sx={{fontSize:12.5,color:'#475467',fontWeight:600}}>Edit official report</AlexText>
          </AlexBox>}>
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',md:'repeat(4,minmax(0,1fr))'},gap:1,mb:1.5}}>
            <AlexDropdown id={`psat-year-${index}`} label="Exam year" value={String(report.year)} options={Array.from({length:21},(_,i)=>({value:String(2015+i),label:String(2015+i)}))} onChange={value=>updateNumber(index,'year',value)}/>
            <AlexTextField type="number" label="Reading & Writing" value={report.readingWriting??''} inputProps={{min:0,max:760,step:10}} onChange={event=>updateNumber(index,'readingWriting',event.target.value)}/>
            <AlexTextField type="number" label="Math" value={report.math??''} inputProps={{min:0,max:760,step:10}} onChange={event=>updateNumber(index,'math',event.target.value)}/>
            <AlexTextField type="number" label="Percentile (optional)" value={report.percentile??''} inputProps={{min:0,max:100}} onChange={event=>updateNumber(index,'percentile',event.target.value)}/>
          </AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:600,color:'#475467',mb:1}}>Content area score ranges</AlexText>
          <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'repeat(2,minmax(0,1fr))'},gap:1}}>
            {PSAT_DOMAINS.map(domain=><AlexBox key={domain.id} sx={{display:'flex',alignItems:'center',gap:1,p:1,border:'1px solid #F1F3F6',borderRadius:1.5,minWidth:0}}>
              <AlexBox sx={{flex:1,minWidth:0}}>
                <AlexText sx={{fontSize:12,fontWeight:600,color:'#475467',mb:.5}}>{domain.label}</AlexText>
                <AlexDropdown id={`psat-${report.year}-${domain.id}`} label="Score range" value={report.bands?.[domain.id]??''} options={BAND_OPTIONS} onChange={value=>updateResult(index,{bands:{...(report.bands??{}),[domain.id]:value}})}/>
              </AlexBox>

            </AlexBox>)}
          </AlexBox>
          </AlexAccordion>
          <AlexBox sx={{display:'flex',justifyContent:'flex-end',mt:1.5}}>
            <AlexIconButton label={`Remove PSAT ${report.year} result`} onClick={()=>onChange(results.filter((_,i)=>i!==index))}><Trash2 size={16}/></AlexIconButton>
          </AlexBox>
        </AlexAccordion>
      })}
    </AlexBox>

  </AlexSurface>
}

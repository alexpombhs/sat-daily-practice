import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'

type Props={
  practiced:number
  total:number
  accuracy:number|null
  failed:number
  mastered:number
}

export default function VocabularyPerformanceSummary({practiced,total,accuracy,failed,mastered}:Props){
  const items=[
    {label:'Practiced',value:practiced+'/'+total,helper:'unique words'},
    {label:'Accuracy',value:accuracy===null?'—':accuracy+'%',helper:'all attempts'},
    {label:'Failed',value:String(failed),helper:'need review'},
    {label:'Mastered',value:String(mastered),helper:'currently clear'},
  ]

  return <AlexSurface sx={{mt:2.25,p:{xs:1.5,sm:1.75},border:'1px solid #E4E7EC',bgcolor:'#FFFFFF'}}>
    <AlexBox sx={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:1,mb:1.25}}>
      <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>Vocabulary performance</AlexText>
      <AlexText sx={{fontSize:12,color:'#667085'}}>Across saved vocabulary attempts</AlexText>
    </AlexBox>
    <AlexBox sx={{
      display:'grid',
      gridTemplateColumns:{xs:'repeat(2,minmax(0,1fr))',sm:'repeat(4,minmax(0,1fr))'},
      gap:1,
    }}>
      {items.map(item=><AlexBox key={item.label} sx={{
        minWidth:0,
        p:{xs:1.15,sm:1.25},
        border:'1px solid #EEF1F4',
        borderRadius:'8px',
        bgcolor:'#F8FAFC',
      }}>
        <AlexText sx={{fontSize:11.5,fontWeight:750,color:'#667085'}}>{item.label}</AlexText>
        <AlexText component="div" sx={{fontSize:{xs:20,sm:22},fontWeight:800,lineHeight:1.15,color:'#08275B',mt:.35}}>{item.value}</AlexText>
        <AlexText sx={{fontSize:11.5,color:'#7A8798',mt:.25}}>{item.helper}</AlexText>
      </AlexBox>)}
    </AlexBox>
  </AlexSurface>
}

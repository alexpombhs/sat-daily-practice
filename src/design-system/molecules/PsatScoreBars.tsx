import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'

export const PSAT_DOMAIN_WEIGHTS={
  'craft-structure':{percent:28,questions:'13–15'},
  'expression-ideas':{percent:20,questions:'8–12'},
  'information-ideas':{percent:26,questions:'12–14'},
  'standard-conventions':{percent:26,questions:'11–15'},
  algebra:{percent:35,questions:'13–15'},
  'advanced-math':{percent:35,questions:'12–14'},
  'problem-solving-data':{percent:20,questions:'7–9'},
  'geometry-trigonometry':{percent:10,questions:'5–7'},
} as const

export function ScoreRangeBar({low=160,high=760,band}:{low?:number;high?:number;band?:string}){
  const parts=band?.match(/\d+/g)?.map(Number)
  const valid=parts?.length===2&&parts[0]>=low&&parts[1]<=high
  const start=valid?(parts![0]-low)/(high-low)*100:0
  const width=valid?(parts![1]-parts![0])/(high-low)*100:0
  return <AlexBox sx={{width:'100%'}}>
    <AlexBox sx={{height:10,borderRadius:6,bgcolor:'#DFE6F5',position:'relative',overflow:'hidden'}}>
      {valid&&<AlexBox sx={{position:'absolute',left:`${start}%`,width:`${width}%`,height:'100%',bgcolor:'#3151CC',borderRadius:6}}/>}
    </AlexBox>
    <AlexBox sx={{display:'flex',justifyContent:'space-between',mt:.3}}>
      <AlexText sx={{fontSize:10.5,color:'#667085'}}>{low}</AlexText>
      <AlexText sx={{fontSize:11,fontWeight:750,color:'#3151CC'}}>{band||'Not recorded'}</AlexText>
      <AlexText sx={{fontSize:10.5,color:'#667085'}}>{high}</AlexText>
    </AlexBox>
  </AlexBox>
}

export function SectionScoreBar({score}:{score:number|null}){
  const percent=score===null?0:Math.max(0,Math.min(100,(score-160)/600*100))
  return <AlexBox>
    <AlexText sx={{fontSize:33,fontWeight:850,color:'#10213E'}}>{score??'—'}</AlexText>
    <AlexBox sx={{height:11,borderRadius:8,overflow:'hidden',bgcolor:'#DFE6F5'}}>
      <AlexBox sx={{height:'100%',width:`${percent}%`,bgcolor:'#3151CC',borderRadius:8}}/>
    </AlexBox>
    <AlexBox sx={{display:'flex',justifyContent:'space-between',mt:.3}}>
      {['160','460','760'].map(n=><AlexText key={n} sx={{fontSize:11,color:'#667085'}}>{n}</AlexText>)}
    </AlexBox>
  </AlexBox>
}

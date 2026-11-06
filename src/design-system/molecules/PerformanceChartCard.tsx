import type {ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'

type Props={
  title:string
  description?:string
  children:ReactNode
  minHeight?:number
}

export default function PerformanceChartCard({title,description,children,minHeight=300}:Props){
  const phoneHeight=Math.min(Math.max(Math.round(minHeight*.72),250),440)
  const tabletHeight=Math.min(Math.max(Math.round(minHeight*.82),280),520)

  return <AlexSurface sx={{p:{xs:1.75,sm:2,md:2.5},border:'1px solid #E6E2DB',borderRadius:3,minWidth:0}}>
    <AlexText component="h2" sx={{fontSize:{xs:16,sm:18},fontWeight:600,color:'#08275B'}}>{title}</AlexText>
    {description&&<AlexText sx={{fontSize:{xs:12,sm:13},color:'#667085',mt:.5,lineHeight:1.5}}>{description}</AlexText>}
    <AlexBox sx={{height:{xs:phoneHeight,sm:tabletHeight,lg:minHeight},mt:{xs:1.5,sm:2},minWidth:0}}>{children}</AlexBox>
  </AlexSurface>
}

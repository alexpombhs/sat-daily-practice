import type {ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'

type Props={
  title:string
  description?:string
  trailing?:ReactNode
  children:ReactNode
}

export default function PracticeSetupSection({title,description,trailing,children}:Props){
  return <AlexBox component="section" sx={{display:'grid',gap:1.25}}>
    <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1.5}}>
      <AlexBox sx={{minWidth:0}}>
        <AlexText component="h3" sx={{m:0,fontSize:16,fontWeight:850,color:'#08275B'}}>{title}</AlexText>
        {description&&<AlexText sx={{mt:.3,fontSize:13,color:'#667085',lineHeight:1.45}}>{description}</AlexText>}
      </AlexBox>
      {trailing&&<AlexBox sx={{flex:'0 0 auto'}}>{trailing}</AlexBox>}
    </AlexBox>
    {children}
  </AlexBox>
}

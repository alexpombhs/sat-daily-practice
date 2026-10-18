import type {ReactNode} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'

type Props={
  title:string
  description?:string
  summary?:string
  trailing?:ReactNode
  children:ReactNode
  defaultExpanded?:boolean
}

export default function PracticeSetupSection({title,description,summary,trailing,children,defaultExpanded=false}:Props){
  return <AlexAccordion
    defaultExpanded={defaultExpanded}
    summary={<AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1.5,width:'100%',pr:.75,flexDirection:{xs:'column',sm:'row'}}}>
      <AlexBox sx={{minWidth:0}}>
        <AlexText component="h3" sx={{m:0,fontSize:16,fontWeight:850,color:'#08275B'}}>{title}</AlexText>
        {description&&<AlexText sx={{mt:.25,fontSize:12.75,color:'#667085',lineHeight:1.4}}>{description}</AlexText>}
        {summary&&<AlexText sx={{mt:.45,fontSize:13,color:'#344054',fontWeight:700,lineHeight:1.4}}>{summary}</AlexText>}
      </AlexBox>
      {trailing&&<AlexBox sx={{flex:'0 0 auto'}}>{trailing}</AlexBox>}
    </AlexBox>}
  >
    <AlexBox sx={{pt:.5}}>{children}</AlexBox>
  </AlexAccordion>
}

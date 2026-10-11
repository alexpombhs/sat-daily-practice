import type {ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexText from '../atoms/AlexText'

type Props={
  label:string
  helperText?:string
  control:ReactNode
}

export default function PracticeSettingField({label,helperText,control}:Props){
  return <AlexBox
    sx={{
      display:'grid',
      gridTemplateColumns:{xs:'1fr',md:'minmax(0,1fr) minmax(360px,480px)'},
      gap:{xs:1.25,md:4},
      alignItems:'center',
      py:{xs:1.5,md:1.75},
      minWidth:0,
    }}
  >
    <AlexBox sx={{minWidth:0}}>
      <AlexText component="div" sx={{fontWeight:800,color:'#08275B',fontSize:15}}>
        {label}
      </AlexText>
      {helperText&&<AlexText component="div" sx={{mt:.5,color:'#667085',fontSize:13,lineHeight:1.5}}>
        {helperText}
      </AlexText>}
    </AlexBox>
    <AlexBox sx={{minWidth:0,width:'100%'}}>{control}</AlexBox>
  </AlexBox>
}

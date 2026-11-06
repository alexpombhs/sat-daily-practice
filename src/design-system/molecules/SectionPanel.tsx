import type {ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'

type Props={
  eyebrow?:string
  title?:string
  description?:string
  action?:ReactNode
  children:ReactNode
  tone?:'default'|'accent'
}

export default function SectionPanel({eyebrow,title,description,action,children,tone='default'}:Props){
  const hasHeader=Boolean(eyebrow||title||description||action)
  return <AlexSurface
    component="section"
    sx={{
      p:{xs:2.5,md:3},
      border:'1px solid',
      borderColor:tone==='accent'?'#D8D2FF':'#E4E7EC',
      borderRadius:3,
      bgcolor:tone==='accent'?'#FCFBFF':'#fff',
    }}
  >
    {hasHeader&&<AlexBox
      sx={{
        display:'flex',
        alignItems:{xs:'flex-start',sm:'center'},
        justifyContent:'space-between',
        gap:2,
        mb:{xs:2,md:2.5},
      }}
    >
      <AlexBox sx={{minWidth:0}}>
        {eyebrow&&<AlexText
          sx={{
            fontSize:12,
            fontWeight:600,
            textTransform:'uppercase',
            letterSpacing:'.07em',
            color:'#6558F5',
          }}
        >
          {eyebrow}
        </AlexText>}
        {title&&<AlexText
          component="h2"
          sx={{
            mt:eyebrow ? .5 : 0,
            fontSize:22,
            fontWeight:600,
            lineHeight:1.25,
            color:'#08275B',
          }}
        >
          {title}
        </AlexText>}
        {description&&<AlexText
          sx={{
            mt:(title||eyebrow) ? .75 : 0,
            fontSize:13.5,
            lineHeight:1.5,
            color:'#667085',
            maxWidth:720,
          }}
        >
          {description}
        </AlexText>}
      </AlexBox>
      {action&&<AlexBox sx={{flexShrink:0}}>{action}</AlexBox>}
    </AlexBox>}
    {children}
  </AlexSurface>
}

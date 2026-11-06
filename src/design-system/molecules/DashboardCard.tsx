import type {ComponentProps,ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import {dashboardCardTokens,dashboardTypography} from '../theme'

export type DashboardCardTone='blue'|'cream'|'green'|'peach'|'lavender'|'yellow'|'white'
export type DashboardCardVariant='metric'|'hero'|'compact'|'support'

type Props={
  tone:DashboardCardTone
  variant?:DashboardCardVariant
  icon?:ReactNode
  title:string
  value?:ReactNode
  valueTrailing?:ReactNode
  subtitle?:ReactNode
  trailing?:ReactNode
  decoration?:ReactNode
  valueColor?:string
  valueFontSize?:number|string|Record<string,number|string>
  sx?:ComponentProps<typeof AlexSurface>['sx']
  children?:ReactNode
}

const TONES:Record<DashboardCardTone,{bg:string;border:string;icon:string;title:string}>={
  blue:{bg:'#EEF6FF',border:'#D8E9FB',icon:'#286BA9',title:'#5B6575'},
  cream:{bg:'#FFF9E8',border:'#F2E4B8',icon:'#8A6818',title:'#5B6575'},
  green:{bg:'#EEFAE9',border:'#D8EDD0',icon:'#4E7C3E',title:'#5B6575'},
  peach:{bg:'#FFF1E8',border:'#F1DDD0',icon:'#A65D32',title:'#5B6575'},
  lavender:{bg:'#F5EEFF',border:'#E5D8F8',icon:'#7553A4',title:'#66428A'},
  yellow:{bg:'#FFF9DD',border:'#F2E4B8',icon:'#6B5A12',title:'#6B5A12'},
  white:{bg:'#FFFFFF',border:'#E4E7EC',icon:'#6558F5',title:'#5B6575'},
}

export default function DashboardCard({tone,variant='metric',icon,title,value,valueTrailing,subtitle,trailing,decoration,valueColor,valueFontSize,sx,children}:Props){
  const palette=TONES[tone]
  const iconBox=dashboardCardTokens.iconBox[variant]
  const iconSize=dashboardCardTokens.iconSize[variant]
  const valueSize=variant==='metric'
    ?dashboardTypography.metricValue
    :variant==='hero'
      ?dashboardTypography.heroScore
      :dashboardTypography.supportTitle

  const iconNode=icon?<AlexBox sx={{
    width:iconBox,
    height:iconBox,
    flex:'0 0 auto',
    borderRadius:'50%',
    display:'grid',
    placeItems:'center',
    bgcolor:'rgba(255,255,255,.76)',
    color:palette.icon,
    '& svg':{width:iconSize,height:iconSize},
  }}>{icon}</AlexBox>:null

  return <AlexSurface sx={{
    position:'relative',
    minWidth:0,
    minHeight:0,
    height:'100%',
    border:`1px solid ${palette.border}`,
    borderRadius:dashboardCardTokens.radius,
    bgcolor:palette.bg,
    boxShadow:'none',
    p:dashboardCardTokens.padding[variant],
    display:'flex',
    flexDirection:'column',
    gap:dashboardCardTokens.gap,
    overflow:'hidden',
    ...sx,
  }}>
    {variant==='metric'?<>
      {iconNode}
      <AlexBox sx={{display:'flex',alignItems:'center',gap:.45,minWidth:0}}>
        <CardTitle>{title}</CardTitle>
        {trailing}
      </AlexBox>
    </>:<AlexBox sx={{
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      gap:.6,
      minWidth:0,
      minHeight:variant==='support'?20:undefined,
      width:'100%',
    }}>
      <AlexBox sx={{display:'flex',alignItems:'center',gap:.6,minWidth:0}}>
        {(variant==='compact'||variant==='support')&&iconNode}
        <CardTitle>{title}</CardTitle>
      </AlexBox>
      {trailing&&<AlexBox sx={{display:'grid',placeItems:'center',flex:'0 0 auto'}}>{trailing}</AlexBox>}
    </AlexBox>}

    {value!==undefined&&<AlexBox sx={{display:'flex',alignItems:'center',gap:.35,minWidth:0}}>
      <AlexText component="div" sx={{
        fontFamily:'Georgia, "Times New Roman", serif',
        fontSize:valueFontSize??valueSize,
        lineHeight:1,
        letterSpacing:'-.02em',
        fontWeight:600,
        color:valueColor??'#08275B',
        minWidth:0,
      }}>{value}</AlexText>
      {valueTrailing}
    </AlexBox>}

    {subtitle!==undefined&&<AlexText component="div" sx={{
      color:'#667085',
      fontSize:dashboardTypography.supportBody,
      lineHeight:1.35,
      minWidth:0,
    }}>{subtitle}</AlexText>}
    {children}
    {decoration}
  </AlexSurface>

  function CardTitle({children}:{children:ReactNode}){
    return <AlexText component={variant==='support'?'h3':'p'} sx={{
      minWidth:0,
      color:palette.title,
      fontSize:dashboardTypography.cardTitle,
      lineHeight:1.2,
      fontWeight:600,
      textTransform:'uppercase',
      letterSpacing:'.075em',
    }}>{children}</AlexText>
  }
}

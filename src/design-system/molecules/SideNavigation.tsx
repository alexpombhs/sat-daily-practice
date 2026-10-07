import {BarChart3,BookOpen,ChevronLeft,ChevronRight,ClipboardList,Compass,Flag,LogIn,Settings,SlidersHorizontal,Sparkles,X} from 'lucide-react'
import type {ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexStack from '../atoms/AlexStack'
import AlexText from '../atoms/AlexText'
import AlexTooltip from '../atoms/AlexTooltip'

type Item={key:string;label:string;active?:boolean;onClick:()=>void;icon?:ReactNode}
type Variant='desktop'|'tablet'|'drawer'

type Props={
  brand?:string
  primary:Item[]
  secondary?:Item[]
  footerLabel?:string
  footerDetail?:string
  signedIn?:boolean
  collapsed?:boolean
  variant?:Variant
  onToggleCollapsed?:()=>void
  onFooterClick?:()=>void
  onClose?:()=>void
}

const defaultIcon=(label:string)=>{
  if(label==='Study Plan')return <Compass size={19}/>
  if(label==='Practice Tests')return <ClipboardList size={19}/>
  if(label==='Practice Setup')return <SlidersHorizontal size={19}/>
  if(label==='Vocabulary')return <BookOpen size={19}/>
  if(label==='Question Bank')return <BookOpen size={19}/>
  if(label==='Parsing Issues')return <Flag size={19}/>
  if(label==='Performance')return <BarChart3 size={19}/>
  if(label==='Resources')return <BookOpen size={19}/>
  return <Settings size={19}/>
}

function NavItem({item,collapsed}:{item:Item;collapsed:boolean}){
  const button=(
    <AlexButtonBase
      onClick={item.onClick}
      aria-label={item.label}
      aria-current={item.active?'page':undefined}
      sx={{
        justifyContent:collapsed?'center':'flex-start',
        gap:1.25,
        width:'100%',
        minHeight:44,
        px:collapsed?1:1.5,
        py:1.05,
        borderRadius:1.6,
        color:'#fff',
        bgcolor:item.active?'#12477F':'transparent',
        '&:hover':{bgcolor:'#12477F'},
      }}
    >
      {item.icon??defaultIcon(item.label)}
      {!collapsed&&<AlexText component="span" sx={{fontSize:14,fontWeight:650}}>{item.label}</AlexText>}
    </AlexButtonBase>
  )
  return collapsed?<AlexTooltip title={item.label} placement="right">{button}</AlexTooltip>:button
}

export default function SideNavigation({brand='SAT',primary,secondary=[],footerLabel='Sign in',footerDetail='',signedIn=false,collapsed=false,variant='desktop',onToggleCollapsed,onFooterClick,onClose}:Props){
  const effectiveCollapsed=variant==='tablet'?true:variant==='drawer'?false:collapsed
  const width=variant==='drawer'?288:effectiveCollapsed?72:244
  const tooltipLabel=signedIn?footerLabel:'Sign in'
  const fixed=variant!=='drawer'

  return <AlexBox
    component="aside"
    aria-label="Primary navigation"
    sx={{
      width,
      minWidth:width,
      height:'100dvh',
      maxHeight:'100dvh',
      boxSizing:'border-box',
      bgcolor:'#08275B',
      color:'#fff',
      display:'flex',
      flexDirection:'column',
      px:effectiveCollapsed?1:1.5,
      py:variant==='drawer'?1.5:2.2,
      position:fixed?'fixed':'relative',
      top:fixed?0:'auto',
      left:fixed?0:'auto',
      overflowY:'auto',
      overflowX:'hidden',
      transition:'width .18s ease, min-width .18s ease',
      zIndex:30,
    }}
  >
    <AlexBox sx={{display:'flex',alignItems:'center',gap:.5,mb:1.2}}>
      <AlexButtonBase
        onClick={primary[0]?.onClick}
        aria-label={brand}
        sx={{justifyContent:effectiveCollapsed?'center':'flex-start',gap:1.1,color:'#fff',fontWeight:850,px:effectiveCollapsed?.8:1.2,py:1.1,borderRadius:1.5,flex:1,minWidth:0}}
      >
        <Sparkles size={18} color="#C9FF98"/>
        {!effectiveCollapsed&&<AlexText component="span" sx={{fontWeight:850}}>{brand}</AlexText>}
      </AlexButtonBase>

      {variant==='desktop'&&onToggleCollapsed&&<AlexTooltip title={effectiveCollapsed?'Expand menu':'Collapse menu'} placement="right">
        <AlexButtonBase onClick={onToggleCollapsed} aria-label={effectiveCollapsed?'Expand menu':'Collapse menu'} sx={{color:'#DCE7F7',width:30,height:30,minWidth:30,borderRadius:'50%'}}>
          {effectiveCollapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}
        </AlexButtonBase>
      </AlexTooltip>}

      {variant==='drawer'&&onClose&&<AlexButtonBase onClick={onClose} aria-label="Close navigation" sx={{color:'#DCE7F7',width:36,height:36,minWidth:36,borderRadius:'50%'}}>
        <X size={19}/>
      </AlexButtonBase>}
    </AlexBox>

    <AlexStack spacing={.45}>{primary.map(item=><NavItem item={item} collapsed={effectiveCollapsed} key={item.key}/>)}</AlexStack>

    {secondary.length>0&&<AlexBox sx={{mt:2.35}}>
      {!effectiveCollapsed&&<AlexBox sx={{display:'flex',alignItems:'center',gap:1.1,px:1.25,mb:1}}>
        <AlexText sx={{fontSize:10.5,letterSpacing:'.03em',whiteSpace:'nowrap',color:'#DCE7F7'}}>ADDITIONAL TOOLS</AlexText>
        <AlexBox sx={{height:'1px',bgcolor:'#AFC2DD',flex:1}}/>
      </AlexBox>}
      <AlexStack spacing={.45}>{secondary.map(item=><NavItem item={item} collapsed={effectiveCollapsed} key={item.key}/>)}</AlexStack>
    </AlexBox>}

    <AlexBox sx={{mt:'auto',pt:2}}>
      <AlexTooltip title={effectiveCollapsed?tooltipLabel:''} placement="right">
        <AlexButtonBase
          onClick={onFooterClick}
          aria-label={signedIn?`${footerLabel} account`:'Sign in'}
          sx={{
            borderRadius:2,
            bgcolor:'#0D356C',
            px:effectiveCollapsed?1:1.5,
            py:1.25,
            display:'flex',
            alignItems:'center',
            justifyContent:effectiveCollapsed?'center':'flex-start',
            gap:1.2,
            width:'100%',
            color:'#fff',
          }}
        >
          {signedIn?<AlexBox sx={{width:32,height:32,borderRadius:'50%',bgcolor:'#BDF3B0',display:'grid',placeItems:'center',color:'#08275B',fontWeight:850,flex:'0 0 auto'}}>{footerLabel.slice(0,1).toUpperCase()}</AlexBox>:<AlexBox sx={{width:32,height:32,borderRadius:'50%',bgcolor:'#12477F',display:'grid',placeItems:'center',color:'#fff',flex:'0 0 auto'}}><LogIn size={17}/></AlexBox>}
          {!effectiveCollapsed&&<AlexBox sx={{minWidth:0,flex:1,textAlign:'left'}}>
            <AlexText sx={{fontSize:13.5,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{signedIn?footerLabel:'Sign in'}</AlexText>
            {signedIn&&footerDetail&&<AlexText sx={{fontSize:10.5,color:'#C9D7EA',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{footerDetail}</AlexText>}
          </AlexBox>}
          {!effectiveCollapsed&&signedIn&&<Settings size={17}/>}
        </AlexButtonBase>
      </AlexTooltip>
    </AlexBox>
  </AlexBox>
}

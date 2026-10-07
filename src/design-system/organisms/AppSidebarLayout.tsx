import {useEffect,useState,type ReactNode} from 'react'
import {BarChart3,ClipboardList,Compass,Menu,UserRound} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexDrawer from '../atoms/AlexDrawer'
import AlexText from '../atoms/AlexText'
import SideNavigation from '../molecules/SideNavigation'
import {getCurrentAuthUser,loadUserProfile,subscribeToAuth,type AuthUser,type UserProfile} from '../../lib/supabase'

type NavKey='dashboard'|'practice-tests'|'practice-setup'|'vocabulary'|'question-bank'|'parsing-issues'|'performance'|'resources'

type Props={
  active:NavKey
  collapsed:boolean
  onToggleCollapsed:()=>void
  onDashboard:()=>void
  onPracticeTests:()=>void
  onPracticeSetup:()=>void
  onVocabulary:()=>void
  onQuestionBank:()=>void
  onParsingIssues:()=>void
  onPerformance:()=>void
  onResources:()=>void
  onSettings:()=>void
  children:ReactNode
  contentBackground?:string
}

export default function AppSidebarLayout({active,collapsed,onToggleCollapsed,onDashboard,onPracticeTests,onPracticeSetup,onVocabulary,onQuestionBank,onParsingIssues,onPerformance,onResources,onSettings,children,contentBackground='#FFFFFF'}:Props){
  const[user,setUser]=useState<AuthUser|null>(null)
  const[profile,setProfile]=useState<UserProfile|null>(null)
  const[mobileMenuOpen,setMobileMenuOpen]=useState(false)

  useEffect(()=>{
    let cancelled=false
    const refresh=async(nextUser?:AuthUser|null)=>{
      const resolved=nextUser===undefined?await getCurrentAuthUser():nextUser
      if(cancelled)return
      setUser(resolved)
      if(!resolved){setProfile(null);return}
      try{
        const nextProfile=await loadUserProfile()
        if(!cancelled)setProfile(nextProfile)
      }catch(error){
        console.warn('Profile load failed',error)
        if(!cancelled)setProfile(null)
      }
    }
    void refresh()
    const unsubscribe=subscribeToAuth(nextUser=>void refresh(nextUser))
    const handleProfileUpdated=()=>void refresh()
    window.addEventListener('sat-profile-updated',handleProfileUpdated)
    return()=>{cancelled=true;unsubscribe();window.removeEventListener('sat-profile-updated',handleProfileUpdated)}
  },[])

  const accountLabel=user?(profile?.displayName.trim()||user.email?.split('@')[0]||'Account'):'Sign in'
  const accountDetail=user?(profile?.grade?`Grade ${profile.grade}`:user.email??'Signed in'):''
  const desktopSidebarWidth=collapsed?76:244

  const closeAnd=(action:()=>void)=>()=>{setMobileMenuOpen(false);action()}
  const primaryDesktop=[
    {key:'dashboard',label:'Dashboard',active:active==='dashboard',onClick:onDashboard},
    {key:'practice-tests',label:'Practice Tests',active:active==='practice-tests',onClick:onPracticeTests},
    {key:'practice-setup',label:'Practice Setup',active:active==='practice-setup',onClick:onPracticeSetup},
    {key:'vocabulary',label:'Vocabulary',active:active==='vocabulary',onClick:onVocabulary},
    {key:'question-bank',label:'Question Bank',active:active==='question-bank',onClick:onQuestionBank},
    {key:'parsing-issues',label:'Parsing Issues',active:active==='parsing-issues',onClick:onParsingIssues},
    {key:'performance',label:'Performance',active:active==='performance',onClick:onPerformance},
  ]
  const secondaryDesktop=[{key:'resources',label:'Resources',active:active==='resources',onClick:onResources}]
  const primaryMobile=primaryDesktop.map(item=>({...item,onClick:closeAnd(item.onClick)}))
  const secondaryMobile=secondaryDesktop.map(item=>({...item,onClick:closeAnd(item.onClick)}))

  const menuIsActive=!['dashboard','practice-tests','performance'].includes(active)

  return <AlexBox
    data-testid="app-layout"
    sx={{
      minHeight:'100dvh',
      height:{xl:active==='dashboard'?'100dvh':'auto'},
      maxHeight:{lg:active==='dashboard'?'100dvh':'none'},
      width:'100%',
      maxWidth:'100vw',
      overflowX:'hidden',
      overflowY:{xl:active==='dashboard'?'hidden':'visible'},
      bgcolor:contentBackground,
      color:'#08275B',
    }}
  >
    <AlexBox sx={{display:{xs:'none',xl:'block'}}}>
      <SideNavigation
        variant="desktop"
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        onFooterClick={onSettings}
        footerLabel={accountLabel}
        footerDetail={accountDetail}
        signedIn={Boolean(user)}
        primary={primaryDesktop}
        secondary={secondaryDesktop}
      />
    </AlexBox>

    <AlexBox sx={{
      display:'none',
      '@media (min-width:768px) and (max-width:1535.98px)':{display:'block'},
    }}>
      <SideNavigation
        variant="tablet"
        collapsed
        onFooterClick={onSettings}
        footerLabel={accountLabel}
        footerDetail={accountDetail}
        signedIn={Boolean(user)}
        primary={primaryDesktop}
        secondary={secondaryDesktop}
      />
    </AlexBox>

    <AlexBox
      component="header"
      data-testid="mobile-header"
      sx={{
        display:'flex',
        '@media (min-width:768px)':{display:'none'},
        minHeight:56,
        px:1.25,
        alignItems:'center',
        justifyContent:'space-between',
        gap:1,
        position:'sticky',
        top:0,
        zIndex:40,
        bgcolor:'rgba(255,255,255,.96)',
        backdropFilter:'blur(12px)',
        borderBottom:'1px solid #E4E7EC',
      }}
    >
      <AlexButtonBase
        onClick={()=>setMobileMenuOpen(true)}
        aria-label="Open navigation"
        sx={{width:42,height:42,borderRadius:2,color:'#08275B'}}
      >
        <Menu size={22}/>
      </AlexButtonBase>
      <AlexButtonBase
        onClick={onDashboard}
        aria-label="SAT dashboard"
        sx={{display:'grid',placeItems:'center',minWidth:0,px:1.2,py:.7,borderRadius:2}}
      >
        <AlexText component="span" sx={{fontWeight:900,fontSize:16,color:'#08275B',lineHeight:1}}>SAT</AlexText>
        <AlexText component="span" sx={{fontSize:9.5,color:'#667085',lineHeight:1.2,mt:.25}}>Practice</AlexText>
      </AlexButtonBase>
      <AlexButtonBase
        onClick={onSettings}
        aria-label={user?`${accountLabel} account`:'Sign in'}
        sx={{
          width:42,height:42,borderRadius:'50%',
          bgcolor:user?'#E8F2FF':'#F2F4F7',
          color:'#08275B',
          display:'grid',placeItems:'center',
        }}
      >
        {user?<AlexText component="span" sx={{fontSize:14,fontWeight:850}}>{accountLabel.slice(0,1).toUpperCase()}</AlexText>:<UserRound size={20}/>}
      </AlexButtonBase>
    </AlexBox>

    <AlexDrawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={()=>setMobileMenuOpen(false)}
      ModalProps={{keepMounted:true}}
      PaperProps={{sx:{width:'min(88vw,300px)',maxWidth:'100vw',bgcolor:'#08275B'}}}
    >
      <SideNavigation
        variant="drawer"
        collapsed={false}
        onClose={()=>setMobileMenuOpen(false)}
        onFooterClick={closeAnd(onSettings)}
        footerLabel={accountLabel}
        footerDetail={accountDetail}
        signedIn={Boolean(user)}
        primary={primaryMobile}
        secondary={secondaryMobile}
      />
    </AlexDrawer>

    <AlexBox
      data-testid="app-content"
      sx={{
        minWidth:0,
        width:{xs:'100%',xl:`calc(100% - ${desktopSidebarWidth}px)`},
        ml:{xs:0,xl:`${desktopSidebarWidth}px`},
        '@media (min-width:768px) and (max-width:1535.98px)':{
          width:'calc(100% - 72px)',
          ml:'72px',
        },
        minHeight:'100dvh',
        height:{lg:active==='dashboard'?'100dvh':'auto'},
        overflowY:{lg:active==='dashboard'?'hidden':'visible'},
        px:{xs:1.25,sm:2.25,md:3,lg:3.5},
        maxWidth:{xs:'100%',xl:'none'},
        pb:'calc(76px + env(safe-area-inset-bottom))',
        '@media (min-width:768px)':{pb:0},
        boxSizing:'border-box',
        overflowX:'hidden',
        transition:{xl:'margin-left .18s ease, width .18s ease'},
      }}
    >
      <AlexBox sx={{
        width:'100%',
        maxWidth:'100%',
        minWidth:0,
        height:{xl:active==='dashboard'?'100%':'auto'},
        mx:'auto',
        overflowX:'clip',
        '& > *':{width:'100%',maxWidth:'100%',minWidth:0,overflowX:'hidden'},
      }}>
        {children}
      </AlexBox>
    </AlexBox>

    <AlexBox
      component="nav"
      aria-label="Mobile primary navigation"
      data-testid="mobile-bottom-nav"
      sx={{
        display:'grid',
        '@media (min-width:768px)':{display:'none'},
        gridTemplateColumns:'repeat(4,minmax(0,1fr))',
        width:'auto',
        maxWidth:'none',
        boxSizing:'border-box',
        margin:0,
        gap:0,
        justifyContent:'stretch',
        alignItems:'stretch',
        overflow:'hidden',
        position:'fixed',
        left:0,right:0,bottom:0,
        zIndex:45,
        minHeight:66,
        pb:'env(safe-area-inset-bottom)',
        bgcolor:'rgba(255,255,255,.98)',
        borderTop:'1px solid #E4E7EC',
        boxShadow:'0 -8px 24px rgba(8,39,91,.08)',
      }}
    >
      <MobileNavButton label="Dashboard" active={active==='dashboard'} icon={<Compass size={20}/>} onClick={onDashboard}/>
      <MobileNavButton label="Tests" active={active==='practice-tests'} icon={<ClipboardList size={20}/>} onClick={onPracticeTests}/>
      <MobileNavButton label="Stats" active={active==='performance'} icon={<BarChart3 size={20}/>} onClick={onPerformance}/>
      <MobileNavButton label="Menu" active={menuIsActive} icon={<Menu size={20}/>} onClick={()=>setMobileMenuOpen(true)}/>
    </AlexBox>
  </AlexBox>
}

function MobileNavButton({label,active,icon,onClick}:{label:string;active:boolean;icon:ReactNode;onClick:()=>void}){
  return <AlexButtonBase
    onClick={onClick}
    aria-label={label}
    aria-current={active?'page':undefined}
    sx={{
      minWidth:0,
      width:'auto',
      maxWidth:'100%',
      minHeight:64,
      px:.25,
      overflow:'hidden',
      justifyContent:'center',
      display:'flex',
      flexDirection:'column',
      gap:.35,
      color:active?'#0B376D':'#667085',
      bgcolor:active?'#F4F8FD':'transparent',
      borderTop:active?'2px solid #0B376D':'2px solid transparent',
    }}
  >
    {icon}
    <AlexText component="span" sx={{fontSize:10.5,fontWeight:active?850:650,color:'inherit',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</AlexText>
  </AlexButtonBase>
}

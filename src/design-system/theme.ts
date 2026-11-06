import {createTheme} from '@mui/material/styles'

export const dashboardTypography={
  eyebrow:{xs:'clamp(9px,2.7vw,11px)',sm:'clamp(10px,1.4vw,11px)',lg:'clamp(10px,.72vw,12px)'},
  heroTitle:{xs:'clamp(26px,8vw,32px)',sm:'clamp(30px,4.6vw,36px)',lg:'clamp(31px,2.15vw,40px)'},
  heroBody:{xs:'clamp(12px,3.5vw,14px)',sm:'clamp(12.5px,1.9vw,14.5px)',lg:'clamp(12.5px,.86vw,15px)'},
  heroScore:{xs:'clamp(20px,6vw,25px)',sm:'clamp(21px,3vw,27px)',lg:'clamp(22px,1.55vw,29px)'},
  cardTitle:{xs:'clamp(9px,2.8vw,10px)',sm:'clamp(9px,1.35vw,10.5px)',lg:'clamp(9px,.66vw,11px)'},
  metricValue:{xs:'clamp(25px,7vw,32px)',sm:'clamp(28px,4vw,34px)',lg:'clamp(28px,2vw,36px)'},
  supportBody:{xs:'clamp(11px,3vw,12.5px)',sm:'clamp(11.5px,1.6vw,13px)',lg:'clamp(11.5px,.76vw,13.5px)'},
  supportSecondary:{xs:'clamp(10px,2.8vw,11.5px)',sm:'clamp(10.5px,1.5vw,12px)',lg:'clamp(10.5px,.7vw,12px)'},
  supportTitle:{xs:'clamp(18px,5.5vw,21px)',sm:'clamp(19px,2.8vw,22px)',lg:'clamp(19px,1.35vw,23px)'},
} as const


export const dashboardCardTokens={
  radius:'8px',
  padding:{
    metric:{xs:1.5,sm:1.7,xl:1.8},
    hero:{xs:1.25,sm:1.4,xl:1.5},
    compact:{xs:1.1,sm:1.25,xl:1.35},
    support:{xs:1.6,sm:1.7,xl:1.7},
  },
  gap:{xs:.55,sm:.65,xl:.7},
  iconBox:{
    metric:{xs:34,sm:34,xl:34},
    hero:{xs:30,sm:32,xl:32},
    compact:{xs:28,sm:30,xl:30},
    support:{xs:24,sm:26,xl:26},
  },
  iconSize:{
    metric:20,
    hero:18,
    compact:17,
    support:16,
  },
} as const

export const alexTheme=createTheme({
  palette:{
    mode:'light',
    primary:{main:'#0B376D',dark:'#08275B',light:'#E8F2FF'},
    background:{default:'#F8F7F3',paper:'#FFFFFF'},
    text:{primary:'#08275B',secondary:'#5E6F87'},
    divider:'#D9D6CF'
  },
  shape:{borderRadius:10},
  typography:{
    fontFamily:'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button:{textTransform:'none',fontWeight:600},
    h1:{fontWeight:600,letterSpacing:'-0.025em'},
    h2:{fontWeight:600,letterSpacing:'-0.02em'}
  },
  components:{
    MuiCssBaseline:{styleOverrides:{body:{backgroundColor:'#F8F7F3'}}},
    MuiButton:{defaultProps:{disableElevation:true},styleOverrides:{root:{borderRadius:999,minHeight:38,paddingInline:18}}},
    MuiOutlinedInput:{styleOverrides:{root:{borderRadius:10,background:'#fff'}}},
    MuiFormLabel:{styleOverrides:{root:{fontWeight:600,color:'#344054'}}},
    MuiPaper:{styleOverrides:{root:{backgroundImage:'none'}}}
  }
})

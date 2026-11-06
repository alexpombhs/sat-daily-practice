import {Box,type BoxProps} from '@mui/material'
import type {ReactNode} from 'react'

type Props=BoxProps&{children:ReactNode}

export default function AlexStatusChip({children,sx,...props}:Props){
  return <Box component="span" sx={{display:'inline-flex',alignItems:'center',width:'max-content',px:.9,py:.45,borderRadius:.5,bgcolor:'#E8F2FF',color:'#08275B',fontSize:'0.62rem',lineHeight:1,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',...sx}} {...props}>{children}</Box>
}

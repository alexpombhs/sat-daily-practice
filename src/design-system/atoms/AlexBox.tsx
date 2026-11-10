import {forwardRef} from 'react'
import {Box,type BoxProps} from '@mui/material'

// Forward refs so page-level UI can bring an atomic Box into view.
const AlexBox=forwardRef<HTMLDivElement,BoxProps>((props,ref)=>{
  return <Box ref={ref} {...props}/>
})

AlexBox.displayName='AlexBox'

export default AlexBox

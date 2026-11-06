import {Button,type ButtonProps} from '@mui/material'

type Props=ButtonProps&{tone?:'primary'|'secondary'|'quiet'}

export default function AlexButton({tone='primary',sx,...props}:Props){
  const variant=tone==='primary'?'contained':tone==='secondary'?'outlined':'text'
  return <Button variant={variant} color="primary" sx={{fontWeight:600,minHeight:38,borderRadius:999,...sx}} {...props}/>
}

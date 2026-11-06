import {Button} from '@mui/material'

type Props={label:string;selected:boolean;disabled?:boolean;onClick:()=>void}

export default function AlexChoiceButton({label,selected,disabled,onClick}:Props){
  return <Button
    fullWidth
    variant={selected?'contained':'outlined'}
    disabled={disabled}
    onClick={onClick}
    aria-pressed={selected}
    sx={{minHeight:52,fontSize:'1rem',fontWeight:600}}
  >{label}</Button>
}

import {Checkbox,FormControlLabel} from '@mui/material'

type Props={label:string;checked:boolean;onChange:(checked:boolean)=>void}

export default function AlexCheckbox({label,checked,onChange}:Props){
  return <FormControlLabel
    control={<Checkbox checked={checked} onChange={e=>onChange(e.target.checked)}/>}
    label={label}
    sx={{m:0,'.MuiFormControlLabel-label':{fontWeight:600,fontSize:13.5,color:'text.primary'}}}
  />
}

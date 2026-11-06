import {FormControl,FormHelperText,InputLabel,MenuItem,Select,type SelectChangeEvent} from '@mui/material'

export type AlexDropdownOption<T extends string>={value:T;label:string}

type Props<T extends string>={
  id:string
  label:string
  value:T
  options:AlexDropdownOption<T>[]
  onChange:(value:T)=>void
  helperText?:string
  fullWidth?:boolean
}

export default function AlexDropdown<T extends string>({id,label,value,options,onChange,helperText,fullWidth=true}:Props<T>){
  const labelId=`${id}-label`
  return <FormControl fullWidth={fullWidth} size="small" sx={{minWidth:0}}>
    <InputLabel id={labelId}>{label}</InputLabel>
    <Select
      labelId={labelId}
      id={id}
      value={value}
      label={label}
      onChange={(event:SelectChangeEvent<T>)=>onChange(event.target.value as T)}
      sx={{'& .MuiSelect-select':{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}}
      MenuProps={{
        anchorOrigin:{vertical:'bottom',horizontal:'left'},
        transformOrigin:{vertical:'top',horizontal:'left'},
        marginThreshold:12,
        PaperProps:{sx:{mt:.5,maxHeight:320,maxWidth:'calc(100vw - 24px)',border:'1px solid',borderColor:'divider',boxShadow:'0 14px 36px rgba(16,24,40,.12)'}},
      }}
    >
      {options.map(option=><MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </Select>
    {helperText&&<FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
}

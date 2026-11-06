import {FormControl,FormHelperText,InputLabel,MenuItem,Select,type SelectChangeEvent} from '@mui/material'

import useDropdownScrollDismiss from './useDropdownScrollDismiss'

export type AlexDropdownOption<T extends string>={value:T;label:string}

type Props<T extends string>={
  id:string
  label:string
  value:T
  options:AlexDropdownOption<T>[]
  onChange:(value:T)=>void
  helperText?:string
  fullWidth?:boolean
  menuPlacement?:'below'|'above'
}

export default function AlexDropdown<T extends string>({id,label,value,options,onChange,helperText,fullWidth=true,menuPlacement='below'}:Props<T>){
  const {open,onOpen,onClose,menuPaperRef,popoverActionRef}=useDropdownScrollDismiss()
  const labelId=`${id}-label`
  return <FormControl fullWidth={fullWidth} size="small" sx={{minWidth:0}}>
    <InputLabel id={labelId}>{label}</InputLabel>
    <Select
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      labelId={labelId}
      id={id}
      value={value}
      label={label}
      onChange={(event:SelectChangeEvent<T>)=>onChange(event.target.value as T)}
      sx={{'& .MuiSelect-select':{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}}
      MenuProps={{
        action:popoverActionRef,
        variant:'menu',
        anchorOrigin:{vertical:menuPlacement==='above'?'top':'bottom',horizontal:'left'},
        transformOrigin:{vertical:menuPlacement==='above'?'bottom':'top',horizontal:'left'},
        marginThreshold:12,
        PaperProps:{ref:menuPaperRef,sx:{mt:menuPlacement==='above'?0:.5,mb:menuPlacement==='above'?.5:0,maxHeight:320,maxWidth:'calc(100vw - 24px)',border:'1px solid',borderColor:'divider',boxShadow:'0 14px 36px rgba(16,24,40,.12)'}},
      }}
    >
      {options.map(option=><MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </Select>
    {helperText&&<FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
}

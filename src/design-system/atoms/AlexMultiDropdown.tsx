import {Checkbox,FormControl,FormHelperText,InputLabel,ListItemText,MenuItem,Select,type SelectChangeEvent} from '@mui/material'

export type AlexMultiDropdownOption<T extends string>={value:T;label:string}

type Props<T extends string>={
  id:string
  label:string
  value:T[]
  options:AlexMultiDropdownOption<T>[]
  onChange:(values:T[])=>void
  allLabel?:string
  helperText?:string
  fullWidth?:boolean
}

const ALL_VALUE='__all__'

export default function AlexMultiDropdown<T extends string>({
  id,label,value,options,onChange,allLabel='All categories',helperText,fullWidth=true,
}:Props<T>){
  const labelId=`${id}-label`
  const selectedLabels=options.filter(option=>value.includes(option.value)).map(option=>option.label)
  const display=selectedLabels.length===0?allLabel
    :selectedLabels.length===1?selectedLabels[0]
    :selectedLabels.length===2?selectedLabels.join(', ')
    :`${selectedLabels.length} categories selected`

  const handleChange=(event:SelectChangeEvent<string[]>)=>{
    const next=typeof event.target.value==='string'?event.target.value.split(','):event.target.value
    if(next.includes(ALL_VALUE)){onChange([]);return}
    const allowed=new Set<string>(options.map(option=>option.value))
    onChange([...new Set(next.filter(item=>allowed.has(item)))] as T[])
  }

  return <FormControl fullWidth={fullWidth} size="small">
    <InputLabel id={labelId} shrink>{label}</InputLabel>
    <Select<string[]>
      multiple
      displayEmpty
      labelId={labelId}
      id={id}
      value={value}
      label={label}
      onChange={handleChange}
      renderValue={()=>display}
      MenuProps={{PaperProps:{sx:{mt:.75,maxHeight:360,border:'1px solid',borderColor:'divider',boxShadow:'0 14px 36px rgba(16,24,40,.12)'}}}}
      sx={{'& .MuiSelect-select':{fontWeight:500}}}
    >
      <MenuItem value={ALL_VALUE}>
        <Checkbox checked={value.length===0} size="small" sx={{mr:.75}}/>
        <ListItemText primary={allLabel} primaryTypographyProps={{fontSize:13.5,fontWeight:600}}/>
      </MenuItem>
      {options.map(option=><MenuItem key={option.value} value={option.value}>
        <Checkbox checked={value.includes(option.value)} size="small" sx={{mr:.75}}/>
        <ListItemText primary={option.label} primaryTypographyProps={{fontSize:13.5,fontWeight:500}}/>
      </MenuItem>)}
    </Select>
    {helperText&&<FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
}

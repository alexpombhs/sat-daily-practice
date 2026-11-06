import {ToggleButton,ToggleButtonGroup,type ToggleButtonGroupProps} from '@mui/material'

export type AlexViewToggleOption<T extends string>={value:T;label:string}
type Props<T extends string>=Omit<ToggleButtonGroupProps,'value'|'onChange'|'children'|'exclusive'>&{
  value:T
  options:AlexViewToggleOption<T>[]
  onChange:(value:T)=>void
  ariaLabel:string
}

export default function AlexViewToggle<T extends string>({value,options,onChange,ariaLabel,sx,...props}:Props<T>){
  return <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_event,next:T|null)=>{if(next!==null)onChange(next)}}
    aria-label={ariaLabel}
    size="small"
    sx={[
      {border:'1px solid #E1E6EE',borderRadius:'10px',p:.35,backgroundColor:'#F8FAFC',gap:.35,
        '& .MuiToggleButtonGroup-grouped':{border:'0 !important',borderRadius:'8px !important',textTransform:'none',fontWeight:600,
          fontSize:13,padding:'7px 14px',minHeight:34,color:'#667085'},
        '& .MuiToggleButton-root.Mui-selected':{color:'#12477F',backgroundColor:'#fff',boxShadow:'0 1px 4px rgba(16,24,40,.10)'},
        '& .MuiToggleButton-root.Mui-selected:hover':{backgroundColor:'#fff'},
      },
      ...(Array.isArray(sx)?sx:sx?[sx]:[]),
    ]}
    {...props}
  >
    {options.map(option=><ToggleButton key={option.value} value={option.value} aria-label={option.label}>{option.label}</ToggleButton>)}
  </ToggleButtonGroup>
}

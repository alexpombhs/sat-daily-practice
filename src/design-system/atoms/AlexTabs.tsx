import {Tab,Tabs,type TabsProps} from '@mui/material'

export type AlexTabOption<T extends string>={value:T;label:string}

type Props<T extends string>=Omit<TabsProps,'value'|'onChange'|'children'>&{
  value:T
  options:AlexTabOption<T>[]
  onChange:(value:T)=>void
}

export default function AlexTabs<T extends string>({value,options,onChange,sx,...props}:Props<T>){
  const baseSx={
    minHeight:40,
    borderBottom:'1px solid',
    borderColor:'divider',
    '& .MuiTabs-indicator':{height:3,borderRadius:999},
    '& .MuiTab-root':{
      minHeight:40,
      px:2,
      py:1,
      textTransform:'none',
      fontWeight:800,
      fontSize:13.5,
    },
  }
  return <Tabs
    value={value}
    onChange={(_event,next)=>onChange(next as T)}
    sx={sx?[baseSx,...(Array.isArray(sx)?sx:[sx])]:baseSx}
    {...props}
  >
    {options.map(option=><Tab key={option.value} value={option.value} label={option.label}/>)}
  </Tabs>
}

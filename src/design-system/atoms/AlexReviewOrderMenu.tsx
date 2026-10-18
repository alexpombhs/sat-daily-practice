import {useState,type MouseEvent} from 'react'
import {Button,Menu,MenuItem} from '@mui/material'
import {ChevronDown} from 'lucide-react'

type Order='math-first'|'reading-first'|'mixed'
const labels:Record<Order,string>={'math-first':'Math first','reading-first':'Reading first',mixed:'Mixed order'}

export default function AlexReviewOrderMenu({value,onChange}:{value:Order;onChange:(order:Order)=>void}){
  const[anchor,setAnchor]=useState<HTMLElement|null>(null)
  return <>
    <Button size="small" onClick={(event:MouseEvent<HTMLButtonElement>)=>setAnchor(event.currentTarget)} endIcon={<ChevronDown size={12}/>} aria-haspopup="menu" aria-expanded={Boolean(anchor)} sx={{textTransform:'none',minWidth:0,minHeight:22,p:'0 4px',fontSize:11.5,fontWeight:650,lineHeight:1.2,color:'#0B376D',whiteSpace:'nowrap','&:hover':{bgcolor:'#EDF2F8'}}}>
      Order: {labels[value]}
    </Button>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)} MenuListProps={{'aria-label':'Failed question review order'}} PaperProps={{sx:{minWidth:155,boxShadow:'0 8px 24px rgba(16,24,40,.12)'}}}>
      {(['math-first','reading-first','mixed'] as const).map(order=><MenuItem key={order} selected={value===order} onClick={()=>{setAnchor(null);onChange(order)}} sx={{fontSize:13,minHeight:36}}>{labels[order]}</MenuItem>)}
    </Menu>
  </>
}
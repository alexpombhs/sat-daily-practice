import {Plus,Trash2} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexTextField from '../atoms/AlexTextField'
import type {ExamTarget} from '../../types'

type Props={
  targets:ExamTarget[]
  onChange:(targets:ExamTarget[])=>void
}

function fallbackDate(){
  const date=new Date()
  date.setMonth(date.getMonth()+2)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export default function ExamTargetList({targets,onChange}:Props){
  function updateTarget(index:number,patch:Partial<ExamTarget>){
    onChange(targets.map((target,targetIndex)=>targetIndex===index?{...target,...patch}:target))
  }

  return <AlexBox sx={{display:'grid',gap:1}}>
    {targets.map((target,index)=><AlexBox
      key={`${target.date}-${index}`}
      sx={{display:'grid',gridTemplateColumns:{xs:'1fr auto',sm:'minmax(90px,.7fr) minmax(145px,1fr) auto'},gap:.75,alignItems:'center'}}
    >
      <AlexTextField
        fullWidth
        size="small"
        label="Test"
        value={target.label}
        placeholder="PSAT or SAT"
        onChange={event=>updateTarget(index,{label:event.target.value})}
      />
      <AlexTextField
        fullWidth
        size="small"
        type="date"
        label="Date"
        value={target.date}
        InputLabelProps={{shrink:true}}
        onChange={event=>updateTarget(index,{date:event.target.value})}
        sx={{gridColumn:{xs:'1 / 2',sm:'auto'}}}
      />
      <AlexIconButton
        label={`Remove ${target.label||'test'} date`}
        onClick={()=>onChange(targets.filter((_,targetIndex)=>targetIndex!==index))}
        sx={{gridColumn:{xs:'2 / 3',sm:'auto'},gridRow:{xs:'1 / 3',sm:'auto'}}}
      >
        <Trash2 size={16}/>
      </AlexIconButton>
    </AlexBox>)}
    <AlexButton
      tone="quiet"
      startIcon={<Plus size={16}/>}
      onClick={()=>onChange([...targets,{label:'SAT',date:fallbackDate()}])}
      sx={{justifySelf:'start',px:1.25}}
    >
      Add another test
    </AlexButton>
  </AlexBox>
}

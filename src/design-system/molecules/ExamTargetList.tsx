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
      key={index}
      sx={{display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr) auto',sm:'minmax(70px,.6fr) minmax(140px,1fr) minmax(88px,.65fr) minmax(88px,.65fr) auto'},gap:.75,alignItems:'center'}}
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
      {(['readingWritingScore','mathScore'] as const).map((field)=><AlexTextField
        key={field}
        fullWidth
        size="small"
        type="number"
        label={field==='readingWritingScore'?'Reading & Writing':'Math'}
        placeholder="—"
        value={target[field]??''}
        inputProps={{min:160,max:target.label.toUpperCase().includes('PSAT')?760:800,step:10}}
        onChange={event=>{
          const raw=event.target.value
          if(raw===''){updateTarget(index,{[field]:undefined});return}
          const value=Number(raw)
          if(Number.isInteger(value)&&value>=0&&value<=800)updateTarget(index,{[field]:value,score:undefined})
        }}
        sx={{gridColumn:{xs:'1 / 2',sm:'auto'}}}
      />)}
      <AlexBox sx={{gridColumn:{xs:'1 / 2',sm:'1 / -2'},fontSize:12,fontWeight:750,color:'#667085'}}>
        Total: {target.readingWritingScore!==undefined&&target.mathScore!==undefined
          ?target.readingWritingScore+target.mathScore
          :target.score??'—'}
      </AlexBox>
      <AlexIconButton
        label={`Remove ${target.label||'test'} date`}
        onClick={()=>onChange(targets.filter((_,targetIndex)=>targetIndex!==index))}
        sx={{gridColumn:{xs:'2 / 3',sm:'auto'},gridRow:{xs:'1 / 5',sm:'1 / 2'}}}
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

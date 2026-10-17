import {Plus,Trash2} from 'lucide-react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexNumberField from '../atoms/AlexNumberField'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import PracticeSettingField from './PracticeSettingField'
import SettingsFieldGroup from './SettingsFieldGroup'
import type {ExamTarget,Settings} from '../../types'

type Props={settings:Settings;onChange:(settings:Settings)=>void}

function normalizedTargets(settings:Settings):ExamTarget[]{
  if(settings.examTargets?.length)return settings.examTargets
  return settings.targetExamDate?[{label:'Exam',date:settings.targetExamDate}]:[]
}

export default function PracticeGoalSettings({settings,onChange}:Props){
  const examTargets=normalizedTargets(settings)

  function saveExamTargets(next:ExamTarget[]){
    const sorted=next
      .map(target=>({label:target.label.trim()||'Exam',date:target.date}))
      .filter(target=>target.date)
      .sort((a,b)=>a.date.localeCompare(b.date))
    onChange({...settings,examTargets:sorted,targetExamDate:sorted[0]?.date})
  }

  function updateTarget(index:number,patch:Partial<ExamTarget>){
    const next=examTargets.map((target,targetIndex)=>targetIndex===index?{...target,...patch}:target)
    saveExamTargets(next)
  }

  function addTarget(){
    const nextDate=new Date()
    nextDate.setMonth(nextDate.getMonth()+2)
    const date=`${nextDate.getFullYear()}-${String(nextDate.getMonth()+1).padStart(2,'0')}-${String(nextDate.getDate()).padStart(2,'0')}`
    saveExamTargets([...examTargets,{label:'SAT',date}])
  }

  return <AlexBox sx={{display:'grid',gap:2}}>
    <SettingsFieldGroup>
      <PracticeSettingField
        label="Test dates"
        helperText="Add each PSAT or SAT date. Test days are rest days and are not counted as missed practice."
        control={<AlexBox sx={{display:'grid',gap:1}}>
          {examTargets.map((target,index)=><AlexBox key={`${target.date}-${index}`} sx={{display:'grid',gridTemplateColumns:'minmax(90px,.7fr) minmax(145px,1fr) auto',gap:.75,alignItems:'center'}}>
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
            />
            <AlexIconButton label={`Remove ${target.label||'test'} date`} onClick={()=>saveExamTargets(examTargets.filter((_,targetIndex)=>targetIndex!==index))}>
              <Trash2 size={16}/>
            </AlexIconButton>
          </AlexBox>)}
          <AlexButton tone="quiet" startIcon={<Plus size={16}/>} onClick={addTarget} sx={{justifySelf:'start',px:1.25}}>
            Add another test
          </AlexButton>
        </AlexBox>}
      />
      <PracticeSettingField
        label="Target score"
        helperText="Your practice estimate is compared with this goal."
        control={<AlexTextField fullWidth size="small" type="number" label="Target score" value={settings.targetScore??''} inputProps={{min:400,max:1600,step:10}} placeholder="e.g. 1400" onChange={event=>{const value=event.target.value;onChange({...settings,targetScore:value?Number(value):undefined})}}/>}
      />
    </SettingsFieldGroup>

    <AlexAccordion
      summary={<AlexBox>
        <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>Advanced planning settings</AlexText>
        <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>Optional controls for coverage and pace estimates</AlexText>
      </AlexBox>}
    >
      <SettingsFieldGroup>
        <PracticeSettingField
          label="Question coverage"
          helperText="Percent of the available question bank you want to work through."
          control={<AlexNumberField fullWidth label="Coverage %" value={settings.targetCoveragePercent??100} min={1} max={100} onChange={targetCoveragePercent=>onChange({...settings,targetCoveragePercent})}/>}
        />
        <PracticeSettingField
          label="Fallback pace"
          helperText="Used until there is enough timing history to estimate your actual pace."
          control={<AlexNumberField fullWidth label="Minutes per question" value={settings.fallbackMinutesPerQuestion??2} min={.25} max={20} inputProps={{step:.25}} onChange={fallbackMinutesPerQuestion=>onChange({...settings,fallbackMinutesPerQuestion})}/>}
        />
      </SettingsFieldGroup>
    </AlexAccordion>
  </AlexBox>
}

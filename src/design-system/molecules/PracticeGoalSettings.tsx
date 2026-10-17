import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexNumberField from '../atoms/AlexNumberField'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import ExamTargetList from './ExamTargetList'
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
      .map(target=>({label:target.label.trim()||'Exam',date:target.date,score:target.score}))
      .filter(target=>target.date)
      .sort((a,b)=>a.date.localeCompare(b.date))
    onChange({...settings,examTargets:sorted,targetExamDate:sorted[0]?.date})
  }

  return <AlexBox sx={{display:'grid',gap:2}}>
    <SettingsFieldGroup>
      <PracticeSettingField
        label="Test dates"
        helperText="Add each PSAT or SAT date. Test days are rest days and are not counted as missed practice."
        control={<ExamTargetList targets={examTargets} onChange={saveExamTargets}/>}
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

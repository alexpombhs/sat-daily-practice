import AlexAccordion from '../atoms/AlexAccordion'
import AlexButton from '../atoms/AlexButton'
import AlexBox from '../atoms/AlexBox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexNumberField from '../atoms/AlexNumberField'
import AlexSurface from '../atoms/AlexSurface'
import AlexSwitch from '../atoms/AlexSwitch'
import AlexText from '../atoms/AlexText'
import PracticeGoalSettings from '../molecules/PracticeGoalSettings'
import PracticeSettingField from '../molecules/PracticeSettingField'
import StudyPlanRecommendation from './StudyPlanRecommendation'
import type {PracticePlanRecommendation} from '../../lib/practicePlan'
import type {PracticeTestFilter,Settings} from '../../types'

type PracticeTestOption={value:PracticeTestFilter;label:string}

type Props={
  settings:Settings
  practiceTests:PracticeTestOption[]
  missedQuestionCount:number
  failedQuestionCount:number
  onChange:(settings:Settings)=>void
  onStart:()=>void
  recommendation:PracticePlanRecommendation
}

export default function PracticeSetupPanel({settings,practiceTests,missedQuestionCount,failedQuestionCount,onChange,onStart,recommendation}:Props){
  const selectionMode=settings.selectionMode??'adaptive'
  const practiceTest=settings.practiceTest??'all'
  const missedOnly=settings.failedOnly??false
  const failedEverOnly=settings.failedEverOnly??false
  const failedRecoveryCorrectAnswers=settings.failedRecoveryCorrectAnswers??2
  const answerFeedbackTiming=settings.answerFeedbackTiming??'end'
  const dailyLabel=recommendation.estimatedDailyMinutes>0
    ?`${recommendation.estimatedDailyMinutes} min/day`
    :'On track'

  return <AlexSurface sx={{width:'100%',maxWidth:860,p:{xs:1.6,sm:2.25,md:3.5},borderRadius:3,border:'1px solid #E4E7EC'}}>
    <AlexBox sx={{display:'grid',gap:.5,mb:2}}>
      <AlexText component="h2" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:22,sm:24},fontWeight:500,color:'#08275B'}}>Practice setup</AlexText>
      <AlexText sx={{fontSize:14,color:'#667085',lineHeight:1.5}}>Choose what to practice and how long each session should be.</AlexText>
    </AlexBox>

    <PracticeSettingField
      label="Practice test"
      helperText="Choose one test or mix all available questions."
      control={<AlexDropdown id="practice-test" label="Question source" value={practiceTest} options={practiceTests} onChange={value=>onChange({...settings,practiceTest:value})}/>}
    />

    <PracticeSettingField
      label="Subject"
      helperText="Practice both sections or focus on one."
      control={<AlexDropdown id="practice-subject" label="Subject" value={settings.mode} options={[{value:'both',label:'Reading & Writing + Math'},{value:'english',label:'Reading & Writing'},{value:'math',label:'Math'}]} onChange={mode=>onChange({...settings,mode})}/>}
    />

    <PracticeSettingField
      label="Question selection"
      helperText="Adaptive prioritizes unseen and weaker questions."
      control={<AlexDropdown id="practice-selection-mode" label="Selection mode" value={selectionMode} options={[{value:'adaptive',label:'Adaptive'},{value:'random',label:'Random'}]} onChange={value=>onChange({...settings,selectionMode:value})}/>}
    />

    <PracticeSettingField
      label="Questions per session"
      helperText="Up to this many eligible questions will be included."
      control={<AlexNumberField fullWidth label="Questions per session" value={settings.questionsPerSession} min={1} max={30} onChange={questionsPerSession=>onChange({...settings,questionsPerSession})}/>}
    />

    <PracticeSettingField
      label="Answer feedback"
      helperText={answerFeedbackTiming==='end'
        ?'Complete the full session first, then see your score and review correct answers with explanations.'
        :'See whether each answer is correct immediately after submitting it.'}
      control={<AlexDropdown
        id="answer-feedback-timing"
        label="Show correct answers"
        value={answerFeedbackTiming}
        options={[{value:'end',label:'At the end of the session'},{value:'immediate',label:'After each question'}]}
        onChange={answerFeedbackTiming=>onChange({...settings,answerFeedbackTiming})}
      />}
    />

    <PracticeSettingField
      label="Missed questions"
      helperText={missedQuestionCount
        ?`${missedQuestionCount} missed question${missedQuestionCount===1?'':'s'} match the current filters. Missed questions are new questions you have not practiced yet.`
        :'No new questions match the current filters.'}
      control={<AlexSwitch
        label="Missed questions only"
        checked={missedOnly}
        disabled={!missedQuestionCount&&!missedOnly}
        onChange={checked=>onChange({...settings,failedOnly:checked,failedEverOnly:checked?false:failedEverOnly})}
      />}
    />

    <PracticeSettingField
      label="Failed questions"
      helperText={failedQuestionCount
        ?`${failedQuestionCount} failed question${failedQuestionCount===1?'':'s'} match the current filters. A failed question stays here until you answer it correctly ${failedRecoveryCorrectAnswers} time${failedRecoveryCorrectAnswers===1?'':'s'} after the most recent incorrect answer.`
        :'No failed questions match the current filters.'}
      control={<AlexSwitch
        label="Failed questions only"
        checked={failedEverOnly}
        disabled={!failedQuestionCount&&!failedEverOnly}
        onChange={checked=>onChange({...settings,failedEverOnly:checked,failedOnly:checked?false:missedOnly})}
      />}
    />

    <PracticeSettingField
      label="Failed-question recovery"
      helperText="Choose how many correct attempts after the latest miss are required before a question leaves the failed pool."
      control={<AlexBox sx={{maxWidth:260}}>
        <AlexNumberField
          fullWidth
          label="Correct answers to clear"
          value={failedRecoveryCorrectAnswers}
          min={1}
          max={5}
          onChange={failedRecoveryCorrectAnswers=>onChange({...settings,failedRecoveryCorrectAnswers})}
        />
      </AlexBox>}
    />

    <AlexAccordion
      sx={{mt:2.25}}
      summary={<AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1.25,width:'100%',pr:1,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:850,color:'#08275B'}}>Study plan</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>Goals and recommended daily pace</AlexText>
        </AlexBox>
        <AlexText sx={{fontSize:14,fontWeight:850,color:'#6558F5',whiteSpace:'nowrap'}}>{dailyLabel}</AlexText>
      </AlexBox>}
    >
      <PracticeGoalSettings settings={settings} onChange={onChange}/>
      <AlexBox sx={{mt:2,pt:2,borderTop:'1px solid #EAECF0'}}>
        <StudyPlanRecommendation recommendation={recommendation} compact/>
      </AlexBox>
    </AlexAccordion>

    <AlexBox sx={{display:'flex',gap:1,flexWrap:'wrap',pt:2.5,mt:2.5,borderTop:'1px solid #EAECF0',flexDirection:{xs:'column',sm:'row'}}}>
      <AlexButton fullWidth sx={{width:{xs:'100%',sm:'auto'}}} onClick={onStart} disabled={(missedOnly&&missedQuestionCount===0)||(failedEverOnly&&failedQuestionCount===0)}>Start practice</AlexButton>
    </AlexBox>
  </AlexSurface>
}

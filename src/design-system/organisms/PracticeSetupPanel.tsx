import AlexButton from '../atoms/AlexButton'
import AlexBox from '../atoms/AlexBox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexNumberField from '../atoms/AlexNumberField'
import AlexSwitch from '../atoms/AlexSwitch'
import AlexCheckbox from '../atoms/AlexCheckbox'
import AlexText from '../atoms/AlexText'
import PracticeGoalSettings from '../molecules/PracticeGoalSettings'
import PracticeSettingField from '../molecules/PracticeSettingField'
import PracticeSetupSection from '../molecules/PracticeSetupSection'
import SettingsFieldGroup from '../molecules/SettingsFieldGroup'
import StudyPlanRecommendation from './StudyPlanRecommendation'
import type {PracticePlanRecommendation} from '../../lib/practicePlan'
import type {PracticeTestFilter,QuestionDifficulty,Settings} from '../../types'

type PracticeTestOption={value:PracticeTestFilter;label:string}

type Props={
  settings:Settings
  practiceTests:PracticeTestOption[]
  difficultyCounts:{all:number;easy:number;medium:number;advanced:number}
  newQuestionCount:number
  failedQuestionCount:number
  onChange:(settings:Settings)=>void
  onStart:()=>void
  recommendation:PracticePlanRecommendation
}

export default function PracticeSetupPanel({settings,practiceTests,difficultyCounts,newQuestionCount,failedQuestionCount,onChange,onStart,recommendation}:Props){
  const difficultyLevels=settings.difficultyLevels??(settings.difficulty&&settings.difficulty!=='all'?[settings.difficulty]:['easy','medium','advanced'] as QuestionDifficulty[])
  const difficultyAll=difficultyLevels.length===3
  const filteredDifficultyCount=difficultyAll?difficultyCounts.all:difficultyLevels.reduce((sum,level)=>sum+difficultyCounts[level],0)
  const setDifficultyLevel=(level:QuestionDifficulty,checked:boolean)=>{
    const updated=checked?[...new Set([...difficultyLevels,level])]:difficultyLevels.filter(item=>item!==level)
    onChange({...settings,difficulty:'all',difficultyLevels:updated})
  }
  const selectionMode=settings.selectionMode??'adaptive'
  const practiceTest=settings.practiceTest??'all'
  const newOnly=settings.failedOnly??false
  const failedEverOnly=settings.failedEverOnly??false
  const failedRecoveryCorrectAnswers=settings.failedRecoveryCorrectAnswers??2
  const answerFeedbackTiming=settings.answerFeedbackTiming??'end'
  const dailyLabel=recommendation.estimatedDailyMinutes>0
    ?`${recommendation.estimatedDailyMinutes} min/day`
    :'On track'
  const startDisabled=(newOnly&&newQuestionCount===0)||(failedEverOnly&&failedQuestionCount===0)

  return <AlexBox sx={{width:'100%',maxWidth:960,display:'grid',gap:{xs:2.5,md:3}}}>
    <PracticeSetupSection
      title="Session basics"
      description="Choose the source, subject, length, and when answers are revealed."
    >
      <SettingsFieldGroup>
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
          label="Questions per session"
          helperText="Up to this many eligible questions will be included."
          control={<AlexNumberField fullWidth label="Questions per session" value={settings.questionsPerSession} min={1} max={30} onChange={questionsPerSession=>onChange({...settings,questionsPerSession})}/>}
        />
        <PracticeSettingField
          label="Answer feedback"
          helperText={answerFeedbackTiming==='end'
            ?'See your score and explanations after the full session.'
            :'See whether each answer is correct immediately after submitting it.'}
          control={<AlexDropdown
            id="answer-feedback-timing"
            label="Show correct answers"
            value={answerFeedbackTiming}
            options={[{value:'end',label:'At the end of the session'},{value:'immediate',label:'After each question'}]}
            onChange={answerFeedbackTiming=>onChange({...settings,answerFeedbackTiming})}
          />}
        />
      </SettingsFieldGroup>
    </PracticeSetupSection>

    <PracticeSetupSection
      title="Question pool"
      description="Control how questions are selected and which questions are eligible."
    >
      <SettingsFieldGroup>
        <PracticeSettingField
          label="Question selection"
          helperText="Adaptive prioritizes unseen and weaker questions."
          control={<AlexDropdown id="practice-selection-mode" label="Selection mode" value={selectionMode} options={[{value:'adaptive',label:'Adaptive'},{value:'random',label:'Random'}]} onChange={value=>onChange({...settings,selectionMode:value})}/>}
        />
        <PracticeSettingField
          label="Difficulty"
          helperText={`${filteredDifficultyCount} question${filteredDifficultyCount===1?'':'s'} match the current source, subject, and difficulty filters.`}
          control={<AlexBox sx={{display:'flex',flexWrap:{xs:'wrap',md:'nowrap'},gap:{xs:0,sm:.5},alignItems:'center',justifyContent:'space-between'}}>
            <AlexCheckbox label="All" checked={difficultyAll} onChange={checked=>onChange({...settings,difficulty:'all',difficultyLevels:checked?['easy','medium','advanced']:[]})}/>
            {(['easy','medium','advanced'] as QuestionDifficulty[]).map(level=>
              <AlexCheckbox key={level} checked={difficultyLevels.includes(level)} onChange={checked=>setDifficultyLevel(level,checked)} label={level[0].toUpperCase()+level.slice(1)}/>
            )}
          </AlexBox>}
        />
        <PracticeSettingField
          label="New questions"
          helperText={newQuestionCount
            ?`${newQuestionCount} new question${newQuestionCount===1?'':'s'} match the current filters.`
            :'No new questions match the current filters.'}
          control={<AlexSwitch
            label="New questions only"
            checked={newOnly}
            disabled={!newQuestionCount&&!newOnly}
            onChange={checked=>onChange({...settings,failedOnly:checked,failedEverOnly:checked?false:failedEverOnly})}
          />}
        />
        <PracticeSettingField
          label="Failed questions"
          helperText={failedQuestionCount
            ?`${failedQuestionCount} failed question${failedQuestionCount===1?'':'s'} match the current filters.`
            :'No failed questions match the current filters.'}
          control={<AlexSwitch
            label="Failed questions only"
            checked={failedEverOnly}
            disabled={!failedQuestionCount&&!failedEverOnly}
            onChange={checked=>onChange({...settings,failedEverOnly:checked,failedOnly:checked?false:newOnly})}
          />}
        />
        <PracticeSettingField
          label="Failed-question recovery"
          helperText={`A failed question leaves the pool after ${failedRecoveryCorrectAnswers} correct attempt${failedRecoveryCorrectAnswers===1?'':'s'} after the latest miss.`}
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
      </SettingsFieldGroup>
    </PracticeSetupSection>

    <PracticeSetupSection
      title="Study plan"
      description="Set your exam goals and use them to calculate a recommended pace."
      trailing={<AlexText sx={{fontSize:14,fontWeight:850,color:'#6558F5',whiteSpace:'nowrap'}}>{dailyLabel}</AlexText>}
    >
      <PracticeGoalSettings settings={settings} onChange={onChange}/>
      <AlexBox sx={{mt:.25}}>
        <StudyPlanRecommendation recommendation={recommendation} compact/>
      </AlexBox>
    </PracticeSetupSection>

    <AlexBox sx={{display:'flex',alignItems:{xs:'stretch',sm:'center'},justifyContent:'space-between',gap:1.5,pt:.5,flexDirection:{xs:'column',sm:'row'}}}>
      <AlexText sx={{fontSize:13,color:'#667085'}}>
        Settings save automatically and stay synced across devices.
      </AlexText>
      <AlexButton
        onClick={onStart}
        disabled={startDisabled}
        sx={{width:{xs:'100%',sm:180}}}
      >
        Start practice
      </AlexButton>
    </AlexBox>
  </AlexBox>
}

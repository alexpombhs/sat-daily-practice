import AlexButton from '../atoms/AlexButton'
import AlexBox from '../atoms/AlexBox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexNumberField from '../atoms/AlexNumberField'
import AlexSwitch from '../atoms/AlexSwitch'
import AlexCheckbox from '../atoms/AlexCheckbox'
import AlexSurface from '../atoms/AlexSurface'
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

function labelForTest(value:PracticeTestFilter,options:PracticeTestOption[]){
  return options.find(option=>option.value===value)?.label??'All available tests'
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
  const startDisabled=(newOnly&&newQuestionCount===0)||(failedEverOnly&&failedQuestionCount===0)

  const subjectLabel=settings.mode==='both'?'Reading & Writing + Math':settings.mode==='english'?'Reading & Writing':'Math'
  const feedbackLabel=answerFeedbackTiming==='end'?'Answers at end':'Immediate feedback'
  const difficultyLabel=difficultyAll?'All difficulties':difficultyLevels.map(level=>level[0].toUpperCase()+level.slice(1)).join(' + ')||'No difficulty selected'
  const poolModeLabel=newOnly?'New only':failedEverOnly?'Failed only':'All eligible questions'
  const dailyLabel=recommendation.isExamDay
    ?'Exam day'
    :recommendation.estimatedDailyMinutes>0
      ?`${recommendation.estimatedDailyMinutes} min/day`
      :'On track'

  return <AlexBox sx={{width:'100%',maxWidth:960,display:'grid',gap:{xs:1.5,md:2}}}>
    <AlexSurface sx={{
      border:'1px solid #D8E3F2',
      borderRadius:2.5,
      bgcolor:'#F8FBFF',
      p:{xs:1.75,sm:2},
      display:'flex',
      alignItems:{xs:'stretch',sm:'center'},
      justifyContent:'space-between',
      gap:1.5,
      flexDirection:{xs:'column',sm:'row'},
    }}>
      <AlexBox sx={{minWidth:0}}>
        <AlexText sx={{fontSize:12,fontWeight:850,color:'#667085',textTransform:'uppercase',letterSpacing:'.06em'}}>Ready to practice</AlexText>
        <AlexText sx={{mt:.35,fontSize:15,fontWeight:800,color:'#08275B',lineHeight:1.4}}>
          {settings.questionsPerSession} questions · {subjectLabel} · {selectionMode==='adaptive'?'Adaptive':'Random'}
        </AlexText>
        <AlexText sx={{mt:.25,fontSize:12.75,color:'#667085',lineHeight:1.4}}>
          {labelForTest(practiceTest,practiceTests)} · {difficultyLabel}
        </AlexText>
      </AlexBox>
      <AlexButton
        onClick={onStart}
        disabled={startDisabled}
        sx={{width:{xs:'100%',sm:190},flex:'0 0 auto'}}
      >
        Start practice
      </AlexButton>
    </AlexSurface>

    <AlexText sx={{fontSize:13,color:'#667085',lineHeight:1.45}}>
      Your saved defaults are ready to use. Open a section only when you want to change something.
    </AlexText>

    <PracticeSetupSection
      title="Session basics"
      description="Source, subject, session length, and answer timing."
      summary={`${labelForTest(practiceTest,practiceTests)} · ${subjectLabel} · ${settings.questionsPerSession} questions · ${feedbackLabel}`}
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
      description="Selection strategy, difficulty, and review filters."
      summary={`${selectionMode==='adaptive'?'Adaptive':'Random'} · ${difficultyLabel} · ${poolModeLabel}`}
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
      description="Exam goals and recommended pace."
      summary={recommendation.activeExamLabel
        ?`${recommendation.activeExamLabel} · Target ${recommendation.targetScore??'not set'}`
        :`Target ${recommendation.targetScore??'not set'} · No upcoming exam date`}
      trailing={<AlexText sx={{fontSize:13.5,fontWeight:850,color:'#6558F5',whiteSpace:'nowrap'}}>{dailyLabel}</AlexText>}
    >
      <PracticeGoalSettings settings={settings} onChange={onChange}/>
      <AlexBox sx={{mt:1.5}}>
        <StudyPlanRecommendation recommendation={recommendation} compact/>
      </AlexBox>
    </PracticeSetupSection>
  </AlexBox>
}

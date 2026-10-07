import {useEffect,useMemo,useState,type ReactNode} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexCheckbox from '../atoms/AlexCheckbox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexStatusChip from '../atoms/AlexStatusChip'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import PracticeSettingField from '../molecules/PracticeSettingField'
import VocabularyChoiceRow from '../molecules/VocabularyChoiceRow'
import {
  DEFAULT_VOCABULARY_SETTINGS,
  VOCABULARY_BANK,
  VOCABULARY_DIFFICULTY_LABELS,
  VOCABULARY_SOURCE_LABELS,
  createConfiguredVocabularySession,
  filterVocabularyBank,
  vocabularyDifficulties,
  vocabularySource,
  vocabularySources,
  type VocabularyAttempt,
  type VocabularyDifficulty,
  type VocabularyPracticeSettings,
  type VocabularySessionSize,
  type VocabularySource,
} from '../../lib/vocabulary'
import {loadVocabularyAttempts,saveVocabularyAttempt} from '../../lib/supabase'

type Phase='setup'|'practice'|'results'
type Props={signedIn:boolean;onSignIn:()=>void}
const uid=()=>crypto.randomUUID()

export default function VocabularyPractice({signedIn,onSignIn}:Props){
  const[settings,setSettings]=useState<VocabularyPracticeSettings>(DEFAULT_VOCABULARY_SETTINGS)
  const[attempts,setAttempts]=useState<VocabularyAttempt[]>([])
  const[loadingHistory,setLoadingHistory]=useState(false)
  const[phase,setPhase]=useState<Phase>('setup')
  const[session,setSession]=useState(()=>createConfiguredVocabularySession(DEFAULT_VOCABULARY_SETTINGS,[]))
  const[index,setIndex]=useState(0)
  const[selected,setSelected]=useState('')
  const[score,setScore]=useState(0)
  const[saveError,setSaveError]=useState('')

  useEffect(()=>{
    if(!signedIn){setAttempts([]);return}
    let cancelled=false
    setLoadingHistory(true)
    void loadVocabularyAttempts()
      .then(rows=>{if(!cancelled)setAttempts(rows)})
      .catch(error=>console.warn('Vocabulary history load failed',error))
      .finally(()=>{if(!cancelled)setLoadingHistory(false)})
    return()=>{cancelled=true}
  },[signedIn])

  const availableSources=useMemo(()=>vocabularySources(VOCABULARY_BANK),[])
  const sourceScopedBank=useMemo(
    ()=>VOCABULARY_BANK.filter(entry=>settings.sources.includes(vocabularySource(entry))),
    [settings.sources],
  )
  const availableDifficulties=useMemo(()=>vocabularyDifficulties(sourceScopedBank),[sourceScopedBank])
  const effectiveSettings:VocabularyPracticeSettings=availableDifficulties.length||settings.difficulty==='all'
    ?settings
    :{...settings,difficulty:'all'}
  const matchingWords=useMemo(
    ()=>filterVocabularyBank(effectiveSettings,attempts,VOCABULARY_BANK),
    [effectiveSettings,attempts],
  )
  const attemptedIds=new Set(attempts.map(attempt=>attempt.vocabularyId))
  const newCount=VOCABULARY_BANK.filter(entry=>settings.sources.includes(vocabularySource(entry))&&!attemptedIds.has(entry.id)).length
  const current=session[index]
  const answered=Boolean(selected)
  const correct=Boolean(current)&&answered&&selected===current.answer
  const sessionTarget=settings.sessionSize==='all'?matchingWords.length:Math.min(settings.sessionSize,matchingWords.length)

  function updateSources(source:VocabularySource,checked:boolean){
    const next=checked
      ?[...new Set([...settings.sources,source])]
      :settings.sources.filter(value=>value!==source)
    if(!next.length)return
    setSettings(previous=>({...previous,sources:next,difficulty:'all'}))
  }

  function start(){
    if(!signedIn){onSignIn();return}
    const next=createConfiguredVocabularySession(effectiveSettings,attempts,VOCABULARY_BANK)
    if(!next.length)return
    setSession(next)
    setIndex(0)
    setSelected('')
    setScore(0)
    setSaveError('')
    setPhase('practice')
  }

  async function choose(option:string){
    if(answered||!current)return
    const isCorrect=option===current.answer
    setSelected(option)
    if(isCorrect)setScore(value=>value+1)
    const attempt:VocabularyAttempt={
      id:uid(),
      vocabularyId:current.entry.id,
      direction:current.direction,
      selectedAnswer:option,
      correctAnswer:current.answer,
      correct:isCorrect,
      createdAt:new Date().toISOString(),
    }
    setAttempts(previous=>[...previous,attempt])
    setSaveError('')
    try{await saveVocabularyAttempt(attempt)}
    catch(error){
      console.warn('Vocabulary attempt save failed',error)
      setSaveError('This answer could not be saved to your vocabulary history.')
    }
  }

  function next(){
    if(!answered)return
    if(index>=session.length-1){setPhase('results');return}
    setIndex(value=>value+1)
    setSelected('')
    setSaveError('')
  }

  function backToSetup(){
    setPhase('setup')
    setIndex(0)
    setSelected('')
    setScore(0)
    setSaveError('')
  }

  if(phase==='results')return <PageShell>
    <PageHeading subtitle="Your vocabulary session is complete."/>
    <AlexSurface sx={{mt:2.5,p:{xs:2.25,sm:3},border:'1px solid #E4E7EC'}}>
      <AlexBox sx={{display:'flex',alignItems:'baseline',gap:1.25,flexWrap:'wrap'}}>
        <AlexText component="div" sx={{fontSize:{xs:30,sm:34},fontWeight:800,lineHeight:1,color:'#08275B'}}>{score}/{session.length}</AlexText>
        <AlexText sx={{fontSize:14,color:'#667085'}}>{session.length?Math.round(score/session.length*100):0}% correct</AlexText>
      </AlexBox>
      <AlexBox sx={{display:'flex',gap:1,mt:2.5,flexWrap:'wrap'}}>
        <AlexButton onClick={start}>Practice again</AlexButton>
        <AlexButton tone="secondary" onClick={backToSetup}>Edit setup</AlexButton>
      </AlexBox>
    </AlexSurface>
  </PageShell>

  if(phase==='practice'&&current)return <PageShell>
    <PageHeading subtitle="Choose the closest match, then move to the next word."/>

    <AlexSurface sx={{mt:2.5,p:{xs:1.75,sm:2.25},border:'1px solid #E4E7EC'}}>
      <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:2}}>
        <AlexText sx={{fontSize:12.5,fontWeight:750,color:'#667085'}}>Question {index+1} of {session.length}</AlexText>
        <AlexStatusChip>{score} correct</AlexStatusChip>
      </AlexBox>

      <AlexBox sx={{mt:2.25,p:{xs:1.75,sm:2.25},borderRadius:'8px',bgcolor:'#F8FAFC',border:'1px solid #EEF1F4'}}>
        <AlexText sx={{fontSize:11.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.045em',color:'#667085'}}>
          {current.direction==='word-to-definition'?'Choose the best meaning':'Choose the matching word'}
        </AlexText>
        <AlexText component="div" sx={{
          fontSize:{xs:22,sm:25},
          fontWeight:750,
          lineHeight:1.3,
          letterSpacing:'-.01em',
          color:'#08275B',
          mt:.75,
        }}>
          {current.prompt}
        </AlexText>
      </AlexBox>

      <AlexBox sx={{display:'grid',gap:.8,mt:1.5}}>
        {current.options.map(option=><VocabularyChoiceRow
          key={option}
          label={option}
          selected={selected===option}
          disabled={answered&&selected!==option}
          onClick={()=>void choose(option)}
        />)}
      </AlexBox>

      {answered&&<AlexSurface sx={{
        mt:1.5,p:1.5,border:'1px solid',borderColor:correct?'#B7DEC5':'#E9C5C1',
        bgcolor:correct?'#F5FAF7':'#FFF8F7',
      }}>
        <AlexText sx={{fontSize:13.5,fontWeight:750,color:correct?'#177245':'#8E3932'}}>{correct?'Correct':'Not quite'}</AlexText>
        {!correct&&<AlexText sx={{fontSize:13.5,color:'#344054',mt:.3}}>Correct answer: <b>{current.answer}</b></AlexText>}
        <AlexText sx={{fontSize:12,color:'#667085',mt:.4}}>Source: {current.entry.sourceQuestionId}</AlexText>
        {saveError&&<AlexText sx={{fontSize:12,color:'#A33A31',mt:.4}}>{saveError}</AlexText>}
      </AlexSurface>}

      <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,mt:2}}>
        <AlexButton tone="quiet" onClick={backToSetup}>Setup</AlexButton>
        <AlexButton disabled={!answered} onClick={next}>{index===session.length-1?'Finish':'Next'}</AlexButton>
      </AlexBox>
    </AlexSurface>
  </PageShell>

  return <PageShell>
    <PageHeading subtitle="Choose the words and practice style for this session."/>

    <AlexSurface sx={{mt:2.5,p:{xs:1.75,sm:2.5},border:'1px solid #E4E7EC'}}>
      <PracticeSettingField
        label="Word sources"
        helperText="Combine any available vocabulary sources."
        control={<AlexBox sx={{display:'grid',gap:.25}}>
          {availableSources.map(source=><AlexCheckbox
            key={source}
            label={VOCABULARY_SOURCE_LABELS[source]}
            checked={settings.sources.includes(source)}
            onChange={checked=>updateSources(source,checked)}
          />)}
        </AlexBox>}
      />

      {availableDifficulties.length>0&&<PracticeSettingField
        label="Difficulty"
        helperText="Only shown for sources that provide difficulty metadata."
        control={<AlexDropdown
          id="vocab-difficulty"
          label="Difficulty"
          value={settings.difficulty}
          options={[
            {value:'all',label:'All difficulties'},
            ...availableDifficulties.map(value=>({value,label:VOCABULARY_DIFFICULTY_LABELS[value]})),
          ]}
          onChange={difficulty=>setSettings(previous=>({...previous,difficulty:difficulty as 'all'|VocabularyDifficulty}))}
        />}
      />}

      <PracticeSettingField
        label="Question history"
        helperText={settings.history==='new'
          ?newCount+' words have not been practiced yet.'
          :settings.history==='failed'
            ?'Failed words stay here until answered correctly twice after the latest miss.'
            :'Include new and previously practiced words.'}
        control={<AlexDropdown
          id="vocab-history"
          label="History"
          value={settings.history}
          options={[
            {value:'all',label:'All words'},
            {value:'new',label:'New only'},
            {value:'failed',label:'Failed only'},
          ]}
          onChange={history=>setSettings(previous=>({...previous,history}))}
        />}
      />

      <PracticeSettingField
        label="Selection"
        helperText="Random reshuffles the eligible vocabulary each session."
        control={<AlexDropdown
          id="vocab-selection"
          label="Selection"
          value={settings.selection}
          options={[
            {value:'random',label:'Random'},
            {value:'bank-order',label:'Bank order'},
          ]}
          onChange={selection=>setSettings(previous=>({...previous,selection}))}
        />}
      />

      <PracticeSettingField
        label="Direction"
        helperText="Mixed alternates between recognizing meanings and recalling words."
        control={<AlexDropdown
          id="vocab-direction"
          label="Direction"
          value={settings.direction}
          options={[
            {value:'mixed',label:'Mixed'},
            {value:'word-to-definition',label:'Word → meaning'},
            {value:'definition-to-word',label:'Meaning → word'},
          ]}
          onChange={direction=>setSettings(previous=>({...previous,direction}))}
        />}
      />

      <PracticeSettingField
        label="Words per session"
        helperText="The session uses up to this many words from the matching pool."
        control={<AlexDropdown
          id="vocab-size"
          label="Session size"
          value={String(settings.sessionSize)}
          options={[
            {value:'10',label:'10 words'},
            {value:'20',label:'20 words'},
            {value:'40',label:'40 words'},
            {value:'all',label:'All matching words'},
          ]}
          onChange={value=>setSettings(previous=>({...previous,sessionSize:(value==='all'?'all':Number(value)) as VocabularySessionSize}))}
        />}
      />

      <AlexBox sx={{mt:2,pt:2,borderTop:'1px solid #EAECF0',display:'flex',alignItems:{xs:'stretch',sm:'center'},justifyContent:'space-between',gap:1.5,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>{matchingWords.length} words match these settings</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.25}}>
            {matchingWords.length?sessionTarget+' will be practiced in this session.':'Change the filters to include at least one word.'}
            {loadingHistory?' Loading vocabulary history…':''}
          </AlexText>
        </AlexBox>
        <AlexButton onClick={start} disabled={!matchingWords.length||loadingHistory}>
          {signedIn?'Start vocabulary practice':'Sign in to practice'}
        </AlexButton>
      </AlexBox>
    </AlexSurface>
  </PageShell>
}

function PageShell({children}:{children:ReactNode}){
  return <AlexBox component="section" sx={{width:'100%',px:{xs:.5,sm:1.5,md:2.5,lg:4},py:{xs:2,sm:2.5,lg:3.5}}}>
    <AlexBox sx={{maxWidth:860,mx:'auto'}}>{children}</AlexBox>
  </AlexBox>
}

function PageHeading({subtitle}:{subtitle:string}){
  return <AlexBox>
    <AlexText component="h1" sx={{
      fontFamily:'Georgia, "Times New Roman", serif',
      fontSize:{xs:26,sm:30,lg:32},
      fontWeight:500,
      lineHeight:1.16,
      m:0,
      color:'#08275B',
    }}>Vocabulary practice</AlexText>
    <AlexText sx={{fontSize:{xs:13.5,sm:14},color:'#667085',mt:.65,lineHeight:1.5}}>{subtitle}</AlexText>
  </AlexBox>
}

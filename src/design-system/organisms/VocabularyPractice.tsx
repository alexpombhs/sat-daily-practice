import {useEffect,useMemo,useState,type ReactNode} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexCheckbox from '../atoms/AlexCheckbox'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexStatusChip from '../atoms/AlexStatusChip'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import PracticeSettingField from '../molecules/PracticeSettingField'
import VocabularyChoiceRow from '../molecules/VocabularyChoiceRow'
import VocabularyPerformanceSummary from '../molecules/VocabularyPerformanceSummary'
import {
  DEFAULT_VOCABULARY_SETTINGS,
  VOCABULARY_BANK,
  VOCABULARY_DIFFICULTY_LABELS,
  VOCABULARY_SOURCE_LABELS,
  buildVocabularyPrompt,
  filterVocabularyBank,
  vocabularyDifficulties,
  vocabularyDistractorBank,
  vocabularyFailedIds,
  vocabularySource,
  vocabularySources,
  type VocabularyAttempt,
  type VocabularyDifficulty,
  type VocabularyDirection,
  type VocabularyPracticeSettings,
  type VocabularyPrompt,
  type VocabularySource,
} from '../../lib/vocabulary'
import {loadVocabularyAttempts,saveVocabularyAttempt} from '../../lib/supabase'

type Props={signedIn:boolean;onSignIn:()=>void}
const uid=()=>crypto.randomUUID()

export default function VocabularyPractice({signedIn,onSignIn}:Props){
  const[settings,setSettings]=useState<VocabularyPracticeSettings>(DEFAULT_VOCABULARY_SETTINGS)
  const[attempts,setAttempts]=useState<VocabularyAttempt[]>([])
  const[loadingHistory,setLoadingHistory]=useState(false)
  const[current,setCurrent]=useState<VocabularyPrompt|null>(null)
  const[selected,setSelected]=useState('')
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

  const scopeBank=useMemo(()=>sourceScopedBank.filter(entry=>
    effectiveSettings.difficulty==='all'||entry.difficulty===effectiveSettings.difficulty
  ),[sourceScopedBank,effectiveSettings.difficulty])

  const eligibleWords=useMemo(
    ()=>filterVocabularyBank(effectiveSettings,attempts,VOCABULARY_BANK),
    [effectiveSettings,attempts],
  )

  const scopeIds=useMemo(()=>new Set(scopeBank.map(entry=>entry.id)),[scopeBank])
  const scopeAttempts=useMemo(()=>attempts.filter(attempt=>scopeIds.has(attempt.vocabularyId)),[attempts,scopeIds])
  const practicedIds=useMemo(()=>new Set(scopeAttempts.map(attempt=>attempt.vocabularyId)),[scopeAttempts])
  const failedIds=useMemo(()=>vocabularyFailedIds(scopeAttempts),[scopeAttempts])
  const practicedCount=practicedIds.size
  const accuracy=scopeAttempts.length?Math.round(scopeAttempts.filter(attempt=>attempt.correct).length/scopeAttempts.length*100):null
  const masteredCount=Math.max(0,practicedCount-failedIds.size)
  const newCount=scopeBank.filter(entry=>!practicedIds.has(entry.id)).length

  const answered=Boolean(selected)
  const correct=Boolean(current)&&answered&&selected===current.answer

  function updateSources(source:VocabularySource,checked:boolean){
    const next=checked
      ?[...new Set([...settings.sources,source])]
      :settings.sources.filter(value=>value!==source)
    if(!next.length)return
    setSettings(previous=>({...previous,sources:next,difficulty:'all'}))
  }

  function makePrompt(previousId?:string):VocabularyPrompt|null{
    const pool=eligibleWords.length>1&&previousId
      ?eligibleWords.filter(entry=>entry.id!==previousId)
      :eligibleWords
    if(!pool.length)return null
    const entry=effectiveSettings.selection==='random'
      ?pool[Math.floor(Math.random()*pool.length)]
      :pool[0]
    const direction:VocabularyDirection=effectiveSettings.direction==='mixed'
      ?(Math.random()<.5?'word-to-definition':'definition-to-word')
      :effectiveSettings.direction
    return buildVocabularyPrompt(
      entry,
      direction,
      vocabularyDistractorBank(effectiveSettings,VOCABULARY_BANK),
    )
  }

  useEffect(()=>{
    if(loadingHistory)return
    setCurrent(previous=>makePrompt(previous?.entry.id))
    setSelected('')
    setSaveError('')
  },[
    loadingHistory,
    effectiveSettings.sources.join('|'),
    effectiveSettings.difficulty,
    effectiveSettings.history,
    effectiveSettings.selection,
    effectiveSettings.direction,
  ])

  async function choose(option:string){
    if(answered||!current)return
    if(!signedIn){onSignIn();return}
    setSelected(option)
    const attempt:VocabularyAttempt={
      id:uid(),
      vocabularyId:current.entry.id,
      direction:current.direction,
      selectedAnswer:option,
      correctAnswer:current.answer,
      correct:option===current.answer,
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
    if(!answered||!current)return
    const previousId=current.entry.id
    setSelected('')
    setSaveError('')
    setCurrent(makePrompt(previousId))
  }

  return <PageShell>
    <PageHeading subtitle="Continuous vocabulary practice based on your selected word pool."/>

    <AlexAccordion
      sx={{mt:1.75}}
      summary={<AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1.25,width:'100%',pr:1,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>Practice configuration</AlexText>
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.15}}>
            {scopeBank.length} words in scope · {eligibleWords.length} currently eligible
          </AlexText>
        </AlexBox>
        <AlexText sx={{fontSize:12.5,fontWeight:750,color:'#0B376D',whiteSpace:'nowrap'}}>
          {settings.history==='all'?'All words':settings.history==='new'?'New only':'Failed only'}
        </AlexText>
      </AlexBox>}
    >
      <PracticeSettingField
        label="Word sources"
        helperText={availableSources.length===1
          ?VOCABULARY_BANK.length+' practice-test-derived words are currently loaded. More sources will appear here when imported.'
          :'Select one or more vocabulary banks to combine.'}
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
        helperText="Available when the selected source provides difficulty metadata."
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
          ?newCount+' words in this scope have not been practiced yet.'
          :settings.history==='failed'
            ?'Failed words stay eligible until answered correctly twice after the latest miss.'
            :'Use the full selected vocabulary scope.'}
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
        helperText="Random picks continuously from the eligible pool."
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
    </AlexAccordion>

    <VocabularyPerformanceSummary
      practiced={practicedCount}
      total={scopeBank.length}
      accuracy={accuracy}
      failed={failedIds.size}
      mastered={masteredCount}
    />

    {!signedIn&&<AlexSurface sx={{mt:1.5,p:1.5,border:'1px solid #D8E3F1',bgcolor:'#F7FAFE'}}>
      <AlexText sx={{fontSize:13.5,color:'#344054'}}>Sign in to save vocabulary progress and use New/Failed tracking across devices.</AlexText>
      <AlexButton sx={{mt:1}} onClick={onSignIn}>Sign in</AlexButton>
    </AlexSurface>}

    <AlexSurface sx={{mt:1.5,p:{xs:1.75,sm:2.25},border:'1px solid #E4E7EC'}}>
      {loadingHistory
        ?<AlexText sx={{fontSize:14,color:'#667085'}}>Loading vocabulary progress…</AlexText>
        :!current
          ?<AlexBox>
            <AlexText sx={{fontSize:15,fontWeight:800,color:'#08275B'}}>No words match the current configuration.</AlexText>
            <AlexText sx={{fontSize:13,color:'#667085',mt:.5}}>Open Practice configuration above and broaden the source, difficulty, or history filter.</AlexText>
          </AlexBox>
          :<>
            <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:2}}>
              <AlexText sx={{fontSize:12.5,fontWeight:750,color:'#667085'}}>
                {eligibleWords.length} eligible word{eligibleWords.length===1?'':'s'}
              </AlexText>
              <AlexStatusChip>{accuracy===null?'NEW':accuracy+'% accuracy'}</AlexStatusChip>
            </AlexBox>

            <AlexBox sx={{mt:2,p:{xs:1.75,sm:2.25},borderRadius:'8px',bgcolor:'#F8FAFC',border:'1px solid #EEF1F4'}}>
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

            <AlexBox sx={{display:'flex',justifyContent:'flex-end',mt:2}}>
              <AlexButton disabled={!answered} onClick={next}>Next word</AlexButton>
            </AlexBox>
          </>}
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

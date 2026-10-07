export type VocabularyDirection='word-to-definition'|'definition-to-word'
export type VocabularyDirectionMode=VocabularyDirection|'mixed'
export type VocabularySource='practice-test-derived'|'sat-open-dataset'|'supplemental'
export type VocabularyDifficulty='easy'|'medium'|'hard'|'very-hard'
export type VocabularyHistoryFilter='all'|'new'|'failed'
export type VocabularySelectionMode='random'|'bank-order'
export type VocabularySessionSize=10|20|40|'all'

export type VocabularyEntry={
  id:string
  word:string
  definition:string
  sourceQuestionId:string
  source?:VocabularySource
  difficulty?:VocabularyDifficulty
}

export type VocabularyAttempt={
  id:string
  vocabularyId:string
  direction:VocabularyDirection
  selectedAnswer:string
  correctAnswer:string
  correct:boolean
  createdAt:string
}

export type VocabularyPracticeSettings={
  sources:VocabularySource[]
  difficulty:'all'|VocabularyDifficulty
  history:VocabularyHistoryFilter
  selection:VocabularySelectionMode
  direction:VocabularyDirectionMode
  sessionSize:VocabularySessionSize
}

export const DEFAULT_VOCABULARY_SETTINGS:VocabularyPracticeSettings={
  sources:['practice-test-derived'],
  difficulty:'all',
  history:'all',
  selection:'random',
  direction:'mixed',
  sessionSize:20,
}

export const VOCABULARY_SOURCE_LABELS:Record<VocabularySource,string>={
  'practice-test-derived':'Practice tests',
  'sat-open-dataset':'Open SAT vocabulary',
  supplemental:'Supplemental',
}

export const VOCABULARY_DIFFICULTY_LABELS:Record<VocabularyDifficulty,string>={
  easy:'Easy',
  medium:'Medium',
  hard:'Hard',
  'very-hard':'Very hard',
}

export function vocabularySource(entry:VocabularyEntry):VocabularySource{
  return entry.source??'practice-test-derived'
}

export const VOCABULARY_BANK:VocabularyEntry[]=[
  {id:'attached',word:'attached',definition:'fastened or joined to something',sourceQuestionId:'rw1-1'},
  {id:'collected',word:'collected',definition:'gathered or brought together',sourceQuestionId:'rw1-1'},
  {id:'followed',word:'followed',definition:'came after or moved behind',sourceQuestionId:'rw1-1'},
  {id:'replaced',word:'replaced',definition:'put something new in place of another',sourceQuestionId:'rw1-1'},

  {id:'reflect',word:'reflect',definition:'show or represent something accurately',sourceQuestionId:'rw1-2'},
  {id:'receive',word:'receive',definition:'be given or take in something',sourceQuestionId:'rw1-2'},
  {id:'evaluate',word:'evaluate',definition:'judge the quality, value, or significance of',sourceQuestionId:'rw1-2'},
  {id:'mimic',word:'mimic',definition:'imitate or closely resemble',sourceQuestionId:'rw1-2'},

  {id:'recognizable',word:'recognizable',definition:'easy to identify or know again',sourceQuestionId:'rw1-3'},
  {id:'intriguing',word:'intriguing',definition:'interesting because it is unusual or mysterious',sourceQuestionId:'rw1-3'},
  {id:'significant',word:'significant',definition:'important or large enough to matter',sourceQuestionId:'rw1-3'},
  {id:'useful',word:'useful',definition:'helpful for a particular purpose',sourceQuestionId:'rw1-3'},

  {id:'substantial',word:'substantial',definition:'large, important, or considerable',sourceQuestionId:'rw1-4'},
  {id:'satisfying',word:'satisfying',definition:'fulfilling a need, expectation, or desire',sourceQuestionId:'rw1-4'},
  {id:'unimportant',word:'unimportant',definition:'having little significance or effect',sourceQuestionId:'rw1-4'},
  {id:'appropriate',word:'appropriate',definition:'suitable or proper for the situation',sourceQuestionId:'rw1-4'},

  {id:'fragile',word:'fragile',definition:'easily broken, damaged, or harmed',sourceQuestionId:'practice-test-5:rw1-2'},
  {id:'common',word:'common',definition:'frequent, usual, or widely found',sourceQuestionId:'practice-test-5:rw1-2'},
  {id:'sophisticated',word:'sophisticated',definition:'complex, refined, or highly developed',sourceQuestionId:'practice-test-5:rw1-2'},

  {id:'antecedent',word:'antecedent',definition:'something that comes before another thing',sourceQuestionId:'practice-test-5:rw1-3'},
  {id:'impending',word:'impending',definition:'about to happen very soon',sourceQuestionId:'practice-test-5:rw1-3'},
  {id:'innocuous',word:'innocuous',definition:'not harmful or offensive',sourceQuestionId:'practice-test-5:rw1-3'},
  {id:'perpetual',word:'perpetual',definition:'continuing without interruption or end',sourceQuestionId:'practice-test-5:rw1-3'},

  {id:'hypothesized',word:'hypothesized',definition:'proposed an explanation to be tested',sourceQuestionId:'practice-test-5:rw1-4'},
  {id:'discounted',word:'discounted',definition:'regarded as less important or unlikely to be true',sourceQuestionId:'practice-test-5:rw1-4'},
  {id:'redefined',word:'redefined',definition:'gave a new or different meaning to',sourceQuestionId:'practice-test-5:rw1-4'},
  {id:'exploited',word:'exploited',definition:'used something to gain an advantage',sourceQuestionId:'practice-test-5:rw1-4'},

  {id:'sanction',word:'sanction',definition:'officially approve or authorize',sourceQuestionId:'practice-test-5:rw1-5'},
  {id:'ameliorate',word:'ameliorate',definition:'make a bad condition better',sourceQuestionId:'practice-test-5:rw1-5'},
  {id:'rationalize',word:'rationalize',definition:'try to justify with seemingly logical reasons',sourceQuestionId:'practice-test-5:rw1-5'},
  {id:'postulate',word:'postulate',definition:'suggest or assume something as a basis for reasoning',sourceQuestionId:'practice-test-5:rw1-5'},

  {id:'occupy',word:'occupy',definition:'take up or fill a place or position',sourceQuestionId:'practice-test-5:rw2-2'},
  {id:'hoard',word:'hoard',definition:'collect and keep a large supply, often secretly',sourceQuestionId:'practice-test-5:rw2-2'},
  {id:'reserve',word:'reserve',definition:'set aside for future use',sourceQuestionId:'practice-test-5:rw2-2'},
  {id:'obtain',word:'obtain',definition:'get or acquire something',sourceQuestionId:'practice-test-5:rw2-2'},

  {id:'reduced',word:'reduced',definition:'made smaller or less in amount',sourceQuestionId:'practice-test-5:rw2-3'},
  {id:'evaluated',word:'evaluated',definition:'judged the quality, value, or importance of',sourceQuestionId:'practice-test-5:rw2-3'},
  {id:'determined',word:'determined',definition:'established or found out with certainty',sourceQuestionId:'practice-test-5:rw2-3'},
  {id:'acquired',word:'acquired',definition:'gained or obtained something',sourceQuestionId:'practice-test-5:rw2-3'},

  {id:'tenuous',word:'tenuous',definition:'weak, slight, or not firmly established',sourceQuestionId:'practice-test-5:rw2-4'},
  {id:'enduring',word:'enduring',definition:'lasting for a long time',sourceQuestionId:'practice-test-5:rw2-4'},
  {id:'contentious',word:'contentious',definition:'likely to cause disagreement or argument',sourceQuestionId:'practice-test-5:rw2-4'},
  {id:'conspicuous',word:'conspicuous',definition:'easy to notice or attracting attention',sourceQuestionId:'practice-test-5:rw2-4'},

  {id:'imagine',word:'imagine',definition:'form a mental picture or idea of',sourceQuestionId:'practice-test-5:rw2-5'},
  {id:'summarize',word:'summarize',definition:'state the main points briefly',sourceQuestionId:'practice-test-5:rw2-5'},
  {id:'defend',word:'defend',definition:'support a claim with reasons or evidence',sourceQuestionId:'practice-test-5:rw2-5'},
  {id:'adjust',word:'adjust',definition:'change slightly to improve fit or suitability',sourceQuestionId:'practice-test-5:rw2-5'},

  {id:'examples-of',word:'examples of',definition:'instances that illustrate a broader idea or type',sourceQuestionId:'practice-test-6:rw1-1'},
  {id:'concerns-about',word:'concerns about',definition:'worries or issues relating to something',sourceQuestionId:'practice-test-6:rw1-1'},
  {id:'indications-of',word:'indications of',definition:'signs or evidence suggesting something',sourceQuestionId:'practice-test-6:rw1-1'},
  {id:'similarities-with',word:'similarities with',definition:'qualities or features shared with something else',sourceQuestionId:'practice-test-6:rw1-1'},

  {id:'prudently',word:'prudently',definition:'carefully and with good judgment',sourceQuestionId:'practice-test-6:rw1-2'},
  {id:'overtly',word:'overtly',definition:'openly and clearly rather than secretly',sourceQuestionId:'practice-test-6:rw1-2'},
  {id:'cordially',word:'cordially',definition:'warmly, politely, and in a friendly way',sourceQuestionId:'practice-test-6:rw1-2'},
  {id:'inadvertently',word:'inadvertently',definition:'unintentionally or by accident',sourceQuestionId:'practice-test-6:rw1-2'},

  {id:'exacerbating',word:'exacerbating',definition:'making a problem or bad situation worse',sourceQuestionId:'practice-test-6:rw1-3'},
  {id:'redressing',word:'redressing',definition:'correcting or remedying an unfair situation',sourceQuestionId:'practice-test-6:rw1-3'},
  {id:'epitomizing',word:'epitomizing',definition:'serving as a perfect example of',sourceQuestionId:'practice-test-6:rw1-3'},
  {id:'precluding',word:'precluding',definition:'preventing something from happening',sourceQuestionId:'practice-test-6:rw1-3'},

  {id:'controversial-among',word:'controversial among',definition:'causing disagreement within a group',sourceQuestionId:'practice-test-6:rw1-5'},
  {id:'antagonistic-toward',word:'antagonistic toward',definition:'hostile or strongly opposed to',sourceQuestionId:'practice-test-6:rw1-5'},
  {id:'imitated-by',word:'imitated by',definition:'copied or modeled by others',sourceQuestionId:'practice-test-6:rw1-5'},
  {id:'inconsequential-to',word:'inconsequential to',definition:'having little or no important effect on',sourceQuestionId:'practice-test-6:rw1-5'},

  {id:'invented',word:'invented',definition:'created or devised something new',sourceQuestionId:'practice-test-6:rw2-1'},
  {id:'adjusted',word:'adjusted',definition:'changed slightly to improve or correct',sourceQuestionId:'practice-test-6:rw2-1'},
  {id:'featured',word:'featured',definition:'displayed or presented prominently',sourceQuestionId:'practice-test-6:rw2-1'},
  {id:'recommended',word:'recommended',definition:'suggested as suitable or worthwhile',sourceQuestionId:'practice-test-6:rw2-1'},

  {id:'complimented-by',word:'complimented by',definition:'praised or spoken of favorably by',sourceQuestionId:'practice-test-6:rw2-2'},
  {id:'uncertain-about',word:'uncertain about',definition:'not sure or confident about',sourceQuestionId:'practice-test-6:rw2-2'},
  {id:'unbothered-by',word:'unbothered by',definition:'not worried, upset, or affected by',sourceQuestionId:'practice-test-6:rw2-2'},
  {id:'inspired-by',word:'inspired by',definition:'influenced or motivated by something',sourceQuestionId:'practice-test-6:rw2-2'},

  {id:'obvious',word:'obvious',definition:'easy to see, recognize, or understand',sourceQuestionId:'practice-test-6:rw2-3'},
  {id:'accidental',word:'accidental',definition:'happening by chance rather than intentionally',sourceQuestionId:'practice-test-6:rw2-3'},
  {id:'observable',word:'observable',definition:'able to be noticed or measured',sourceQuestionId:'practice-test-6:rw2-3'},

  {id:'insensible-to',word:'insensible to',definition:'unaware of or unaffected by',sourceQuestionId:'practice-test-6:rw2-4'},
  {id:'manifest-in',word:'manifest in',definition:'clearly shown or evident in',sourceQuestionId:'practice-test-6:rw2-4'},
  {id:'scrutinized-by',word:'scrutinized by',definition:'examined very carefully by',sourceQuestionId:'practice-test-6:rw2-4'},
  {id:'complicated-by',word:'complicated by',definition:'made more difficult or complex by',sourceQuestionId:'practice-test-6:rw2-4'},

  {id:'permanent',word:'permanent',definition:'lasting or intended to last indefinitely',sourceQuestionId:'practice-test-6:rw2-5'},
  {id:'tentative',word:'tentative',definition:'uncertain or not firmly established',sourceQuestionId:'practice-test-6:rw2-5'},
  {id:'warranted',word:'warranted',definition:'justified or supported by the circumstances',sourceQuestionId:'practice-test-6:rw2-5'},
  {id:'prominent',word:'prominent',definition:'important, well known, or easily noticed',sourceQuestionId:'practice-test-6:rw2-5'},

  {id:'amusing',word:'amusing',definition:'causing laughter or entertaining interest',sourceQuestionId:'practice-test-7:rw2-3'},
  {id:'costly',word:'costly',definition:'requiring a large amount of money or resources',sourceQuestionId:'practice-test-7:rw2-3'},
  {id:'successful',word:'successful',definition:'achieving the intended result',sourceQuestionId:'practice-test-7:rw2-3'},
  {id:'disastrous',word:'disastrous',definition:'causing great damage, failure, or harm',sourceQuestionId:'practice-test-7:rw2-3'},
]

export function vocabularySources(bank:VocabularyEntry[]=VOCABULARY_BANK){
  return [...new Set(bank.map(vocabularySource))]
}

export function vocabularyDifficulties(bank:VocabularyEntry[]=VOCABULARY_BANK){
  return [...new Set(bank.flatMap(entry=>entry.difficulty?[entry.difficulty]:[]))]
}

export function vocabularyFailedIds(attempts:VocabularyAttempt[]){
  const byWord=new Map<string,VocabularyAttempt[]>()
  attempts.forEach(attempt=>byWord.set(attempt.vocabularyId,[...(byWord.get(attempt.vocabularyId)??[]),attempt]))
  const failed=new Set<string>()
  byWord.forEach((items,id)=>{
    const ordered=[...items].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
    let lastIncorrect=-1
    ordered.forEach((attempt,index)=>{if(!attempt.correct)lastIncorrect=index})
    if(lastIncorrect<0)return
    const correctAfter=ordered.slice(lastIncorrect+1).filter(attempt=>attempt.correct).length
    if(correctAfter<2)failed.add(id)
  })
  return failed
}

export function filterVocabularyBank(
  settings:VocabularyPracticeSettings,
  attempts:VocabularyAttempt[],
  bank:VocabularyEntry[]=VOCABULARY_BANK,
){
  const sourceSet=new Set(settings.sources)
  const attemptedIds=new Set(attempts.map(attempt=>attempt.vocabularyId))
  const failedIds=vocabularyFailedIds(attempts)
  return bank.filter(entry=>{
    if(!sourceSet.has(vocabularySource(entry)))return false
    if(settings.difficulty!=='all'&&entry.difficulty!==settings.difficulty)return false
    if(settings.history==='new'&&attemptedIds.has(entry.id))return false
    if(settings.history==='failed'&&!failedIds.has(entry.id))return false
    return true
  })
}

export function vocabularyDistractorBank(
  settings:VocabularyPracticeSettings,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
){
  const sourceSet=new Set(settings.sources)
  return bank.filter(entry=>{
    if(!sourceSet.has(vocabularySource(entry)))return false
    if(settings.difficulty!=='all'&&entry.difficulty!==settings.difficulty)return false
    return true
  })
}

export type VocabularyPrompt={
  entry:VocabularyEntry
  prompt:string
  answer:string
  options:string[]
}

export function shuffleVocabulary<T>(items:T[],rng:()=>number=Math.random){
  const result=[...items]
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1))
    ;[result[i],result[j]]=[result[j],result[i]]
  }
  return result
}

export function buildVocabularyOptions(
  entry:VocabularyEntry,
  direction:VocabularyDirection,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
){
  const correct=direction==='word-to-definition'?entry.definition:entry.word
  const candidateValues=[...new Set(
    bank.filter(item=>item.id!==entry.id).map(item=>direction==='word-to-definition'?item.definition:item.word),
  )].filter(value=>value!==correct)
  const distractors=shuffleVocabulary(candidateValues,rng).slice(0,3)
  return shuffleVocabulary([correct,...distractors],rng)
}

export function buildVocabularyPrompt(
  entry:VocabularyEntry,
  direction:VocabularyDirection,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
):VocabularyPrompt{
  return direction==='word-to-definition'
    ?{entry,prompt:entry.word,answer:entry.definition,options:buildVocabularyOptions(entry,direction,bank,rng)}
    :{entry,prompt:entry.definition,answer:entry.word,options:buildVocabularyOptions(entry,direction,bank,rng)}
}

export function createVocabularySession(
  direction:VocabularyDirection,
  count=VOCABULARY_BANK.length,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
  distractorBank:VocabularyEntry[]=bank,
){
  return shuffleVocabulary(bank,rng)
    .slice(0,Math.min(Math.max(1,count),bank.length))
    .map(entry=>buildVocabularyPrompt(entry,direction,distractorBank,rng))
}

export function createConfiguredVocabularySession(
  settings:VocabularyPracticeSettings,
  attempts:VocabularyAttempt[],
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
){
  const eligible=filterVocabularyBank(settings,attempts,bank)
  const ordered=settings.selection==='random'?shuffleVocabulary(eligible,rng):eligible
  const count=settings.sessionSize==='all'?ordered.length:Math.min(settings.sessionSize,ordered.length)
  const targets=ordered.slice(0,count)
  const distractorBank=vocabularyDistractorBank(settings,bank)
  return targets.map(entry=>{
    const direction:VocabularyDirection=settings.direction==='mixed'
      ?(rng()<.5?'word-to-definition':'definition-to-word')
      :settings.direction
    return buildVocabularyPrompt(entry,direction,distractorBank,rng)
  })
}

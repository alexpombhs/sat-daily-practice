import {OPEN_SAT_VOCABULARY} from '../data/openSatVocabulary'
export type VocabularyDirection='word-to-definition'|'definition-to-word'
export type VocabularyDirectionMode=VocabularyDirection|'mixed'
export type VocabularySource='practice-test-derived'|'sat-open-dataset'|'supplemental'
export type VocabularyDifficulty='easy'|'medium'|'advanced'
export type VocabularyHistoryFilter='all'|'new'|'failed'
export type VocabularySelectionMode='random'|'adaptive'
export type VocabularySessionSize=10|20|40|'all'

export type VocabularyEntry={
  id:string
  word:string
  definition:string
  sourceQuestionId?:string
  source?:VocabularySource
  sourceLabel?:string
  partOfSpeech?:string
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
  selection:'adaptive',
  direction:'word-to-definition',
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
  advanced:'Advanced',
}

export function vocabularySource(entry:VocabularyEntry):VocabularySource{
  return entry.source??'practice-test-derived'
}

export const PRACTICE_TEST_VOCABULARY:VocabularyEntry[]=[
  {id:'attached',word:'attached',definition:'fastened or joined to something',sourceQuestionId:'rw1-1',difficulty:'easy'},
  {id:'collected',word:'collected',definition:'gathered or brought together',sourceQuestionId:'rw1-1',difficulty:'easy'},
  {id:'followed',word:'followed',definition:'came after or moved behind',sourceQuestionId:'rw1-1',difficulty:'easy'},
  {id:'replaced',word:'replaced',definition:'put something new in place of another',sourceQuestionId:'rw1-1',difficulty:'easy'},

  {id:'reflect',word:'reflect',definition:'show or represent something accurately',sourceQuestionId:'rw1-2',difficulty:'easy'},
  {id:'receive',word:'receive',definition:'be given or take in something',sourceQuestionId:'rw1-2',difficulty:'easy'},
  {id:'evaluate',word:'evaluate',definition:'judge the quality, value, or significance of',sourceQuestionId:'rw1-2',difficulty:'medium'},
  {id:'mimic',word:'mimic',definition:'imitate or closely resemble',sourceQuestionId:'rw1-2',difficulty:'medium'},

  {id:'recognizable',word:'recognizable',definition:'easy to identify or know again',sourceQuestionId:'rw1-3',difficulty:'medium'},
  {id:'intriguing',word:'intriguing',definition:'interesting because it is unusual or mysterious',sourceQuestionId:'rw1-3',difficulty:'medium'},
  {id:'significant',word:'significant',definition:'important or large enough to matter',sourceQuestionId:'rw1-3',difficulty:'easy'},
  {id:'useful',word:'useful',definition:'helpful for a particular purpose',sourceQuestionId:'rw1-3',difficulty:'easy'},

  {id:'substantial',word:'substantial',definition:'large, important, or considerable',sourceQuestionId:'rw1-4',difficulty:'medium'},
  {id:'satisfying',word:'satisfying',definition:'fulfilling a need, expectation, or desire',sourceQuestionId:'rw1-4',difficulty:'easy'},
  {id:'unimportant',word:'unimportant',definition:'having little significance or effect',sourceQuestionId:'rw1-4',difficulty:'easy'},
  {id:'appropriate',word:'appropriate',definition:'suitable or proper for the situation',sourceQuestionId:'rw1-4',difficulty:'easy'},

  {id:'fragile',word:'fragile',definition:'easily broken, damaged, or harmed',sourceQuestionId:'practice-test-5:rw1-2',difficulty:'easy'},
  {id:'common',word:'common',definition:'frequent, usual, or widely found',sourceQuestionId:'practice-test-5:rw1-2',difficulty:'easy'},
  {id:'sophisticated',word:'sophisticated',definition:'complex, refined, or highly developed',sourceQuestionId:'practice-test-5:rw1-2',difficulty:'medium'},

  {id:'antecedent',word:'antecedent',definition:'something that comes before another thing',sourceQuestionId:'practice-test-5:rw1-3',difficulty:'advanced'},
  {id:'impending',word:'impending',definition:'about to happen very soon',sourceQuestionId:'practice-test-5:rw1-3',difficulty:'medium'},
  {id:'innocuous',word:'innocuous',definition:'not harmful or offensive',sourceQuestionId:'practice-test-5:rw1-3',difficulty:'advanced'},
  {id:'perpetual',word:'perpetual',definition:'continuing without interruption or end',sourceQuestionId:'practice-test-5:rw1-3',difficulty:'medium'},

  {id:'hypothesized',word:'hypothesized',definition:'proposed an explanation to be tested',sourceQuestionId:'practice-test-5:rw1-4',difficulty:'medium'},
  {id:'discounted',word:'discounted',definition:'regarded as less important or unlikely to be true',sourceQuestionId:'practice-test-5:rw1-4',difficulty:'medium'},
  {id:'redefined',word:'redefined',definition:'gave a new or different meaning to',sourceQuestionId:'practice-test-5:rw1-4',difficulty:'medium'},
  {id:'exploited',word:'exploited',definition:'used something to gain an advantage',sourceQuestionId:'practice-test-5:rw1-4',difficulty:'medium'},

  {id:'sanction',word:'sanction',definition:'officially approve or authorize',sourceQuestionId:'practice-test-5:rw1-5',difficulty:'advanced'},
  {id:'ameliorate',word:'ameliorate',definition:'make a bad condition better',sourceQuestionId:'practice-test-5:rw1-5',difficulty:'advanced'},
  {id:'rationalize',word:'rationalize',definition:'try to justify with seemingly logical reasons',sourceQuestionId:'practice-test-5:rw1-5',difficulty:'medium'},
  {id:'postulate',word:'postulate',definition:'suggest or assume something as a basis for reasoning',sourceQuestionId:'practice-test-5:rw1-5',difficulty:'advanced'},

  {id:'occupy',word:'occupy',definition:'take up or fill a place or position',sourceQuestionId:'practice-test-5:rw2-2',difficulty:'easy'},
  {id:'hoard',word:'hoard',definition:'collect and keep a large supply, often secretly',sourceQuestionId:'practice-test-5:rw2-2',difficulty:'medium'},
  {id:'reserve',word:'reserve',definition:'set aside for future use',sourceQuestionId:'practice-test-5:rw2-2',difficulty:'easy'},
  {id:'obtain',word:'obtain',definition:'get or acquire something',sourceQuestionId:'practice-test-5:rw2-2',difficulty:'easy'},

  {id:'reduced',word:'reduced',definition:'made smaller or less in amount',sourceQuestionId:'practice-test-5:rw2-3',difficulty:'easy'},
  {id:'evaluated',word:'evaluated',definition:'judged the quality, value, or importance of',sourceQuestionId:'practice-test-5:rw2-3',difficulty:'easy'},
  {id:'determined',word:'determined',definition:'established or found out with certainty',sourceQuestionId:'practice-test-5:rw2-3',difficulty:'easy'},
  {id:'acquired',word:'acquired',definition:'gained or obtained something',sourceQuestionId:'practice-test-5:rw2-3',difficulty:'easy'},

  {id:'tenuous',word:'tenuous',definition:'weak, slight, or not firmly established',sourceQuestionId:'practice-test-5:rw2-4',difficulty:'advanced'},
  {id:'enduring',word:'enduring',definition:'lasting for a long time',sourceQuestionId:'practice-test-5:rw2-4',difficulty:'easy'},
  {id:'contentious',word:'contentious',definition:'likely to cause disagreement or argument',sourceQuestionId:'practice-test-5:rw2-4',difficulty:'advanced'},
  {id:'conspicuous',word:'conspicuous',definition:'easy to notice or attracting attention',sourceQuestionId:'practice-test-5:rw2-4',difficulty:'advanced'},

  {id:'imagine',word:'imagine',definition:'form a mental picture or idea of',sourceQuestionId:'practice-test-5:rw2-5',difficulty:'easy'},
  {id:'summarize',word:'summarize',definition:'state the main points briefly',sourceQuestionId:'practice-test-5:rw2-5',difficulty:'easy'},
  {id:'defend',word:'defend',definition:'support a claim with reasons or evidence',sourceQuestionId:'practice-test-5:rw2-5',difficulty:'easy'},
  {id:'adjust',word:'adjust',definition:'change slightly to improve fit or suitability',sourceQuestionId:'practice-test-5:rw2-5',difficulty:'easy'},

  {id:'examples-of',word:'examples of',definition:'instances that illustrate a broader idea or type',sourceQuestionId:'practice-test-6:rw1-1',difficulty:'easy'},
  {id:'concerns-about',word:'concerns about',definition:'worries or issues relating to something',sourceQuestionId:'practice-test-6:rw1-1',difficulty:'easy'},
  {id:'indications-of',word:'indications of',definition:'signs or evidence suggesting something',sourceQuestionId:'practice-test-6:rw1-1',difficulty:'easy'},
  {id:'similarities-with',word:'similarities with',definition:'qualities or features shared with something else',sourceQuestionId:'practice-test-6:rw1-1',difficulty:'easy'},

  {id:'prudently',word:'prudently',definition:'carefully and with good judgment',sourceQuestionId:'practice-test-6:rw1-2',difficulty:'medium'},
  {id:'overtly',word:'overtly',definition:'openly and clearly rather than secretly',sourceQuestionId:'practice-test-6:rw1-2',difficulty:'medium'},
  {id:'cordially',word:'cordially',definition:'warmly, politely, and in a friendly way',sourceQuestionId:'practice-test-6:rw1-2',difficulty:'medium'},
  {id:'inadvertently',word:'inadvertently',definition:'unintentionally or by accident',sourceQuestionId:'practice-test-6:rw1-2',difficulty:'medium'},

  {id:'exacerbating',word:'exacerbating',definition:'making a problem or bad situation worse',sourceQuestionId:'practice-test-6:rw1-3',difficulty:'advanced'},
  {id:'redressing',word:'redressing',definition:'correcting or remedying an unfair situation',sourceQuestionId:'practice-test-6:rw1-3',difficulty:'advanced'},
  {id:'epitomizing',word:'epitomizing',definition:'serving as a perfect example of',sourceQuestionId:'practice-test-6:rw1-3',difficulty:'advanced'},
  {id:'precluding',word:'precluding',definition:'preventing something from happening',sourceQuestionId:'practice-test-6:rw1-3',difficulty:'advanced'},

  {id:'controversial-among',word:'controversial among',definition:'causing disagreement within a group',sourceQuestionId:'practice-test-6:rw1-5',difficulty:'medium'},
  {id:'antagonistic-toward',word:'antagonistic toward',definition:'hostile or strongly opposed to',sourceQuestionId:'practice-test-6:rw1-5',difficulty:'advanced'},
  {id:'imitated-by',word:'imitated by',definition:'copied or modeled by others',sourceQuestionId:'practice-test-6:rw1-5',difficulty:'easy'},
  {id:'inconsequential-to',word:'inconsequential to',definition:'having little or no important effect on',sourceQuestionId:'practice-test-6:rw1-5',difficulty:'advanced'},

  {id:'invented',word:'invented',definition:'created or devised something new',sourceQuestionId:'practice-test-6:rw2-1',difficulty:'easy'},
  {id:'adjusted',word:'adjusted',definition:'changed slightly to improve or correct',sourceQuestionId:'practice-test-6:rw2-1',difficulty:'easy'},
  {id:'featured',word:'featured',definition:'displayed or presented prominently',sourceQuestionId:'practice-test-6:rw2-1',difficulty:'easy'},
  {id:'recommended',word:'recommended',definition:'suggested as suitable or worthwhile',sourceQuestionId:'practice-test-6:rw2-1',difficulty:'easy'},

  {id:'complimented-by',word:'complimented by',definition:'praised or spoken of favorably by',sourceQuestionId:'practice-test-6:rw2-2',difficulty:'easy'},
  {id:'uncertain-about',word:'uncertain about',definition:'not sure or confident about',sourceQuestionId:'practice-test-6:rw2-2',difficulty:'easy'},
  {id:'unbothered-by',word:'unbothered by',definition:'not worried, upset, or affected by',sourceQuestionId:'practice-test-6:rw2-2',difficulty:'easy'},
  {id:'inspired-by',word:'inspired by',definition:'influenced or motivated by something',sourceQuestionId:'practice-test-6:rw2-2',difficulty:'easy'},

  {id:'obvious',word:'obvious',definition:'easy to see, recognize, or understand',sourceQuestionId:'practice-test-6:rw2-3',difficulty:'easy'},
  {id:'accidental',word:'accidental',definition:'happening by chance rather than intentionally',sourceQuestionId:'practice-test-6:rw2-3',difficulty:'easy'},
  {id:'observable',word:'observable',definition:'able to be noticed or measured',sourceQuestionId:'practice-test-6:rw2-3',difficulty:'easy'},

  {id:'insensible-to',word:'insensible to',definition:'unaware of or unaffected by',sourceQuestionId:'practice-test-6:rw2-4',difficulty:'advanced'},
  {id:'manifest-in',word:'manifest in',definition:'clearly shown or evident in',sourceQuestionId:'practice-test-6:rw2-4',difficulty:'advanced'},
  {id:'scrutinized-by',word:'scrutinized by',definition:'examined very carefully by',sourceQuestionId:'practice-test-6:rw2-4',difficulty:'advanced'},
  {id:'complicated-by',word:'complicated by',definition:'made more difficult or complex by',sourceQuestionId:'practice-test-6:rw2-4',difficulty:'easy'},

  {id:'permanent',word:'permanent',definition:'lasting or intended to last indefinitely',sourceQuestionId:'practice-test-6:rw2-5',difficulty:'easy'},
  {id:'tentative',word:'tentative',definition:'uncertain or not firmly established',sourceQuestionId:'practice-test-6:rw2-5',difficulty:'medium'},
  {id:'warranted',word:'warranted',definition:'justified or supported by the circumstances',sourceQuestionId:'practice-test-6:rw2-5',difficulty:'medium'},
  {id:'prominent',word:'prominent',definition:'important, well known, or easily noticed',sourceQuestionId:'practice-test-6:rw2-5',difficulty:'easy'},

  {id:'amusing',word:'amusing',definition:'causing laughter or entertaining interest',sourceQuestionId:'practice-test-7:rw2-3',difficulty:'easy'},
  {id:'costly',word:'costly',definition:'requiring a large amount of money or resources',sourceQuestionId:'practice-test-7:rw2-3',difficulty:'easy'},
  {id:'successful',word:'successful',definition:'achieving the intended result',sourceQuestionId:'practice-test-7:rw2-3',difficulty:'easy'},
  {id:'disastrous',word:'disastrous',definition:'causing great damage, failure, or harm',sourceQuestionId:'practice-test-7:rw2-3',difficulty:'easy'},

  {id:'unpredictable',word:'unpredictable',definition:'not able to be known or expected in advance',sourceQuestionId:'practice-test-8:rw1-1',difficulty:'easy'},
  {id:'important',word:'important',definition:'having great significance, value, or effect',sourceQuestionId:'practice-test-8:rw1-1',difficulty:'easy'},
  {id:'secretive',word:'secretive',definition:'inclined to keep thoughts, actions, or information hidden',sourceQuestionId:'practice-test-8:rw1-1',difficulty:'easy'},
  {id:'ordinary',word:'ordinary',definition:'normal, common, or not unusual',sourceQuestionId:'practice-test-8:rw1-1',difficulty:'easy'},

  {id:'disconcerting',word:'disconcerting',definition:'causing unease, confusion, or discomfort',sourceQuestionId:'practice-test-8:rw1-2',difficulty:'advanced'},
  {id:'acceptable',word:'acceptable',definition:'satisfactory or suitable enough for a purpose',sourceQuestionId:'practice-test-8:rw1-2',difficulty:'easy'},
  {id:'imperceptible',word:'imperceptible',definition:'so slight that it is difficult or impossible to notice',sourceQuestionId:'practice-test-8:rw1-2',difficulty:'advanced'},

  {id:'dangerous',word:'dangerous',definition:'likely to cause harm or injury',sourceQuestionId:'practice-test-8:rw1-3',difficulty:'easy'},
  {id:'imaginative',word:'imaginative',definition:'showing creativity or inventiveness',sourceQuestionId:'practice-test-8:rw1-3',difficulty:'easy'},
  {id:'surprising',word:'surprising',definition:'unexpected or causing astonishment',sourceQuestionId:'practice-test-8:rw1-3',difficulty:'easy'},

  {id:'characterization',word:'characterization',definition:'the act of describing the qualities or nature of someone or something',sourceQuestionId:'practice-test-8:rw1-4',difficulty:'medium'},
  {id:'interpretation',word:'interpretation',definition:'an explanation of the meaning or significance of something',sourceQuestionId:'practice-test-8:rw1-4',difficulty:'medium'},
  {id:'collaboration',word:'collaboration',definition:'the act of working together toward a shared goal',sourceQuestionId:'practice-test-8:rw1-4',difficulty:'easy'},
  {id:'commercialization',word:'commercialization',definition:'the process of turning something into a product or activity for profit',sourceQuestionId:'practice-test-8:rw1-4',difficulty:'advanced'},

  {id:'controversial',word:'controversial',definition:'likely to cause disagreement or public debate',sourceQuestionId:'practice-test-8:rw1-5',difficulty:'medium'},
  {id:'extensive',word:'extensive',definition:'large in amount, range, or scope',sourceQuestionId:'practice-test-8:rw1-5',difficulty:'easy'},
  {id:'universal',word:'universal',definition:'applying to all people, cases, or situations',sourceQuestionId:'practice-test-8:rw1-5',difficulty:'medium'},

  {id:'confusing-for',word:'confusing for',definition:'difficult for someone to understand clearly',sourceQuestionId:'practice-test-8:rw2-1',difficulty:'easy'},
  {id:'attractive-to',word:'attractive to',definition:'appealing or pleasing to',sourceQuestionId:'practice-test-8:rw2-1',difficulty:'easy'},
  {id:'corrected-by',word:'corrected by',definition:'changed or fixed by someone or something',sourceQuestionId:'practice-test-8:rw2-1',difficulty:'easy'},
  {id:'similar-to',word:'similar to',definition:'resembling something without being exactly the same',sourceQuestionId:'practice-test-8:rw2-1',difficulty:'easy'},

  {id:'preventable',word:'preventable',definition:'able to be stopped from happening',sourceQuestionId:'practice-test-8:rw2-2',difficulty:'easy'},
  {id:'undeniable',word:'undeniable',definition:'clearly true and impossible to reasonably dispute',sourceQuestionId:'practice-test-8:rw2-2',difficulty:'medium'},
  {id:'concerning',word:'concerning',definition:'causing worry or unease',sourceQuestionId:'practice-test-8:rw2-2',difficulty:'easy'},

  {id:'inadequate',word:'inadequate',definition:'not sufficient or good enough for a need or purpose',sourceQuestionId:'practice-test-8:rw2-3',difficulty:'medium'},
  {id:'dynamic',word:'dynamic',definition:'characterized by change, activity, or energy',sourceQuestionId:'practice-test-8:rw2-3',difficulty:'medium'},
  {id:'satisfactory',word:'satisfactory',definition:'good enough to meet a requirement or expectation',sourceQuestionId:'practice-test-8:rw2-3',difficulty:'easy'},

  {id:'indecipherable',word:'indecipherable',definition:'impossible or extremely difficult to understand or interpret',sourceQuestionId:'practice-test-8:rw2-4',difficulty:'advanced'},
  {id:'ornamental',word:'ornamental',definition:'serving mainly as decoration',sourceQuestionId:'practice-test-8:rw2-4',difficulty:'medium'},
  {id:'obscure',word:'obscure',definition:'unclear, difficult to understand, or not well known',sourceQuestionId:'practice-test-8:rw2-4',difficulty:'medium'},
  {id:'intricate',word:'intricate',definition:'having many complex and interconnected details',sourceQuestionId:'practice-test-8:rw2-4',difficulty:'advanced'},

  {id:'replicable',word:'replicable',definition:'capable of being repeated or reproduced',sourceQuestionId:'practice-test-8:rw2-5',difficulty:'advanced'},
  {id:'predetermined',word:'predetermined',definition:'decided or established in advance',sourceQuestionId:'practice-test-8:rw2-5',difficulty:'medium'},
  {id:'operative',word:'operative',definition:'functioning, active, or having an effect',sourceQuestionId:'practice-test-8:rw2-5',difficulty:'advanced'},
  {id:'latent',word:'latent',definition:'present but hidden, inactive, or not yet developed',sourceQuestionId:'practice-test-8:rw2-5',difficulty:'advanced'},

  {id:'organized',word:'organized',definition:'arranged in a structured or orderly way',sourceQuestionId:'practice-test-9:rw1-1',difficulty:'easy'},
  {id:'ranked',word:'ranked',definition:'placed in an order according to position or importance',sourceQuestionId:'practice-test-9:rw1-1',difficulty:'easy'},
  {id:'scheduled',word:'scheduled',definition:'planned to occur at a particular time',sourceQuestionId:'practice-test-9:rw1-1',difficulty:'easy'},
  {id:'discussed',word:'discussed',definition:'talked or written about in detail',sourceQuestionId:'practice-test-9:rw1-1',difficulty:'easy'},

  {id:'confident',word:'confident',definition:'certain or self-assured',sourceQuestionId:'practice-test-9:rw1-2',difficulty:'easy'},
  {id:'expensive',word:'expensive',definition:'costing a large amount of money or resources',sourceQuestionId:'practice-test-9:rw1-2',difficulty:'easy'},
  {id:'consistent',word:'consistent',definition:'steady, regular, or not changing unpredictably',sourceQuestionId:'practice-test-9:rw1-2',difficulty:'easy'},

  {id:'delegate',word:'delegate',definition:'assign a task or responsibility to another person',sourceQuestionId:'practice-test-9:rw1-3',difficulty:'medium'},
  {id:'compose',word:'compose',definition:'create or write a work, or make up a whole',sourceQuestionId:'practice-test-9:rw1-3',difficulty:'medium'},
  {id:'interpret',word:'interpret',definition:'explain or understand the meaning of something',sourceQuestionId:'practice-test-9:rw1-3',difficulty:'medium'},
  {id:'renounce',word:'renounce',definition:'formally give up, reject, or abandon',sourceQuestionId:'practice-test-9:rw1-3',difficulty:'advanced'},

  {id:'derived-from',word:'derived from',definition:'originating or obtained from a source',sourceQuestionId:'practice-test-9:rw1-4',difficulty:'medium'},
  {id:'recognized-in',word:'recognized in',definition:'identified or acknowledged within',sourceQuestionId:'practice-test-9:rw1-4',difficulty:'easy'},
  {id:'confined-to',word:'confined to',definition:'restricted or limited to a particular place or scope',sourceQuestionId:'practice-test-9:rw1-4',difficulty:'medium'},
  {id:'repressed-by',word:'repressed by',definition:'held back, restrained, or suppressed by',sourceQuestionId:'practice-test-9:rw1-4',difficulty:'advanced'},

  {id:'legitimate',word:'legitimate',definition:'lawful, valid, or generally accepted as proper',sourceQuestionId:'practice-test-9:rw1-5',difficulty:'medium'},
  {id:'impenetrable',word:'impenetrable',definition:'impossible to enter, understand, or overcome',sourceQuestionId:'practice-test-9:rw1-5',difficulty:'advanced'},
  {id:'compelling',word:'compelling',definition:'strongly convincing, persuasive, or interesting',sourceQuestionId:'practice-test-9:rw1-5',difficulty:'medium'},

  {id:'destroying',word:'destroying',definition:'causing something to cease to exist or be ruined',sourceQuestionId:'practice-test-9:rw2-1',difficulty:'easy'},
  {id:'finishing',word:'finishing',definition:'bringing something to an end or completing it',sourceQuestionId:'practice-test-9:rw2-1',difficulty:'easy'},
  {id:'advertising',word:'advertising',definition:'promoting something publicly to attract attention or buyers',sourceQuestionId:'practice-test-9:rw2-1',difficulty:'easy'},
  {id:'rejecting',word:'rejecting',definition:'refusing to accept, consider, or approve',sourceQuestionId:'practice-test-9:rw2-1',difficulty:'easy'},

  {id:'avoid',word:'avoid',definition:'keep away from or prevent contact with',sourceQuestionId:'practice-test-9:rw2-2',difficulty:'easy'},
  {id:'guess',word:'guess',definition:'give an answer without enough information to be certain',sourceQuestionId:'practice-test-9:rw2-2',difficulty:'easy'},
  {id:'provide',word:'provide',definition:'supply or make something available',sourceQuestionId:'practice-test-9:rw2-2',difficulty:'easy'},
  {id:'describe',word:'describe',definition:'give an account of the qualities or features of something',sourceQuestionId:'practice-test-9:rw2-2',difficulty:'easy'},

  {id:'indifference-to',word:'indifference to',definition:'lack of interest, concern, or enthusiasm about',sourceQuestionId:'practice-test-9:rw2-3',difficulty:'medium'},
  {id:'enthusiasm-for',word:'enthusiasm for',definition:'strong interest, excitement, or eagerness about',sourceQuestionId:'practice-test-9:rw2-3',difficulty:'easy'},
  {id:'concern-about',word:'concern about',definition:'worry or interest regarding something',sourceQuestionId:'practice-test-9:rw2-3',difficulty:'easy'},
  {id:'surprise-at',word:'surprise at',definition:'astonishment caused by something unexpected',sourceQuestionId:'practice-test-9:rw2-3',difficulty:'easy'},

  {id:'indicated-by',word:'indicated by',definition:'shown, suggested, or signaled by',sourceQuestionId:'practice-test-9:rw2-4',difficulty:'easy'},
  {id:'handmade-from',word:'handmade from',definition:'made by hand using a particular material',sourceQuestionId:'practice-test-9:rw2-4',difficulty:'easy'},
  {id:'represented-by',word:'represented by',definition:'shown, symbolized, or depicted by',sourceQuestionId:'practice-test-9:rw2-4',difficulty:'easy'},
  {id:'collected-with',word:'collected with',definition:'gathered using or together with something',sourceQuestionId:'practice-test-9:rw2-4',difficulty:'easy'},

  {id:'impartial',word:'impartial',definition:'fair and not favoring one side over another',sourceQuestionId:'practice-test-9:rw2-5',difficulty:'medium'},
  {id:'offhand',word:'offhand',definition:'casual, unplanned, or without careful thought',sourceQuestionId:'practice-test-9:rw2-5',difficulty:'advanced'},
  {id:'persistent',word:'persistent',definition:'continuing firmly despite difficulty or delay',sourceQuestionId:'practice-test-9:rw2-5',difficulty:'medium'},
  {id:'mandatory',word:'mandatory',definition:'required by a rule or law; compulsory',sourceQuestionId:'practice-test-9:rw2-5',difficulty:'medium'},
]

export const VOCABULARY_BANK:VocabularyEntry[]=[
  ...PRACTICE_TEST_VOCABULARY,
  ...OPEN_SAT_VOCABULARY,
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

export function vocabularyAdaptiveScore(entry:VocabularyEntry,attempts:VocabularyAttempt[]){
  const wordAttempts=attempts.filter(attempt=>attempt.vocabularyId===entry.id)
  if(!wordAttempts.length)return 80
  const recent=wordAttempts.slice(-5)
  const accuracy=recent.filter(attempt=>attempt.correct).length/recent.length
  const failed=vocabularyFailedIds(wordAttempts).has(entry.id)
  const difficultyWeight=entry.difficulty==='advanced'?8:entry.difficulty==='medium'?4:0
  const recencyPenalty=Math.min(wordAttempts.length,6)
  return (failed?100:0)+Math.round((1-accuracy)*60)+difficultyWeight-recencyPenalty
}

export function selectVocabularyEntry(
  entries:VocabularyEntry[],
  mode:VocabularySelectionMode,
  attempts:VocabularyAttempt[],
  rng:()=>number=Math.random,
){
  if(!entries.length)return null
  if(mode==='random')return entries[Math.floor(rng()*entries.length)]
  const scored=entries.map(entry=>({entry,score:vocabularyAdaptiveScore(entry,attempts)}))
  const topScore=Math.max(...scored.map(item=>item.score))
  const candidates=scored.filter(item=>item.score>=topScore-12).map(item=>item.entry)
  return candidates[Math.floor(rng()*candidates.length)]
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
  direction:VocabularyDirection
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
    ?{entry,direction,prompt:entry.word,answer:entry.definition,options:buildVocabularyOptions(entry,direction,bank,rng)}
    :{entry,direction,prompt:entry.definition,answer:entry.word,options:buildVocabularyOptions(entry,direction,bank,rng)}
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
  const ordered=settings.selection==='random'?shuffleVocabulary(eligible,rng):[...eligible].sort((a,b)=>vocabularyAdaptiveScore(b,attempts)-vocabularyAdaptiveScore(a,attempts))
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

import {TARGETED_MOCK_QUESTIONS} from './targetedMockQuestions'
import type { ModuleKey,PracticeQuestion,PracticeTestFilter,PracticeTestId,SourceCrop,Subject,SubjectMode } from '../types'
import {PRACTICE_TEST_5_ACCEPTED,PRACTICE_TEST_5_ANSWER_PAGES,PRACTICE_TEST_5_ANSWERS,PRACTICE_TEST_5_PAGES} from './practiceTest5Data'
import {PRACTICE_TEST_6_ACCEPTED,PRACTICE_TEST_6_ANSWER_PAGES,PRACTICE_TEST_6_ANSWERS,PRACTICE_TEST_6_CROPS,PRACTICE_TEST_6_PAGES} from './practiceTest6Data'
import {PRACTICE_TEST_7_ACCEPTED,PRACTICE_TEST_7_ANSWER_PAGES,PRACTICE_TEST_7_ANSWERS,PRACTICE_TEST_7_CROPS,PRACTICE_TEST_7_PAGES} from './practiceTest7Data'

const pages:Record<ModuleKey,Record<number,number>>={rw1:{1:4,2:4,3:5,4:5,5:6,6:6,7:7,8:7,9:8,10:8,11:9,12:9,13:10,14:10,15:11,16:11,17:12,18:13,19:13,20:13,21:13,22:14,23:14,24:14,25:14,26:15,27:15,28:15,29:15,30:16,31:16,32:17,33:17},rw2:{1:18,2:18,3:19,4:19,5:19,6:19,7:20,8:20,9:21,10:21,11:22,12:22,13:23,14:24,15:24,16:24,17:25,18:25,19:25,20:26,21:26,22:26,23:26,24:27,25:27,26:27,27:28,28:28,29:28,30:29,31:29,32:30,33:30},math1:{1:34,2:34,3:34,4:34,5:35,6:35,7:35,8:35,9:35,10:36,11:36,12:36,13:36,14:36,15:37,16:37,17:37,18:37,19:38,20:38,21:38,22:38,23:38,24:39,25:39,26:39,27:39},math2:{1:42,2:42,3:42,4:42,5:43,6:43,7:43,8:43,9:43,10:44,11:44,12:44,13:44,14:44,15:45,16:45,17:45,18:45,19:46,20:46,21:46,22:46,23:47,24:47,25:48,26:48,27:48}}
const answerPages:Record<ModuleKey,Record<number,number>>={rw1:{1:2,2:3,3:3,4:4,5:4,6:5,7:5,8:6,9:6,10:7,11:7,12:8,13:8,14:9,15:10,16:11,17:11,18:12,19:12,20:12,21:13,22:13,23:13,24:14,25:14,26:15,27:15,28:15,29:16,30:16,31:16,32:17,33:17},rw2:{1:18,2:19,3:19,4:20,5:20,6:21,7:21,8:22,9:22,10:23,11:23,12:24,13:24,14:25,15:25,16:26,17:27,18:27,19:28,20:28,21:28,22:29,23:29,24:29,25:30,26:30,27:31,28:31,29:32,30:32,31:32,32:33,33:33},math1:{1:34,2:34,3:34,4:35,5:35,6:35,7:35,8:35,9:36,10:36,11:36,12:37,13:37,14:37,15:38,16:38,17:38,18:39,19:39,20:39,21:40,22:40,23:40,24:41,25:41,26:42,27:43},math2:{1:44,2:44,3:44,4:45,5:45,6:45,7:45,8:46,9:46,10:46,11:46,12:47,13:48,14:48,15:48,16:48,17:49,18:49,19:50,20:50,21:51,22:51,23:51,24:51,25:52,26:52,27:53}}
const answers:Record<ModuleKey,Record<number,string>>={rw1:{1:'B',2:'A',3:'A',4:'C',5:'A',6:'B',7:'D',8:'B',9:'B',10:'D',11:'C',12:'D',13:'A',14:'B',15:'C',16:'A',17:'A',18:'A',19:'A',20:'D',21:'D',22:'D',23:'B',24:'C',25:'B',26:'A',27:'C',28:'D',29:'A',30:'A',31:'D',32:'D',33:'C'},rw2:{1:'D',2:'D',3:'B',4:'B',5:'B',6:'B',7:'A',8:'C',9:'C',10:'A',11:'A',12:'B',13:'D',14:'C',15:'C',16:'A',17:'B',18:'D',19:'C',20:'A',21:'B',22:'D',23:'D',24:'A',25:'B',26:'B',27:'A',28:'A',29:'C',30:'C',31:'A',32:'A',33:'B'},math1:{1:'B',2:'A',3:'B',4:'D',5:'A',6:'9',7:'10',8:'A',9:'B',10:'D',11:'A',12:'C',13:'1/5',14:'80',15:'D',16:'B',17:'B',18:'A',19:'C',20:'100',21:'361/8',22:'B',23:'D',24:'C',25:'C',26:'D',27:'5'},math2:{1:'B',2:'B',3:'C',4:'A',5:'A',6:'15 or -5',7:'50',8:'B',9:'D',10:'A',11:'A',12:'B',13:'3/10',14:'2',15:'A',16:'C',17:'B',18:'D',19:'A',20:'15/17',21:'51',22:'A',23:'C',24:'C',25:'D',26:'B',27:'600'}}
const studentProduced:Record<ModuleKey,Set<number>>={rw1:new Set(),rw2:new Set(),math1:new Set([6,7,13,14,20,21,27]),math2:new Set([6,7,13,14,20,21,27])}
const acceptedStudentAnswers:Partial<Record<ModuleKey,Record<number,string[]>>>={
  math1:{6:['9'],7:['10'],13:['1/5','.2'],14:['80'],20:['100'],21:['361/8','45.12','45.13'],27:['5']},
  math2:{6:['15','-5'],7:['50'],13:['.3','3/10'],14:['2'],20:['15/17','.8824','.8823'],21:['51'],27:['600']},
}

type PracticeTestSeedOptions={
  sourceCrops?:Record<ModuleKey,Record<number,SourceCrop>>
  contentStatus?:PracticeQuestion['contentStatus']
  questionMode?:PracticeQuestion['questionMode']
}

function makeModule(
  module:ModuleKey,subject:Subject,count:number,practiceTestId:PracticeTestId,
  sourcePages:Record<ModuleKey,Record<number,number>>,
  explanationPages:Record<ModuleKey,Record<number,number>>,
  answerKey:Record<ModuleKey,Record<number,string>>,
  accepted:Partial<Record<ModuleKey,Record<number,string[]>>>,
  options:PracticeTestSeedOptions={},
):PracticeQuestion[]{
  return Array.from({length:count},(_,i)=>{
    const number=i+1
    const correctAnswer=answerKey[module][number]
    return{
      id:practiceTestId==='practice-test-4'?`${module}-${number}`:`${practiceTestId}:${module}-${number}`,
      practiceTestId,subject,module,number,
      sourcePage:sourcePages[module][number],
      answerPage:explanationPages[module][number],
      correctAnswer,
      acceptedAnswers:accepted[module]?.[number]??[correctAnswer],
      responseType:studentProduced[module].has(number)?'student-produced':'multiple-choice',
      sourceCrop:options.sourceCrops?.[module]?.[number],
      contentStatus:options.contentStatus,
      questionMode:options.questionMode,
    }
  })
}

function makePracticeTest(
  practiceTestId:PracticeTestId,
  sourcePages:Record<ModuleKey,Record<number,number>>,
  explanationPages:Record<ModuleKey,Record<number,number>>,
  answerKey:Record<ModuleKey,Record<number,string>>,
  accepted:Partial<Record<ModuleKey,Record<number,string[]>>>,
  options:PracticeTestSeedOptions={},
){
  return[
    ...makeModule('rw1','english',33,practiceTestId,sourcePages,explanationPages,answerKey,accepted,options),
    ...makeModule('rw2','english',33,practiceTestId,sourcePages,explanationPages,answerKey,accepted,options),
    ...makeModule('math1','math',27,practiceTestId,sourcePages,explanationPages,answerKey,accepted,options),
    ...makeModule('math2','math',27,practiceTestId,sourcePages,explanationPages,answerKey,accepted,options),
  ]
}

export const QUESTION_BANK=[
  ...makePracticeTest('practice-test-4',pages,answerPages,answers,acceptedStudentAnswers),
  ...makePracticeTest('practice-test-5',PRACTICE_TEST_5_PAGES,PRACTICE_TEST_5_ANSWER_PAGES,PRACTICE_TEST_5_ANSWERS,PRACTICE_TEST_5_ACCEPTED),
  ...makePracticeTest('practice-test-6',PRACTICE_TEST_6_PAGES,PRACTICE_TEST_6_ANSWER_PAGES,PRACTICE_TEST_6_ANSWERS,PRACTICE_TEST_6_ACCEPTED,{sourceCrops:PRACTICE_TEST_6_CROPS,contentStatus:'verified',questionMode:'image-fallback'})
    .map(question=>question.module==='rw1'||question.module==='rw2'||question.module==='math1'?{...question,questionMode:'text' as const}:question),
  ...makeModule('rw1','english',33,'practice-test-7',PRACTICE_TEST_7_PAGES,PRACTICE_TEST_7_ANSWER_PAGES,PRACTICE_TEST_7_ANSWERS,PRACTICE_TEST_7_ACCEPTED,{sourceCrops:PRACTICE_TEST_7_CROPS,contentStatus:'verified',questionMode:'text'}),
  ...makeModule('rw2','english',33,'practice-test-7',PRACTICE_TEST_7_PAGES,PRACTICE_TEST_7_ANSWER_PAGES,PRACTICE_TEST_7_ANSWERS,PRACTICE_TEST_7_ACCEPTED,{sourceCrops:PRACTICE_TEST_7_CROPS,contentStatus:'verified',questionMode:'text'}),
  ...makeModule('math1','math',27,'practice-test-7',PRACTICE_TEST_7_PAGES,PRACTICE_TEST_7_ANSWER_PAGES,PRACTICE_TEST_7_ANSWERS,PRACTICE_TEST_7_ACCEPTED,{sourceCrops:PRACTICE_TEST_7_CROPS,contentStatus:'verified',questionMode:'text'}),
  ...makeModule('math2','math',27,'practice-test-7',PRACTICE_TEST_7_PAGES,PRACTICE_TEST_7_ANSWER_PAGES,PRACTICE_TEST_7_ANSWERS,PRACTICE_TEST_7_ACCEPTED,{sourceCrops:PRACTICE_TEST_7_CROPS,contentStatus:'verified',questionMode:'text'}),
  ...TARGETED_MOCK_QUESTIONS,
]

function practiceTestNumber(id:PracticeTestId){return Number(id.replace('practice-test-',''))}

export function availablePracticeTests(questions:PracticeQuestion[]=QUESTION_BANK){
  const ids=[...new Set(questions.map(question=>question.practiceTestId).filter((id):id is PracticeTestId=>Boolean(id)))]
  return ids.sort((a,b)=>practiceTestNumber(a)-practiceTestNumber(b))
}

export function practiceTestLabel(id:PracticeTestId){return id==='practice-test-8'?'Targeted Mock Practice':`Practice Test ${practiceTestNumber(id)}`}
export function questionsForMode(mode:SubjectMode){return mode==='both'?QUESTION_BANK:QUESTION_BANK.filter(q=>q.subject===mode)}
export function questionsForPractice(mode:SubjectMode,practiceTest:PracticeTestFilter='all'){
  return questionsForMode(mode).filter(question=>practiceTest==='all'?question.practiceTestId!=='practice-test-8':question.practiceTestId===practiceTest)
}
export function moduleLabel(module:ModuleKey){return module==='rw1'?'Reading & Writing · Module 1':module==='rw2'?'Reading & Writing · Module 2':module==='math1'?'Math · Module 1':'Math · Module 2'}

import type {PracticeQuestion,PracticeTestId,ModuleKey} from '../types'

// Synthetic metadata only. No actual questions, passages, explanations or answer keys
// are kept in the repository or shipped in a production bundle.
const modules:Array<{module:ModuleKey;subject:'english'|'math';count:number}>=[
  {module:'rw1',subject:'english',count:33},
  {module:'rw2',subject:'english',count:33},
  {module:'math1',subject:'math',count:27},
  {module:'math2',subject:'math',count:27},
]
export const TEST_QUESTION_METADATA:PracticeQuestion[]=
  (['practice-test-4','practice-test-5','practice-test-6','practice-test-7'] as PracticeTestId[])
  .flatMap(practiceTestId=>modules.flatMap(({module,subject,count})=>
    Array.from({length:count},(_,i)=>{
      const number=i+1
      return{
        id:practiceTestId==='practice-test-4'?module+'-'+number:practiceTestId+':'+module+'-'+number,
        practiceTestId,subject,module,number,
        sourcePage:0,answerPage:0,
        correctAnswer:'A',acceptedAnswers:['A'],
        responseType:'multiple-choice' as const,
      }
    })
  ))

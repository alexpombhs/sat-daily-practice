import AlexButton from '../atoms/AlexButton'
import AlexChoiceButton from '../atoms/AlexChoiceButton'
import AlexTextField from '../atoms/AlexTextField'
import AnswerFeedback from '../molecules/AnswerFeedback'
import ExplanationContent from '../molecules/ExplanationContent'
import {answerLabel} from '../../lib/answerCompare'
import {formatDuration} from '../../lib/practiceGamification'
import type {Attempt,PracticeQuestion} from '../../types'

type Props={
  question:PracticeQuestion
  selected:string
  submitted:boolean
  attempt?:Attempt
  explanationBytes:ArrayBuffer|null
  onSelect:(value:string)=>void
  onSubmit:()=>void
  revealFeedback?:boolean
  reviewMode?:boolean
}

export default function PracticeAnswerPanel({question,selected,submitted,attempt,explanationBytes,onSelect,onSubmit,revealFeedback=true,reviewMode=false}:Props){
  return <aside className="answer-panel">
    <div><p className="answer-kicker">{reviewMode?'Session review':'Your answer'}</p><h2>{question.responseType==='multiple-choice'?'Choose the best answer.':'Enter your answer.'}</h2><p className="answer-helper">{reviewMode?'Compare your response with the accepted answer and walkthrough.':revealFeedback?'Your response is checked against the answer key when you submit.':'Your response is saved now and scored after the session.'}</p></div>
    {question.responseType==='multiple-choice'?<div className="choices">{['A','B','C','D'].map(choice=><AlexChoiceButton disabled={Boolean(attempt)} selected={selected===choice} onClick={()=>onSelect(choice)} key={choice} label={choice}/>)}</div>:<AlexTextField
      disabled={Boolean(attempt)||submitted}
      value={selected}
      onChange={event=>onSelect(event.target.value)}
      onKeyDown={event=>{
        if(event.key!=='Enter'||attempt||submitted||!selected.trim())return
        event.preventDefault()
        onSubmit()
      }}
      placeholder="Type a number, decimal, or fraction"
    />}
    {!attempt&&!submitted&&<AlexButton fullWidth disabled={!selected.trim()} onClick={onSubmit}>Submit answer</AlexButton>}
    {attempt&&revealFeedback&&<AnswerFeedback correct={attempt.correct} acceptedAnswer={answerLabel(question)} elapsedLabel={formatDuration(attempt.elapsedMs)}/>}
    {attempt&&!revealFeedback&&<p className="muted">Answer saved. Correct answers and explanations will be available after you finish the session.</p>}
    {attempt&&revealFeedback&&explanationBytes&&<details className="inline-review" open={reviewMode}><summary>Review walkthrough</summary><ExplanationContent question={question} bytes={explanationBytes}/></details>}
    <p className="review-note">{reviewMode?'Use Previous and Next to review the full session.':revealFeedback?'Walkthroughs are optional and remain available in your session review.':'Finish the session to see your score, correct answers, and explanations.'}</p>
  </aside>
}

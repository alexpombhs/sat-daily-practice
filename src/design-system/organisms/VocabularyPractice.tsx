import {useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexChoiceButton from '../atoms/AlexChoiceButton'
import AlexStatusChip from '../atoms/AlexStatusChip'
import AlexSurface from '../atoms/AlexSurface'
import AlexTabs from '../atoms/AlexTabs'
import AlexText from '../atoms/AlexText'
import {createVocabularySession,type VocabularyDirection,type VocabularyPrompt} from '../../lib/vocabulary'

const SESSION_SIZE=10

export default function VocabularyPractice(){
  const[direction,setDirection]=useState<VocabularyDirection>('word-to-definition')
  const[session,setSession]=useState<VocabularyPrompt[]>(()=>createVocabularySession('word-to-definition',SESSION_SIZE))
  const[index,setIndex]=useState(0)
  const[selected,setSelected]=useState('')
  const[score,setScore]=useState(0)
  const[complete,setComplete]=useState(false)

  const current=session[index]
  const answered=Boolean(selected)
  const correct=answered&&selected===current.answer

  function restart(nextDirection:VocabularyDirection=direction){
    setDirection(nextDirection)
    setSession(createVocabularySession(nextDirection,SESSION_SIZE))
    setIndex(0)
    setSelected('')
    setScore(0)
    setComplete(false)
  }

  function choose(option:string){
    if(answered||complete)return
    setSelected(option)
    if(option===current.answer)setScore(value=>value+1)
  }

  function next(){
    if(!answered)return
    if(index>=session.length-1){
      setComplete(true)
      return
    }
    setIndex(value=>value+1)
    setSelected('')
  }

  if(complete)return <AlexBox component="section" sx={{width:'100%',px:{xs:.5,sm:1.5,md:2.5,lg:4},py:{xs:2,sm:2.75,lg:4}}}>
    <AlexBox sx={{maxWidth:760,mx:'auto'}}>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:28,sm:32,lg:36},fontWeight:500,lineHeight:1.12,m:0,color:'#08275B'}}>Vocabulary practice</AlexText>
      <AlexSurface sx={{mt:3,p:{xs:2.5,sm:4},border:'1px solid #E4E7EC',textAlign:'center'}}>
        <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#667085'}}>Session complete</AlexText>
        <AlexText component="div" sx={{fontSize:{xs:42,sm:52},fontWeight:900,lineHeight:1,color:'#08275B',mt:1.5}}>{score}/{session.length}</AlexText>
        <AlexText sx={{fontSize:15,color:'#667085',mt:1}}>You answered {Math.round(score/session.length*100)}% correctly.</AlexText>
        <AlexBox sx={{display:'flex',justifyContent:'center',gap:1,mt:3,flexWrap:'wrap'}}>
          <AlexButton onClick={()=>restart()}>Practice another 10</AlexButton>
          <AlexButton tone="secondary" onClick={()=>restart(direction==='word-to-definition'?'definition-to-word':'word-to-definition')}>Switch direction</AlexButton>
        </AlexBox>
      </AlexSurface>
    </AlexBox>
  </AlexBox>

  return <AlexBox component="section" sx={{width:'100%',px:{xs:.5,sm:1.5,md:2.5,lg:4},py:{xs:2,sm:2.75,lg:4}}}>
    <AlexBox sx={{maxWidth:760,mx:'auto'}}>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:28,sm:32,lg:36},fontWeight:500,lineHeight:1.12,m:0,color:'#08275B'}}>Vocabulary practice</AlexText>
      <AlexText sx={{fontSize:15,color:'#667085',mt:1}}>Practice words pulled from the SAT Reading & Writing question bank.</AlexText>

      <AlexSurface sx={{mt:3,p:{xs:2,sm:2.5},border:'1px solid #E4E7EC',bgcolor:'#fff'}}>
        <AlexTabs
          value={direction}
          options={[
            {value:'word-to-definition',label:'Word → meaning'},
            {value:'definition-to-word',label:'Meaning → word'},
          ]}
          onChange={value=>restart(value)}
          aria-label="Vocabulary practice direction"
        />

        <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:2,mt:2.5}}>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#667085'}}>QUESTION {index+1} OF {session.length}</AlexText>
          <AlexStatusChip>{score} CORRECT</AlexStatusChip>
        </AlexBox>

        <AlexBox sx={{mt:2.5,p:{xs:2,sm:3},borderRadius:2,bgcolor:'#F8FAFC',border:'1px solid #EEF1F4'}}>
          <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.05em',color:'#667085'}}>
            {direction==='word-to-definition'?'Choose the best meaning':'Choose the matching word'}
          </AlexText>
          <AlexText component="div" sx={{fontSize:{xs:26,sm:32},fontWeight:850,lineHeight:1.25,color:'#08275B',mt:1}}>
            {current.prompt}
          </AlexText>
        </AlexBox>

        <AlexBox sx={{display:'grid',gap:1.1,mt:2}}>
          {current.options.map(option=><AlexChoiceButton
            key={option}
            label={option}
            selected={selected===option}
            disabled={answered&&selected!==option}
            onClick={()=>choose(option)}
          />)}
        </AlexBox>

        {answered&&<AlexSurface sx={{mt:2,p:2,border:'1px solid',borderColor:correct?'#A9E0BE':'#F3C3BD',bgcolor:correct?'#F2FBF5':'#FFF6F5'}}>
          <AlexText sx={{fontSize:14,fontWeight:850,color:correct?'#177245':'#A33A31'}}>{correct?'Correct':'Not quite'}</AlexText>
          {!correct&&<AlexText sx={{fontSize:14,color:'#344054',mt:.4}}>Correct answer: <b>{current.answer}</b></AlexText>}
          <AlexText sx={{fontSize:12.5,color:'#667085',mt:.55}}>From SAT question {current.entry.sourceQuestionId}</AlexText>
        </AlexSurface>}

        <AlexBox sx={{display:'flex',justifyContent:'flex-end',mt:2.5}}>
          <AlexButton disabled={!answered} onClick={next}>{index===session.length-1?'Finish':'Next'}</AlexButton>
        </AlexBox>
      </AlexSurface>
    </AlexBox>
  </AlexBox>
}

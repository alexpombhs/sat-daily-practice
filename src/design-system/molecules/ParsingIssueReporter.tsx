import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {Flag} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import AlexTooltip from '../atoms/AlexTooltip'
import {createParsingIssueReport,type ParsingIssueContext} from '../../lib/parsingIssueReports'
import type {PracticeQuestion} from '../../types'

type Props={question:PracticeQuestion;context:ParsingIssueContext;compact?:boolean}

export default function ParsingIssueReporter({question,context,compact=false}:Props){
  const[open,setOpen]=useState(false)
  const[message,setMessage]=useState('')
  const[saving,setSaving]=useState(false)
  const[status,setStatus]=useState('')

  useEffect(()=>{
    setOpen(false)
    setMessage('')
    setSaving(false)
    setStatus('')
  },[question.id])

  async function submit(){
    setSaving(true);setStatus('')
    try{
      const result=await createParsingIssueReport(question,context,message)
      setMessage('');setOpen(false);setStatus(result.syncedToAdmin?'Parsing issue reported.':'Saved locally — sign in to sync.')
    }catch(error){
      console.error('Parsing issue report failed',error)
      setStatus('The report could not be sent to the shared queue. Please try again.')
    }finally{setSaving(false)}
  }

  const form=<AlexSurface
    role="dialog"
    aria-label="Report parsing issue"
    sx={{
      p:{xs:2,sm:1.75},
      border:'1px solid #E6E2DB',
      borderRadius:{xs:'16px 16px 0 0',sm:2},
      bgcolor:'#FBFAF8',
      width:{xs:'100%',sm:380},
      maxWidth:{xs:'100%',sm:'calc(100vw - 48px)'},
      maxHeight:{xs:'min(70dvh,520px)',sm:'calc(100dvh - 48px)'},
      overflowY:'auto',
      boxShadow:'0 18px 48px rgba(9,35,79,.22)',
    }}
  >
    <AlexText sx={{fontSize:13.5,fontWeight:800,color:'#08275B'}}>Flag a parsing or formatting problem</AlexText>
    <AlexText sx={{fontSize:12.5,color:'#667085',mt:.35,mb:1.1}}>The question is attached automatically. Add an optional note about what looks wrong.</AlexText>
    <AlexTextField multiline minRows={2} maxRows={5} value={message} onChange={event=>setMessage(event.target.value.slice(0,1000))} placeholder="Optional: describe the parsing problem" inputProps={{maxLength:1000}}/>
    <AlexBox sx={{display:'flex',gap:1,mt:1.1,flexWrap:'wrap'}}>
      <AlexButton size="small" disabled={saving} onClick={submit}>{saving?'Saving…':'Submit report'}</AlexButton>
      <AlexButton size="small" tone="secondary" disabled={saving} onClick={()=>{setOpen(false);setMessage('')}}>Cancel</AlexButton>
    </AlexBox>
  </AlexSurface>

  // Compact reporters can live inside clipped/scrolling review cards. Always portal
  // their dialog to the viewport so session review, practice, and other compact
  // contexts render above the entire app layout instead of inside the card.
  const useViewportOverlay=open&&compact&&typeof document!=='undefined'

  return <AlexBox sx={compact?{position:'relative',display:'inline-flex',alignItems:'center',gap:.75,flex:'0 0 auto'}:{display:'grid',gap:1}}>
    {!open&&<AlexTooltip title="Report parsing issue" placement="top"><AlexButtonBase aria-label="Report parsing issue" onClick={()=>{setOpen(true);setStatus('')}} sx={{justifySelf:'start',width:32,height:32,borderRadius:'50%',border:'1px solid #E6E2DB',bgcolor:'#fff',color:'#667085','&:hover':{bgcolor:'#F7F5FF',borderColor:'#D7CFFF',color:'#4B3FCE'}}}><Flag size={16}/></AlexButtonBase></AlexTooltip>}

    {open&&!useViewportOverlay&&<AlexBox sx={compact?{position:'absolute',top:38,left:0,zIndex:60}:{}}>{form}</AlexBox>}

    {useViewportOverlay&&createPortal(
      <AlexBox
        sx={{
          position:'fixed',
          inset:0,
          zIndex:1500,
          bgcolor:'rgba(8,39,91,.28)',
          display:'flex',
          alignItems:{xs:'flex-end',sm:'center'},
          justifyContent:'center',
          p:{xs:0,sm:3},
        }}
        onClick={()=>{if(!saving){setOpen(false);setMessage('')}}}
      >
        <AlexBox sx={{width:{xs:'100%',sm:'auto'}}} onClick={event=>event.stopPropagation()}>
          {form}
        </AlexBox>
      </AlexBox>,
      document.body,
    )}

    {status&&<AlexText role="status" sx={{fontSize:12.5,fontWeight:700,whiteSpace:'nowrap',color:status.startsWith('Parsing issue')||status.startsWith('Saved')?'#067647':'#B42318'}}>{status}</AlexText>}
  </AlexBox>
}

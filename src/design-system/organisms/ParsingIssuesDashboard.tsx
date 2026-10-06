import {useEffect,useMemo,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexStatusChip from '../atoms/AlexStatusChip'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import QuestionRepairEditor from '../molecules/QuestionRepairEditor'
import QuestionSourceReview from '../molecules/QuestionSourceReview'
import {availablePracticeTests,moduleLabel,practiceTestLabel,QUESTION_BANK} from '../../lib/questionBank'
import {loadSharedQuestionBank,mergeQuestionBanks} from '../../lib/sharedQuestionBank'
import {deleteParsingIssueReport,loadParsingIssueReports,setParsingIssueStatus,type ParsingIssueReport,type ParsingIssueStatus} from '../../lib/parsingIssueReports'
import type {PracticeQuestion,PracticeTestFilter} from '../../types'

type StatusFilter='all'|ParsingIssueStatus
type Props={questionsPdf:ArrayBuffer|null;answersPdf:ArrayBuffer|null}

export default function ParsingIssuesDashboard({questionsPdf,answersPdf}:Props){
  const[reports,setReports]=useState<ParsingIssueReport[]>([])
  const[bank,setBank]=useState<PracticeQuestion[]>(()=>QUESTION_BANK)
  const[selectedId,setSelectedId]=useState<string|null>(null)
  const[practiceTest,setPracticeTest]=useState<PracticeTestFilter>('all')
  const[statusFilter,setStatusFilter]=useState<StatusFilter>('open')
  const[loading,setLoading]=useState(true)
  const[error,setError]=useState('')
  const[revision,setRevision]=useState(0)

  async function refresh(){
    setLoading(true);setError('')
    try{setReports(await loadParsingIssueReports())}
    catch(reason){setError(reason instanceof Error?reason.message:'Unable to load parsing reports.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    void refresh()
    void loadSharedQuestionBank().then(shared=>setBank(mergeQuestionBanks(QUESTION_BANK,shared))).catch(()=>{})
    const handler=()=>void refresh()
    window.addEventListener('sat-parsing-issues-updated',handler)
    return()=>window.removeEventListener('sat-parsing-issues-updated',handler)
  },[])

  const filtered=useMemo(()=>reports.filter(report=>
    (practiceTest==='all'||report.practiceTestId===practiceTest)&&(statusFilter==='all'||report.status===statusFilter)
  ),[reports,practiceTest,statusFilter])

  const selected=filtered.find(report=>report.id===selectedId)??filtered[0]??null
  const selectedQuestion=selected?(bank.find(question=>question.id===selected.questionId)??null):null
  const testOptions=[{value:'all' as const,label:'All practice tests'},...availablePracticeTests(bank).map(value=>({value,label:practiceTestLabel(value)}))]

  async function changeStatus(report:ParsingIssueReport,status:ParsingIssueStatus){
    try{
      await setParsingIssueStatus(report.id,status)
      setReports(items=>items.map(item=>item.id===report.id?{...item,status,updatedAt:new Date().toISOString()}:item))
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to update report.')}
  }

  async function remove(report:ParsingIssueReport){
    if(!window.confirm('Delete this parsing issue report?'))return
    try{
      await deleteParsingIssueReport(report.id)
      setReports(items=>items.filter(item=>item.id!==report.id))
      if(selectedId===report.id)setSelectedId(null)
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to delete report.')}
  }

  return <main className="shell">
    <AlexBox sx={{display:'flex',justifyContent:'space-between',alignItems:{xs:'flex-start',md:'flex-end'},gap:2,flexDirection:{xs:'column',md:'row'},mb:2.5}}>
      <AlexBox>
        <AlexText sx={{fontSize:12,textTransform:'uppercase',letterSpacing:'.12em',fontWeight:800,color:'#6558F5'}}>Quality review</AlexText>
        <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:32,md:42},lineHeight:1.1,my:1,color:'#08275B'}}>Parsing Issues</AlexText>
        <AlexText sx={{color:'#667085',maxWidth:760}}>Shared queue of parsing and formatting problems. Open a report to compare the reconstructed question with the original source and explanation, then repair the text or visual crop directly.</AlexText>
      </AlexBox>
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:1,minWidth:{xs:'100%',md:430}}}>
        <AlexDropdown id="parsing-issues-test" label="Practice test" value={practiceTest} options={testOptions} onChange={setPracticeTest}/>
        <AlexDropdown id="parsing-issues-status" label="Status" value={statusFilter} options={[{value:'all',label:'All statuses'},{value:'open',label:'Open'},{value:'resolved',label:'Resolved'}]} onChange={setStatusFilter}/>
      </AlexBox>
    </AlexBox>

    {error&&<AlexSurface sx={{p:2,border:'1px solid #FDA29B',borderRadius:2,bgcolor:'#FFFBFA',mb:2}}><AlexText sx={{color:'#B42318',fontSize:14}}>{error}</AlexText></AlexSurface>}
    {loading?<AlexText sx={{color:'#667085'}}>Loading parsing issues…</AlexText>:filtered.length===0?
      <AlexSurface sx={{p:3,border:'1px solid #E6E2DB',borderRadius:3}}>
        <AlexText component="h2" sx={{fontSize:19,fontWeight:800}}>No matching reports</AlexText>
        <AlexText sx={{color:'#667085',mt:.5}}>Flag a question from practice, review, the Question Bank, or question statistics and it will appear in this shared queue.</AlexText>
      </AlexSurface>:
      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',lg:'300px minmax(0,1fr)'},gap:2,alignItems:'stretch',minHeight:{lg:'calc(100vh - 32px)'}}}>
        <AlexSurface sx={{border:'1px solid #E6E2DB',borderRadius:3,overflow:'hidden',height:'100%',minHeight:0,display:'flex',flexDirection:'column'}}>
          <AlexBox sx={{px:1.75,py:1.5,borderBottom:'1px solid #E6E2DB',bgcolor:'#F7F6F2'}}>
            <AlexText sx={{fontSize:13,fontWeight:850,color:'#08275B'}}>{filtered.length} report{filtered.length===1?'':'s'}</AlexText>
          </AlexBox>
          <AlexBox sx={{overflowY:'auto',flex:1,minHeight:0}}>
            {filtered.map(report=><AlexButtonBase
              key={report.id}
              onClick={()=>setSelectedId(report.id)}
              aria-pressed={selected?.id===report.id}
              sx={{display:'block',width:'100%',textAlign:'left',p:1.6,borderBottom:'1px solid #F0EDE7',bgcolor:selected?.id===report.id?'#F3F0FF':'#fff','&:hover':{bgcolor:'#F8FAFC'}}}
            >
              <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:1,mb:.55}}>
                <AlexText sx={{fontSize:12,fontWeight:850,color:'#08275B'}}>{moduleLabel(report.module)} · Q{report.questionNumber}</AlexText>
                <AlexStatusChip>{report.status}</AlexStatusChip>
              </AlexBox>
              <AlexText sx={{fontSize:11.5,color:'#667085'}}>{practiceTestLabel(report.practiceTestId)} · {report.context.replace('-',' ')}</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#475467',mt:.75,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{report.message||'No note provided.'}</AlexText>
            </AlexButtonBase>)}
          </AlexBox>
        </AlexSurface>

        {selected&&<AlexBox sx={{display:'grid',gap:2,minWidth:0,alignContent:'start'}}>
          <AlexSurface sx={{p:{xs:2,md:2.5},border:'1px solid #E6E2DB',borderRadius:3}}>
            <AlexBox sx={{display:'flex',justifyContent:'space-between',gap:2,alignItems:'flex-start',flexWrap:'wrap'}}>
              <AlexBox>
                <AlexBox sx={{display:'flex',gap:.75,alignItems:'center',flexWrap:'wrap',mb:.5}}>
                  <AlexStatusChip>{selected.status}</AlexStatusChip>
                  <AlexText sx={{fontSize:12,color:'#667085'}}>{practiceTestLabel(selected.practiceTestId)} · {selected.context.replace('-',' ')} · {selected.isOwnReport?'your report':'shared report'}</AlexText>
                </AlexBox>
                <AlexText component="h2" sx={{fontSize:22,fontWeight:850,color:'#08275B'}}>{moduleLabel(selected.module)} · Q{selected.questionNumber}</AlexText>
                <AlexText sx={{fontSize:12,color:'#667085',mt:.35}}>Question ID: {selected.questionId} · Reported {new Date(selected.createdAt).toLocaleString()}</AlexText>
              </AlexBox>
              <AlexBox sx={{display:'flex',gap:.75,flexWrap:'wrap'}}>
                <AlexButton size="small" tone="secondary" onClick={()=>changeStatus(selected,selected.status==='open'?'resolved':'open')}>{selected.status==='open'?'Mark resolved':'Reopen'}</AlexButton>
                <AlexButton size="small" tone="quiet" onClick={()=>remove(selected)}>Delete</AlexButton>
              </AlexBox>
            </AlexBox>
            <AlexSurface sx={{mt:1.5,p:1.5,borderRadius:1.5,bgcolor:'#F7F6F2'}}>
              <AlexText sx={{fontSize:12,fontWeight:800,color:'#667085',mb:.4}}>Reporter note</AlexText>
              <AlexText sx={{fontSize:13.5,color:selected.message?'#344054':'#98A2B3',fontStyle:selected.message?'normal':'italic'}}>{selected.message||'No note was provided.'}</AlexText>
            </AlexSurface>
          </AlexSurface>

          {selectedQuestion?<>
            <QuestionSourceReview question={selectedQuestion} questionsPdf={questionsPdf} answersPdf={answersPdf} showExplanation revision={revision}/>
            <QuestionRepairEditor question={selectedQuestion} questionsPdf={questionsPdf} issueMessage={selected.message} onSaved={()=>setRevision(value=>value+1)}/>
          </>:<AlexSurface sx={{p:3,border:'1px solid #FDA29B',borderRadius:3,bgcolor:'#FFFBFA'}}>
            <AlexText sx={{color:'#B42318'}}>The reported question is not currently available in the Question Bank, so its source and editable content cannot be loaded.</AlexText>
          </AlexSurface>}
        </AlexBox>}
      </AlexBox>}
  </main>
}

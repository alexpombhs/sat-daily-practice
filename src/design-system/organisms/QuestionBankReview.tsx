import {useEffect,useMemo,useState} from 'react'
import {Search} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexTextField from '../atoms/AlexTextField'
import AlexText from '../atoms/AlexText'
import ParsingIssueReporter from '../molecules/ParsingIssueReporter'
import QuestionSourceReview from '../molecules/QuestionSourceReview'
import {availablePracticeTests,moduleLabel,practiceTestLabel,QUESTION_BANK} from '../../lib/questionBank'
import {groupQuestionsByPracticeTest} from '../../lib/questionBankGroups'
import {loadSharedQuestionBank,mergeQuestionBanks} from '../../lib/sharedQuestionBank'
import type {PracticeQuestion,PracticeTestFilter} from '../../types'

type Props={questionsPdf:ArrayBuffer|null}
type ModuleFilter='all'|'math1'|'math2'|'rw1'|'rw2'

function questionLabel(question:PracticeQuestion){return `${moduleLabel(question.module)} · Q${question.number}`}

export default function QuestionBankReview({questionsPdf}:Props){
  const[practiceTestFilter,setPracticeTestFilter]=useState<PracticeTestFilter>('all')
  const[moduleFilter,setModuleFilter]=useState<ModuleFilter>('all')
  const[search,setSearch]=useState('')
  const[bank,setBank]=useState<PracticeQuestion[]>(()=>QUESTION_BANK)
  const[selectedId,setSelectedId]=useState('')
  const hasQuestionsPdf=Boolean(questionsPdf?.byteLength)
  const validQuestionsPdf=hasQuestionsPdf?questionsPdf:null

  useEffect(()=>{
    let cancelled=false
    void loadSharedQuestionBank().then(shared=>{
      if(!cancelled)setBank(mergeQuestionBanks(QUESTION_BANK,shared))
    }).catch(error=>console.warn('Shared Question Bank load failed; using bundled metadata.',error))
    return()=>{cancelled=true}
  },[])

  const questions=useMemo(()=>{
    const needle=search.trim().toLowerCase()
    return bank.filter(question=>{
      if(practiceTestFilter!=='all'&&question.practiceTestId!==practiceTestFilter)return false
      if(moduleFilter!=='all'&&question.module!==moduleFilter)return false
      if(!needle)return true
      return question.id.toLowerCase().includes(needle)||questionLabel(question).toLowerCase().includes(needle)||String(question.number)===needle
    })
  },[bank,practiceTestFilter,moduleFilter,search])

  const groupedPracticeTests=useMemo(()=>groupQuestionsByPracticeTest(questions),[questions])
  useEffect(()=>{
    if(questions.length&&!questions.some(question=>question.id===selectedId))setSelectedId(questions[0].id)
  },[questions,selectedId])
  const practiceTestOptions=[{value:'all' as const,label:'All practice tests'},...availablePracticeTests(bank).map(value=>({value,label:practiceTestLabel(value)}))]
  const selected=questions.find(question=>question.id===selectedId)??questions[0]
  const questionOptions=questions.map(question=>({value:question.id,label:`${practiceTestLabel(question.practiceTestId)} · ${moduleLabel(question.module)} · Q${question.number}`}))

  return <main className="question-bank-page">
    <header className="question-bank-heading">
      <div className="question-bank-heading-copy">
        <p className="eyebrow">Question Bank</p>
        <h1>Review source questions</h1>
      </div>
      <div className="question-bank-filters">
        <div className="question-bank-filter-practice-test">
          <AlexDropdown id="question-bank-practice-test" label="Practice test" value={practiceTestFilter} options={practiceTestOptions} onChange={setPracticeTestFilter}/>
        </div>
        <div className="question-bank-filter-module">
          <AlexDropdown id="question-bank-module" label="Module" value={moduleFilter} options={[
            {value:'all',label:'All modules'},
            {value:'math1',label:'Math · Module 1'},
            {value:'math2',label:'Math · Module 2'},
            {value:'rw1',label:'Reading & Writing · Module 1'},
            {value:'rw2',label:'Reading & Writing · Module 2'},
          ]} onChange={value=>setModuleFilter(value as ModuleFilter)}/>
        </div>
        <div className="question-bank-search"><Search size={17}/><AlexTextField value={search} onChange={event=>setSearch(event.target.value)} placeholder="Find question"/></div>
      </div>
    </header>

    {questions.length>0&&<div className="question-bank-mobile-selector">
      <AlexDropdown
        id="question-bank-question"
        label="Question"
        value={selected?.id??questions[0].id}
        options={questionOptions}
        onChange={setSelectedId}
      />
    </div>}

    <div className="question-bank-workspace">
      <aside className="question-bank-list" aria-label="Questions">
        <div className="question-bank-list-header"><b>{questions.length} questions</b><span>Select a question</span></div>
        <div className="question-bank-list-scroll">
          {groupedPracticeTests.map(testGroup=><section className="question-bank-test-group" key={testGroup.practiceTestId}>
            <div className="question-bank-group-title"><span>{practiceTestLabel(testGroup.practiceTestId)}</span><small>{testGroup.items.length}</small></div>
            {testGroup.modules.map(group=><section className="question-bank-group" key={`${testGroup.practiceTestId}-${group.module}`}>
              <div className="question-bank-group-title"><span>{moduleLabel(group.module)}</span><small>{group.items.length}</small></div>
              <div className="question-bank-group-items">{group.items.map(question=><AlexButtonBase
                key={question.id}
                className={question.id===selected?.id?'question-bank-row active':'question-bank-row'}
                onClick={()=>setSelectedId(question.id)}
                aria-pressed={question.id===selected?.id}
                aria-label={`${practiceTestLabel(question.practiceTestId)} ${moduleLabel(question.module)} Question ${question.number}`}
              ><span>Question {question.number}</span></AlexButtonBase>)}</div>
            </section>)}
          </section>)}
          {!questions.length&&<p className="question-bank-no-results">No questions match this filter.</p>}
        </div>
      </aside>

      {selected&&<section className="question-bank-viewer">
        <div className="question-bank-viewer-header">
          <div><span>{practiceTestLabel(selected.practiceTestId)} · {selected.subject==='math'?'Math':'Reading & Writing'}</span><AlexBox sx={{display:'flex',alignItems:'center',gap:.75}}><h2>{questionLabel(selected)}</h2><ParsingIssueReporter question={selected} context="question-bank" compact/></AlexBox></div>
          <AlexText component="span" sx={{fontSize:12,color:'#667085'}}>{hasQuestionsPdf?`PDF page ${selected.sourcePage}`:'Shared bank'}</AlexText>
        </div>
        <QuestionSourceReview question={selected} questionsPdf={validQuestionsPdf} showExplanation/>
      </section>}
    </div>
  </main>
}

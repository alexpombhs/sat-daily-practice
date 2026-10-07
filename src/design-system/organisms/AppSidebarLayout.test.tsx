import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import AppSidebarLayout from './AppSidebarLayout'

const baseProps={
  active:'practice-setup' as const,
  collapsed:false,
  onToggleCollapsed:()=>undefined,
  onDashboard:()=>undefined,
  onPracticeTests:()=>undefined,
  onPracticeSetup:()=>undefined,
  onVocabulary:()=>undefined,
  onQuestionBank:()=>undefined,
  onParsingIssues:()=>undefined,
  onPerformance:()=>undefined,
  onResources:()=>undefined,
  onSettings:()=>undefined,
}

describe('AppSidebarLayout',()=>{
  it('keeps Practice Setup and Question Bank as separate destinations',()=>{
    const onPracticeSetup=vi.fn()
    const onQuestionBank=vi.fn()

    render(
      <AppSidebarLayout
        {...baseProps}
        onPracticeSetup={onPracticeSetup}
        onQuestionBank={onQuestionBank}
      >
        <div>Practice setup content</div>
      </AppSidebarLayout>,
    )

    const practiceSetup=screen.getAllByRole('button',{name:'Practice Setup'})[0]
    const questionBank=screen.getAllByRole('button',{name:'Question Bank'})[0]

    fireEvent.click(practiceSetup)
    fireEvent.click(questionBank)

    expect(onPracticeSetup).toHaveBeenCalledTimes(1)
    expect(onQuestionBank).toHaveBeenCalledTimes(1)
  })

  it('renders phone navigation and a viewport-safe content wrapper',()=>{
    render(
      <AppSidebarLayout {...baseProps}>
        <div>Responsive content</div>
      </AppSidebarLayout>,
    )

    expect(screen.getByTestId('mobile-header')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument()
    expect(screen.getAllByRole('button',{name:'Dashboard'}).length).toBeGreaterThan(0)
    expect(screen.getByRole('button',{name:'Tests'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Stats'})).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Menu'})).toBeInTheDocument()

    expect(screen.getByTestId('app-layout')).toHaveStyle({
      width:'100%',
      maxWidth:'100vw',
    })
    expect(screen.getByTestId('app-content')).toBeInTheDocument()
    expect(screen.getByText('Responsive content')).toBeInTheDocument()
  })

  it('opens the mobile navigation drawer',()=>{
    render(
      <AppSidebarLayout {...baseProps}>
        <div>Responsive content</div>
      </AppSidebarLayout>,
    )

    fireEvent.click(screen.getByRole('button',{name:'Open navigation'}))
    expect(screen.getByRole('button',{name:'Close navigation'})).toBeInTheDocument()
  })
})

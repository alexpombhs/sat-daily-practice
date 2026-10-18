import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import AppSidebarLayout from './AppSidebarLayout'

const baseProps={
  active:'practice' as const,
  collapsed:false,
  onToggleCollapsed:()=>undefined,
  onDashboard:()=>undefined,
  onPractice:()=>undefined,
  onVocabulary:()=>undefined,
  onQuestionBank:()=>undefined,
  onParsingIssues:()=>undefined,
  onPerformance:()=>undefined,
  onResources:()=>undefined,
  onSettings:()=>undefined,
}

describe('AppSidebarLayout',()=>{
  it('uses one Practice destination in the navigation',()=>{
    const onPractice=vi.fn()
    const onQuestionBank=vi.fn()

    render(
      <AppSidebarLayout
        {...baseProps}
        onPractice={onPractice}
        onQuestionBank={onQuestionBank}
      >
        <div>Practice content</div>
      </AppSidebarLayout>,
    )

    const practice=screen.getAllByRole('button',{name:'Practice'})[0]
    const questionBank=screen.getAllByRole('button',{name:'Question Bank'})[0]

    fireEvent.click(practice)
    fireEvent.click(questionBank)

    expect(onPractice).toHaveBeenCalledTimes(1)
    expect(onQuestionBank).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button',{name:'Practice Setup'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Practice Tests'})).not.toBeInTheDocument()
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
    expect(screen.getAllByRole('button',{name:'Practice'}).length).toBeGreaterThan(0)
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

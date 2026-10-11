import {BookOpenCheck,CalendarDays,Sparkles,Target} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexInfoTooltipButton from '../atoms/AlexInfoTooltipButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import DashboardCard from '../molecules/DashboardCard'
import {dashboardTypography} from '../theme'

type Props={
  accuracy:number|null
  estimatedScore:number|null
  scoreBreakdown:{english:{score:number;probability:number;questions:number}|null;math:{score:number;probability:number;questions:number}|null;change:number|null}|null
  nationalMeritChance:number|null
  projectedSelectionIndex:number|null
  estimateConfidence:{label:string;within80:number;sigmaPoints:number}|null
  targetScore:number|null
  daysRemaining:number
  questionsPerSession:number
  onChoosePracticeTest:()=>void
  onStartPractice:()=>void
}

export default function StudyPlanHero({
  accuracy,estimatedScore,scoreBreakdown,nationalMeritChance,projectedSelectionIndex,estimateConfidence,targetScore,daysRemaining,questionsPerSession,
  onChoosePracticeTest,onStartPractice,
}:Props){
  return <AlexSurface
    sx={{
      position:'relative',overflow:'hidden',border:'1px solid #D9E7F8',
      bgcolor:'#EAF3FF',boxShadow:'0 10px 30px rgba(9,35,79,.055)',
      p:0,display:'grid',gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'var(--dashboard-columns)'},
      gap:{xs:1.25,sm:1.5,lg:'var(--dashboard-column-gap)'},alignItems:'stretch',height:{xs:'auto',lg:'100%'},minHeight:0,
    }}
  >
    <AlexBox sx={{position:'relative',zIndex:1,p:{xs:1.1,sm:1.3,md:1.45,lg:1.6},display:'flex',flexDirection:'column',justifyContent:'center',minWidth:0,maxWidth:'100%',overflow:'hidden'}}>
      <AlexText sx={{fontSize:dashboardTypography.eyebrow,textTransform:'uppercase',letterSpacing:'.12em',fontWeight:850,color:'#245F9E'}}>Study plan</AlexText>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:dashboardTypography.heroTitle,lineHeight:1.04,letterSpacing:'-.035em',mt:1,mb:1.5,color:'#08275B'}}>
        Your SAT practice plan
      </AlexText>
      <AlexText sx={{color:'#3F5E86',fontSize:dashboardTypography.heroBody,lineHeight:1.6,maxWidth:650}}>
        Keep your goal in view, focus on the questions that need attention, and make steady progress without overloading each day.
      </AlexText>

      <AlexBox sx={{display:'flex',gap:1,flexWrap:'wrap',mt:{xs:.55,sm:.7,lg:.8},flexDirection:{xs:'column',sm:'row'}}}>
        <AlexButton fullWidth onClick={onChoosePracticeTest} sx={{width:{xs:'100%',sm:'auto'}}}>Choose a practice test</AlexButton>
        <AlexButton fullWidth tone="secondary" onClick={onStartPractice} sx={{width:{xs:'100%',sm:'auto'}}}>Start {questionsPerSession} questions</AlexButton>
      </AlexBox>

    </AlexBox>

    <AlexBox sx={{
      display:'grid',
      gridTemplateRows:{xs:'auto auto',lg:'minmax(0,1fr) minmax(0,.78fr)'},
      gap:{xs:.75,sm:1},
      position:'relative',
      zIndex:1,
      minHeight:0,
      height:{xs:'auto',lg:'100%'},
      p:{xs:1.1,sm:1.3,lg:1.2},
      minWidth:0,maxWidth:'100%',overflow:'hidden',
    }}>
      <DashboardCard
        tone="yellow"
        variant="hero"
        title="Current estimate"
        value={estimatedScore??'—'}
        valueFontSize={dashboardTypography.metricValue}
        valueTrailing={<AlexBox sx={{display:'inline-flex','@media (min-width:1600px)':{display:'none'}}}>
          <AlexInfoTooltipButton
            label="Score estimate information"
            title={<>
              <b>Score calculation</b><br/>
              {scoreBreakdown?.english&&scoreBreakdown.math?<>
                Reading &amp; Writing: {scoreBreakdown.english.score} ({scoreBreakdown.english.probability}% estimated correct across {scoreBreakdown.english.questions} recent distinct questions).<br/>
                Math: {scoreBreakdown.math.score} ({scoreBreakdown.math.probability}% estimated correct across {scoreBreakdown.math.questions} recent distinct questions).<br/>
                Total: {estimatedScore}. Each question’s probability incorporates its earlier answers, weighted toward more recent attempts.<br/>
                {scoreBreakdown.change!==null&&<>Change since previous completed session: {scoreBreakdown.change>0?'+':''}{scoreBreakdown.change} points.<br/></>}
              </>:<>Complete questions in both sections to see a breakdown.<br/></>}
              <br/><b>National Merit outlook</b><br/>
              {nationalMeritChance!==null
                ?`${nationalMeritChance}% estimated qualifying outlook${projectedSelectionIndex!==null?` · projected Selection Index ~${projectedSelectionIndex}`:''}.`
                :'The National Merit outlook is still calibrating.'}
              <br/><br/>
              {estimateConfidence&&<>
                <b>Estimate confidence</b><br/>
                {estimateConfidence.label} estimate confidence · {estimateConfidence.within80}% within ±80 points. This combines recent question-pool uncertainty, score stability, and SAT measurement error. It is a model estimate, not a guarantee.
              </>}
              <br/><br/>
              <b>PSAT/NMSQT scholarship context</b><br/>
              National Merit uses Selection Index = (2 × Reading & Writing + Math) ÷ 10, on a 48–228 scale. The Massachusetts cutoff varies by year, and a Merit Scholarship is not determined by score alone.
            </>}
          />
        </AlexBox>}
        subtitle={<AlexBox sx={{minWidth:0,pr:{xs:7,sm:8}}}>
          <AlexBox sx={{display:'flex',flexWrap:'wrap',alignItems:'center',columnGap:{xs:1,sm:1.5},rowGap:.25,mb:.3}}>
            <AlexText sx={{fontSize:'inherit',fontWeight:800,color:'inherit',whiteSpace:'nowrap'}}>
              Reading &amp; Writing {estimatedScore!==null&&scoreBreakdown?.english?scoreBreakdown.english.score:'—'}
            </AlexText>
            <AlexText sx={{fontSize:'inherit',fontWeight:800,color:'inherit',whiteSpace:'nowrap'}}>
              Math {estimatedScore!==null&&scoreBreakdown?.math?scoreBreakdown.math.score:'—'}
            </AlexText>
          </AlexBox>
          <AlexText sx={{fontSize:'inherit',color:'inherit',minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {nationalMeritChance!==null
              ?`${nationalMeritChance}% National Merit outlook${projectedSelectionIndex!==null?` · SI ~${projectedSelectionIndex}`:''}`
              :accuracy!==null?'Calibrating National Merit outlook':'Complete a few questions to calibrate'}
          </AlexText>
          {estimateConfidence&&<AlexText sx={{
            display:'none',
            '@media (min-width:1600px)':{display:'block'},
            mt:.25,
            fontSize:'inherit',
            fontWeight:750,
            color:'inherit',
            whiteSpace:'nowrap',
          }}>
            {estimateConfidence.label} estimate confidence · {estimateConfidence.within80}% within ±80
          </AlexText>}
        </AlexBox>}
        decoration={<>
          <AlexBox sx={{
            position:'absolute',
            right:{xs:10,sm:14},
            top:'50%',
            width:{xs:64,sm:76},
            height:{xs:64,sm:76},
            borderRadius:'50%',
            bgcolor:'#D9ECFF',
            display:'grid',
            placeItems:'center',
            transform:'translateY(-50%) rotate(-6deg)',
          }}>
            <BookOpenCheck size={34} strokeWidth={1.6}/>
          </AlexBox>
          <Sparkles size={20} style={{position:'absolute',right:112,top:24}}/>
        </>}
        sx={{pr:{xs:9,sm:11}}}
      />

      <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:{xs:.75,sm:1},minHeight:0,height:{lg:'100%'},minWidth:0,maxWidth:'100%'}}>
        <DashboardCard
          tone="green"
          variant="compact"
          icon={<Target/>}
          title="Goal score"
          value={targetScore??'—'}
          valueFontSize={dashboardTypography.metricValue}
          sx={{justifyContent:'center'}}
        />
        <DashboardCard
          tone="lavender"
          variant="compact"
          icon={<CalendarDays/>}
          title="Days until exam"
          value={daysRemaining}
          valueFontSize={dashboardTypography.metricValue}
          sx={{justifyContent:'center'}}
        />
      </AlexBox>
    </AlexBox>

    <AlexBox sx={{position:'absolute',width:180,height:180,borderRadius:'50%',bgcolor:'rgba(255,255,255,.34)',right:-70,top:-70}}/>
    <AlexBox sx={{position:'absolute',width:90,height:90,borderRadius:'50%',bgcolor:'rgba(178,219,255,.32)',left:'54%',bottom:-38}}/>
  </AlexSurface>
}

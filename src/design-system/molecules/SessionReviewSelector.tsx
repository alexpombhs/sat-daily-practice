import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexText from '../atoms/AlexText'

type Option={value:string;label:string}

type Props={
  value:string
  options:Option[]
  onChange:(value:string)=>void
  onReview:()=>void
}

export default function SessionReviewSelector({value,options,onChange,onReview}:Props){
  return <AlexBox
    sx={{
      display:'grid',
      gridTemplateColumns:{xs:'1fr',md:'minmax(0,1fr) minmax(280px,360px)'},
      gap:{xs:1.25,md:4},
      alignItems:'center',
      py:{xs:1.5,md:1.75},
      minWidth:0,
    }}
  >
    <AlexBox sx={{minWidth:0}}>
      <AlexText component="div" sx={{fontWeight:800,color:'#08275B',fontSize:15}}>
        Review a past session
      </AlexText>
      <AlexText component="div" sx={{mt:.5,color:'#667085',fontSize:13,lineHeight:1.5}}>
        Choose any completed session to reopen it in read-only review.
      </AlexText>
    </AlexBox>
    <AlexBox
      sx={{
        display:'grid',
        gridTemplateColumns:{xs:'1fr',sm:'minmax(0,1fr) 110px'},
        gap:1,
        alignItems:'center',
        minWidth:0,
        width:'100%',
      }}
    >
      <AlexDropdown
        id="practice-session-review"
        label="Completed session"
        value={value}
        options={options}
        onChange={onChange}
      />
      <AlexButton
        tone="secondary"
        disabled={!value}
        onClick={onReview}
        sx={{width:'100%'}}
      >
        Review
      </AlexButton>
    </AlexBox>
  </AlexBox>
}

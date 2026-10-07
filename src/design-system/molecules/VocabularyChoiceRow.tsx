import AlexBox from '../atoms/AlexBox'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexText from '../atoms/AlexText'

type Props={
  label:string
  selected:boolean
  disabled?:boolean
  onClick:()=>void
}

export default function VocabularyChoiceRow({label,selected,disabled=false,onClick}:Props){
  return <AlexButtonBase
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    sx={{
      width:'100%',
      minHeight:{xs:44,sm:46},
      px:{xs:1.5,sm:1.75},
      py:{xs:1.05,sm:1.15},
      border:'1px solid',
      borderColor:selected?'#0B376D':'#D9DEE7',
      borderRadius:'8px',
      bgcolor:selected?'#F1F6FC':'#FFFFFF',
      color:'#08275B',
      justifyContent:'flex-start',
      textAlign:'left',
      transition:'background-color .15s ease,border-color .15s ease',
      '&:hover':{bgcolor:selected?'#EDF4FC':'#F8FAFC',borderColor:'#9AA9BC'},
      '&.Mui-disabled':{opacity:disabled&&!selected?.58:1,color:'#667085'},
    }}
  >
    <AlexBox sx={{minWidth:0,width:'100%'}}>
      <AlexText component="span" sx={{
        display:'block',
        fontSize:{xs:14,sm:14},
        lineHeight:1.5,
        fontWeight:selected?600:500,
        letterSpacing:0,
        color:'inherit',
      }}>{label}</AlexText>
    </AlexBox>
  </AlexButtonBase>
}

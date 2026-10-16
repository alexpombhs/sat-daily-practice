import {Dialog,DialogActions,DialogContent,DialogTitle,type DialogProps} from '@mui/material'
import AlexButton from './AlexButton'

export type AlexConfirmDialogProps={
  open:boolean
  title:string
  description:string
  confirmLabel?:string
  cancelLabel?:string
  busy?:boolean
  onConfirm:()=>void
  onCancel:()=>void
  maxWidth?:DialogProps['maxWidth']
}

export default function AlexConfirmDialog({open,title,description,confirmLabel='Continue',cancelLabel='Cancel',busy=false,onConfirm,onCancel,maxWidth='xs'}:AlexConfirmDialogProps){
  return <Dialog open={open} onClose={busy?undefined:onCancel} fullWidth maxWidth={maxWidth} aria-labelledby="alex-confirm-title"
    PaperProps={{sx:{borderRadius:2.5,p:1,border:'1px solid #E1E8F1',boxShadow:'0 14px 48px rgba(9,35,79,.16)'}}}>
    <DialogTitle id="alex-confirm-title" sx={{fontWeight:850,color:'#08275B',pb:1}}>{title}</DialogTitle>
    <DialogContent sx={{color:'#435772',fontSize:14}}>{description}</DialogContent>
    <DialogActions sx={{px:2.5,pb:2,gap:1}}>
      <AlexButton tone="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</AlexButton>
      <AlexButton onClick={onConfirm} disabled={busy}>{confirmLabel}</AlexButton>
    </DialogActions>
  </Dialog>
}

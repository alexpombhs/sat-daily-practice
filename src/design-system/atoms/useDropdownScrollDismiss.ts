import {useEffect,useRef,useState} from 'react'

/**
 * MUI Select renders its menu in a portal. When an ancestor scrolls,
 * update the Popover position so the menu follows its trigger instead
 * of remaining behind or closing unexpectedly.
 */
export default function useDropdownScrollDismiss(){
  const [open,setOpen]=useState(false)
  const menuPaperRef=useRef<HTMLDivElement|null>(null)
  const popoverActionRef=useRef<{updatePosition:()=>void}|null>(null)

  useEffect(()=>{
    if(!open)return
    let frame=0
    const updatePosition=()=>{
      if(frame)return
      frame=window.requestAnimationFrame(()=>{
        frame=0
        popoverActionRef.current?.updatePosition()
      })
    }
    const handleScroll=(event:Event)=>{
      const target=event.target
      // Scrolling through the menu's own options should not move it.
      if(target instanceof Node&&menuPaperRef.current?.contains(target))return
      updatePosition()
    }

    // Capture catches scrolls in nested containers (scroll doesn't bubble).
    window.addEventListener('scroll',handleScroll,true)
    window.addEventListener('resize',updatePosition)
    return ()=>{
      window.removeEventListener('scroll',handleScroll,true)
      window.removeEventListener('resize',updatePosition)
      if(frame)window.cancelAnimationFrame(frame)
    }
  },[open])

  return {open,onOpen:()=>setOpen(true),onClose:()=>setOpen(false),menuPaperRef,popoverActionRef}
}

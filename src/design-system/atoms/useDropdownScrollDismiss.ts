import {useEffect,useRef,useState} from 'react'

/**
 * MUI Select menus are portaled. A nested page scroll can move the select
 * without moving the open menu, leaving it visually detached.
 * Dismiss on an outside scroll, but keep scrolling inside the menu usable.
 */
export default function useDropdownScrollDismiss(){
  const [open,setOpen]=useState(false)
  const menuPaperRef=useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if(!open)return
    const handleScroll=(event:Event)=>{
      const target=event.target
      if(target instanceof Node&&menuPaperRef.current?.contains(target))return
      setOpen(false)
    }
    // Scroll events don't bubble, so capture scrolling in nested containers.
    window.addEventListener('scroll',handleScroll,true)
    return ()=>window.removeEventListener('scroll',handleScroll,true)
  },[open])

  return {open,onOpen:()=>setOpen(true),onClose:()=>setOpen(false),menuPaperRef}
}

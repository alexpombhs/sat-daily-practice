export type AppRouteView='study'|'home'|'practice'|'results'|'stats'|'settings'|'vocabulary'|'sources'|'question-bank'|'parsing-issues'|'account'

const VIEW_TO_SEGMENT:Record<AppRouteView,string>={
  study:'dashboard',
  home:'practice-tests',
  practice:'practice/session',
  results:'practice/results',
  stats:'performance',
  settings:'practice-setup',
  vocabulary:'vocabulary',
  sources:'resources',
  'question-bank':'question-bank',
  'parsing-issues':'parsing-issues',
  account:'account',
}

const SEGMENT_TO_VIEW=new Map(Object.entries(VIEW_TO_SEGMENT).map(([view,segment])=>[segment,view as AppRouteView]))

export function appBasePath(){
  return (import.meta.env.BASE_URL||'/').replace(/\/$/,'')
}

export function pathForView(view:AppRouteView){
  const base=appBasePath()
  return `${base}/${VIEW_TO_SEGMENT[view]}`
}

export function viewFromPathname(pathname:string):AppRouteView{
  const base=appBasePath()
  let relative=pathname
  if(base&&relative.startsWith(base))relative=relative.slice(base.length)
  relative=relative.replace(/^\/+|\/+$/g,'')
  if(!relative)return 'study'
  return SEGMENT_TO_VIEW.get(relative)??'study'
}

export function canonicalPathname(pathname:string){
  return pathForView(viewFromPathname(pathname))
}

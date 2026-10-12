export type CanonicalGraphic={
  title:string
  labels:string[]
  values:number[]
  kind:'bar'|'line'|'scatter'
  xLabel?:string
  yLabel?:string
}
export default function OriginalPT1Graph({graph}:{graph:CanonicalGraphic|null|undefined}){
  if(!graph||!['bar','line','scatter'].includes(graph.kind)||!graph.values?.length||graph.labels.length!==graph.values.length)return null
  if(graph.values.some(value=>!Number.isFinite(value)))return null
  const left=60,top=38,width=460,height=210
  const max=graph.kind==='scatter'?90:Math.ceil(Math.max(...graph.values)/10)*10
  const min=graph.kind==='scatter'?50:0
  const y=(v:number)=>top+height-(v-min)/(max-min)*height
  const x=(i:number)=>left+(i+0.5)*width/graph.values.length
  const pts=graph.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')
  return <figure style={{margin:'14px auto',maxWidth:600}}>
    <svg viewBox="0 0 590 320" role="img" aria-label={`${graph.title}: ${graph.labels.map((label,i)=>`${label}, ${graph.values[i]}`).join('; ')}`} style={{width:'100%',height:'auto',display:'block'}}>
      <text x="295" y="22" textAnchor="middle" fontSize="17" fontWeight="600" fill="currentColor">{graph.title}</text>
      {Array.from({length:5},(_,i)=>{const v=min+(max-min)*i/4;return <g key={i}><line x1={left} y1={y(v)} x2={left+width} y2={y(v)} stroke="#d5dce8"/><text x={left-12} y={y(v)+5} textAnchor="end" fontSize="13" fill="currentColor">{Number.isInteger(v)?v:v.toFixed(1)}</text></g>})}
      <line x1={left} x2={left} y1={top} y2={top+height} stroke="#52647e"/>
      <line x1={left} x2={left+width} y1={top+height} y2={top+height} stroke="#52647e"/>
      {graph.kind==='bar'&&graph.values.map((v,i)=><rect key={i} x={x(i)-25} y={y(v)} width={50} height={top+height-y(v)} rx={2} fill="#417cb4"/>)}
      {graph.kind==='line'&&<polyline points={pts} fill="none" stroke="#417cb4" strokeWidth={3}/>}
      {graph.kind!=='bar'&&graph.values.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={5} fill="#275e92"/>)}
      {graph.labels.map((label,i)=><text key={i} x={x(i)} y={top+height+21} textAnchor="middle" fontSize="12" fill="currentColor">{label}</text>)}
      {graph.xLabel&&<text x="290" y="307" fontSize="13" textAnchor="middle" fill="currentColor">{graph.xLabel}</text>}
      {graph.yLabel&&<text x="15" y="144" textAnchor="middle" fontSize="13" fill="currentColor" transform="rotate(-90 15 144)">{graph.yLabel}</text>}
    </svg>
  </figure>
}

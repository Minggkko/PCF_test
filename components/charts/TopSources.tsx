'use client'

interface ActivityResult {
  activityType: string
  description: string
  co2e: number
  scope: string
}

interface Props {
  activities: ActivityResult[]
  total: number
}

const COLORS: Record<string, string> = {
  원소재: '#89986D',
  운송: '#C5D89D',
  전기: '#9CAB84',
}

export default function TopSources({ activities, total }: Props) {
  // 설명별 합산
  const grouped = activities.reduce((acc, a) => {
    const key = `${a.activityType} · ${a.description}`
    if (!acc[key]) acc[key] = { activityType: a.activityType, description: a.description, co2e: 0, scope: a.scope }
    acc[key].co2e += a.co2e
    return acc
  }, {} as Record<string, any>)

  const top5 = Object.entries(grouped)
    .sort((a, b) => b[1].co2e - a[1].co2e)
    .slice(0, 5)

  const maxVal = top5[0]?.[1].co2e ?? 1

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>배출원 Top 5</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'16px' }}>항목별 누적 배출량 기준</div>

      {top5.map(([key, val], i) => (
        <div key={key} style={{ marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'5px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ fontSize:'11px', fontWeight:'500', color:'#aaa', width:'16px' }}>#{i+1}</span>
              <span style={{ width:'8px', height:'8px', borderRadius:'2px', background: COLORS[val.activityType] ?? '#ccc', display:'inline-block', flexShrink:0 }} />
              <span style={{ fontSize:'12px', color:'#333' }}>{key}</span>
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'baseline' }}>
              <span style={{ fontSize:'12px', fontWeight:'500', color:'#333' }}>{Math.round(val.co2e).toLocaleString()} kg</span>
              <span style={{ fontSize:'10px', color:'#aaa' }}>{total > 0 ? Math.round(val.co2e / total * 100) : 0}%</span>
            </div>
          </div>
          <div style={{ background:'#f0f0f0', borderRadius:'4px', height:'7px', overflow:'hidden' }}>
            <div style={{
              width:`${Math.round(val.co2e / maxVal * 100)}%`,
              height:'100%',
              background: COLORS[val.activityType] ?? '#ccc',
              borderRadius:'4px',
              transition:'width 0.5s ease'
            }} />
          </div>
          <div style={{ fontSize:'10px', color:'#bbb', marginTop:'3px' }}>
            {val.scope === 'scope2' ? 'Scope 2 간접' : 'Scope 3 업스트림'}
          </div>
        </div>
      ))}
    </div>
  )
}

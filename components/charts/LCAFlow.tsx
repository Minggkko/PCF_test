'use client'

interface ScopeSummary {
  scope: string
  label: string
  co2e: number
  percentage: number
}

interface Props {
  scopeData: ScopeSummary[]
  total: number
}

export default function LCAFlow({ scopeData, total }: Props) {
  const scope3 = scopeData.find(s => s.scope === 'scope3_upstream')
  const scope2 = scopeData.find(s => s.scope === 'scope2')

  const stages = [
    {
      step: '01',
      title: '원자재 조달',
      subtitle: 'Raw Material',
      scope: 'Scope 3 업스트림',
      co2e: scope3 ? Math.round(scope3.co2e * 0.75 * 10) / 10 : 0,
      color: '#89986D',
      bg: '#f0f3eb',
      icon: '🪨',
      desc: '플라스틱 원소재 구매',
    },
    {
      step: '02',
      title: '제조 · 에너지',
      subtitle: 'Manufacturing',
      scope: 'Scope 2 간접',
      co2e: scope2?.co2e ?? 0,
      color: '#9CAB84',
      bg: '#f2f5ef',
      icon: '⚡',
      desc: '한국전력 구매 전력',
    },
    {
      step: '03',
      title: '운송 · 물류',
      subtitle: 'Transport',
      scope: 'Scope 3 업스트림',
      co2e: scope3 ? Math.round(scope3.co2e * 0.25 * 10) / 10 : 0,
      color: '#C5D89D',
      bg: '#f6f9f1',
      icon: '🚛',
      desc: '트럭 운송',
    },
    {
      step: '04',
      title: '사용 단계',
      subtitle: 'Use Phase',
      scope: 'Scope 3 다운스트림',
      co2e: 0,
      color: '#ddd',
      bg: '#f9f9f9',
      icon: '📦',
      desc: '데이터 미입력',
    },
    {
      step: '05',
      title: '폐기 · 처리',
      subtitle: 'End of Life',
      scope: 'Scope 3 다운스트림',
      co2e: 0,
      color: '#ddd',
      bg: '#f9f9f9',
      icon: '♻️',
      desc: '데이터 미입력',
    },
  ]

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>PCF 전과정 (LCA) 흐름</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'20px' }}>원자재 조달 → 제조 → 운송 → 사용 → 폐기 전 단계 배출량</div>

      <div style={{ display:'flex', alignItems:'stretch', gap:'0', overflowX:'auto', paddingBottom:'8px' }}>
        {stages.map((s, i) => (
          <div key={s.step} style={{ display:'flex', alignItems:'center', flex:1, minWidth:'120px' }}>
            <div style={{
              flex:1,
              background: s.bg,
              borderRadius:'10px',
              padding:'14px 12px',
              border: s.co2e > 0 ? `1.5px solid ${s.color}` : '1.5px solid #eee',
              position:'relative',
            }}>
              <div style={{ fontSize:'18px', marginBottom:'6px' }}>{s.icon}</div>
              <div style={{ fontSize:'10px', color:'#aaa', marginBottom:'2px' }}>{s.step}</div>
              <div style={{ fontSize:'12px', fontWeight:'500', color: s.co2e > 0 ? '#333' : '#bbb', marginBottom:'2px' }}>{s.title}</div>
              <div style={{ fontSize:'10px', color:'#aaa', marginBottom:'8px' }}>{s.subtitle}</div>
              <div style={{ fontSize:'13px', fontWeight:'500', color: s.co2e > 0 ? s.color : '#ccc' }}>
                {s.co2e > 0 ? `${s.co2e.toLocaleString()}` : '—'}
              </div>
              <div style={{ fontSize:'10px', color:'#aaa' }}>
                {s.co2e > 0 ? 'kgCO₂e' : '미입력'}
              </div>
              <div style={{ marginTop:'6px', fontSize:'10px', padding:'2px 6px', borderRadius:'3px',
                background: s.co2e > 0 ? '#F6F0D7' : '#f0f0f0',
                color: s.co2e > 0 ? '#89986D' : '#ccc',
                display:'inline-block' }}>
                {s.scope}
              </div>
              <div style={{ fontSize:'10px', color:'#bbb', marginTop:'4px' }}>{s.desc}</div>
              {s.co2e > 0 && total > 0 && (
                <div style={{ marginTop:'8px', background:'#e8e8e8', borderRadius:'3px', height:'4px', overflow:'hidden' }}>
                  <div style={{ width:`${Math.round(s.co2e / total * 100)}%`, height:'100%', background:s.color, borderRadius:'3px' }} />
                </div>
              )}
            </div>
            {i < stages.length - 1 && (
              <div style={{ fontSize:'16px', color:'#ccc', padding:'0 4px', flexShrink:0 }}>→</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop:'14px', padding:'10px 14px', background:'#F6F0D7', borderRadius:'8px', fontSize:'11px', color:'#89986D', lineHeight:'1.7' }}>
        <strong>총 PCF</strong>: {total.toLocaleString()} kgCO₂e &nbsp;|&nbsp;
        사용·폐기 단계는 현재 데이터 미입력 상태입니다. 데이터 입력 시 자동 반영됩니다.
      </div>
    </div>
  )
}

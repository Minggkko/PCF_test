'use client'

interface ScopeSummary {
  scope: string
  label: string
  description: string
  co2e: number
  percentage: number
}

interface Props {
  data: ScopeSummary[]
}

export default function ScopeBreakdown({ data }: Props) {
  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>GHG Scope별 배출 비중</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'20px' }}>GHG Protocol 기준 분류</div>
      {data.map(s => (
        <div key={s.scope} style={{ marginBottom:'18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'5px' }}>
            <span style={{ fontSize:'12px', fontWeight:'500' }}>{s.label}</span>
            <span style={{ fontSize:'11px', color:'#888' }}>{s.co2e.toLocaleString()} kg · {s.percentage}%</span>
          </div>
          <div style={{ background:'#f0f0f0', borderRadius:'4px', height:'8px', overflow:'hidden' }}>
            <div style={{
              background: s.scope === 'scope2' ? '#B5E18B' : '#B5E18B',
              width:`${s.percentage}%`,
              height:'100%',
              borderRadius:'4px',
              transition:'width 0.6s ease'
            }} />
          </div>
          <div style={{ fontSize:'11px', color:'#bbb', marginTop:'4px' }}>{s.description}</div>
        </div>
      ))}

      <div style={{ marginTop:'16px', padding:'10px 14px', background:'#EEFABD', borderRadius:'8px' }}>
        <div style={{ fontSize:'11px', color:'#263B6A', lineHeight:'1.8' }}>
          <strong>계산 기준</strong><br/>
          활동량 × 배출계수 = kgCO₂e · GHG Protocol Product Standard<br/>
          배출계수는 emission_factors 테이블에서 동적 조회
        </div>
      </div>
    </div>
  )
}

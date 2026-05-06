'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const COLORS = {
  전기: '#A77F60',
  원소재: '#8A5F41',
  운송: '#CCD67F',
}

const SCOPE_COLOR: Record<string, string> = {
  scope2: '#F3E4C9',
  scope3_upstream: '#8A5F41',
}

const SCOPE_TEXT: Record<string, string> = {
  scope2: '#6b4a2a',
  scope3_upstream: '#F3E4C9',
}

interface ActivityResult {
  id: number
  date: string
  activityType: string
  description: string
  amount: number
  unit: string
  factor: number
  factorUnit: string
  co2e: number
  scope: string
}

interface MonthData {
  month: string
  results: ActivityResult[]
  total: number
}

export default function MonthDetailPage() {
  const { month } = useParams<{ month: string }>()
  const [data, setData] = useState<MonthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/emissions/month?month=${month}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [month])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <p style={{ color:'#aaa', fontSize:'13px' }}>불러오는 중...</p>
    </div>
  )

  if (!data) return null

  const byType = ['전기', '원소재', '운송'].map(type => ({
    type,
    co2e: data.results.filter(r => r.activityType === type).reduce((s, r) => s + r.co2e, 0),
  }))

  return (
    <main style={{ padding:'clamp(16px, 4vw, 40px)', maxWidth:'900px', margin:'0 auto' }}>

      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #eee' }}>
        <Link href="/" style={{ fontSize:'12px', color:'#aaa', textDecoration:'none' }}>← 대시보드</Link>
        <h1 style={{ fontSize:'16px', fontWeight:'500', margin:0 }}>{month} 상세 배출량</h1>
        <span style={{ marginLeft:'auto', fontSize:'13px', fontWeight:'500', color:'#8A5F41' }}>
          총 {data.total.toLocaleString()} kgCO₂e
        </span>
      </div>

      {/* 유형별 요약 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'10px', marginBottom:'24px' }}>
        {byType.map(b => (
          <div key={b.type} style={{ background:'#f9f6f3', borderRadius:'10px', padding:'14px', borderLeft:`3px solid ${COLORS[b.type as keyof typeof COLORS]}` }}>
            <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'6px' }}>{b.type}</div>
            <div style={{ fontSize:'20px', fontWeight:'500', color:'#333' }}>{b.co2e.toLocaleString()}</div>
            <div style={{ fontSize:'10px', color:'#bbb', marginTop:'2px' }}>kgCO₂e · {data.total > 0 ? Math.round(b.co2e / data.total * 100) : 0}%</div>
          </div>
        ))}
      </div>

      {/* 활동별 상세 테이블 */}
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', marginBottom:'20px' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ fontSize:'13px', fontWeight:'500' }}>활동별 배출 내역</div>
          <div style={{ fontSize:'11px', color:'#aaa', marginTop:'2px' }}>계산식: 활동량 × 배출계수 = kgCO₂e</div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
            <thead>
              <tr style={{ background:'#fafafa' }}>
                {['활동 유형','설명','활동량','배출계수','kgCO₂e','비중','Scope'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:'500', color:'#888', whiteSpace:'nowrap', borderBottom:'1px solid #f0f0f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results.map(r => (
                <tr key={r.id} style={{ borderBottom:'1px solid #f8f8f8' }}>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ width:'8px', height:'8px', borderRadius:'2px', background: COLORS[r.activityType as keyof typeof COLORS] ?? '#ccc', display:'inline-block' }} />
                      {r.activityType}
                    </span>
                  </td>
                  <td style={{ padding:'10px 16px', color:'#555' }}>{r.description}</td>
                  <td style={{ padding:'10px 16px', color:'#555' }}>{r.amount.toLocaleString()} {r.unit}</td>
                  <td style={{ padding:'10px 16px', color:'#888', fontFamily:'monospace', fontSize:'11px' }}>{r.factor} {r.factorUnit}</td>
                  <td style={{ padding:'10px 16px', fontWeight:'500', color:'#333' }}>{r.co2e.toLocaleString()}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'60px', background:'#f0f0f0', borderRadius:'3px', height:'5px', overflow:'hidden' }}>
                        <div style={{ width:`${data.total > 0 ? Math.round(r.co2e / data.total * 100) : 0}%`, height:'100%', background: COLORS[r.activityType as keyof typeof COLORS] ?? '#ccc', borderRadius:'3px' }} />
                      </div>
                      <span style={{ fontSize:'11px', color:'#aaa' }}>{data.total > 0 ? Math.round(r.co2e / data.total * 100) : 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'3px', background: SCOPE_COLOR[r.scope] ?? '#eee', color: SCOPE_TEXT[r.scope] ?? '#666' }}>
                      {r.scope === 'scope2' ? 'Scope 2' : 'Scope 3'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 계산 방법 */}
      <div style={{ padding:'14px 16px', background:'#f9f6f3', borderRadius:'10px', borderLeft:'3px solid #F3E4C9' }}>
        <div style={{ fontSize:'11px', fontWeight:'500', color:'#8A5F41', marginBottom:'8px' }}>? 계산 방법 (GHG Protocol Product Standard)</div>
        <div style={{ fontSize:'11px', color:'#a07050', lineHeight:'1.8' }}>
          <div>• <strong>전기</strong>: 사용량(kWh) × 0.456 kgCO₂e/kWh — 한국전력 기본 배출계수</div>
          <div>• <strong>원소재 플라스틱 1</strong>: 사용량(kg) × 2.3 kgCO₂e/kg</div>
          <div>• <strong>원소재 플라스틱 2</strong>: 사용량(kg) × 3.2 kgCO₂e/kg</div>
          <div>• <strong>운송(트럭)</strong>: 수송량(ton-km) × 3.5 kgCO₂e/ton-km</div>
          <div style={{ marginTop:'6px', color:'#bba080' }}>배출계수는 emission_factors 테이블에서 동적으로 조회 · 버전 관리 적용</div>
        </div>
      </div>

    </main>
  )
}

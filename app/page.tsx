'use client'

import { useEffect, useState } from 'react'
import KPICard from '@/components/ui/KPICard'
import EmissionTrend from '@/components/charts/EmissionTrend'
import ScopeBreakdown from '@/components/charts/ScopeBreakdown'

interface MonthlyEmission {
  month: string
  전기: number
  원소재: number
  운송: number
  total: number
}

interface ScopeSummary {
  scope: string
  label: string
  description: string
  co2e: number
  percentage: number
}

interface DashboardData {
  totalCO2e: number
  monthly: MonthlyEmission[]
  scopeSummary: ScopeSummary[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/emissions')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p style={{ color:'#888', fontSize:'14px' }}>데이터 불러오는 중...</p>
    </div>
  )

  if (!data) return null

  const scope3 = data.scopeSummary.find(s => s.scope === 'scope3_upstream')
  const scope2 = data.scopeSummary.find(s => s.scope === 'scope2')

  return (
    <main style={{ padding:'clamp(16px, 4vw, 40px)', maxWidth:'1200px', margin:'0 auto', minHeight:'100vh' }}>

      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #eee' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#1D9E75', flexShrink:0 }} />
        <h1 style={{ fontSize:'clamp(14px, 2vw, 18px)', fontWeight:'500', margin:0 }}>HanaLoop PCF 대시보드</h1>
        <span style={{ marginLeft:'auto', fontSize:'11px', color:'#888', background:'#f0f0f0', padding:'3px 10px', borderRadius:'4px' }}>
          CT-045 · 2025.01 — 2025.08
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px', marginBottom:'20px' }}>
        <KPICard label="총 탄소 발자국 (PCF)" value={data.totalCO2e.toLocaleString()} unit="kgCO₂e" />
        <KPICard label="Scope 3 비중 (공급망)" value={`${scope3?.percentage ?? 0}%`} unit="원소재 + 운송" />
        <KPICard label="전력 배출 (Scope 2)" value={scope2?.co2e.toLocaleString() ?? '0'} unit="kgCO₂e · 한국전력" />
        <KPICard label="데이터 기간" value={`${data.monthly.length}개월`} unit="2025.01 — 2025.08" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'16px' }}>
        <EmissionTrend data={data.monthly} />
        <ScopeBreakdown data={data.scopeSummary} />
      </div>

    </main>
  )
}

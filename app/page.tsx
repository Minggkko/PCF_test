'use client'

import { useEffect, useState } from 'react'
import KPICard from '@/components/ui/KPICard'
import ScopeDonut from '@/components/charts/ScopeDonut'
import EmissionTrend from '@/components/charts/EmissionTrend'
import LCAFlow from '@/components/charts/LCAFlow'
import TopSources from '@/components/charts/TopSources'
import InsightCard from '@/components/InsightCard'

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

interface ActivityResult {
  activityType: string
  description: string
  co2e: number
  scope: string
}

interface DashboardData {
  totalCO2e: number
  monthly: MonthlyEmission[]
  scopeSummary: ScopeSummary[]
  activities: ActivityResult[]
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  useEffect(() => {
    fetch('/api/emissions')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <p style={{ color:'#aaa', fontSize:'14px' }}>데이터 불러오는 중...</p>
    </div>
  )

  if (!data) return null

  const filteredMonthly = selectedMonth === 'all'
    ? data.monthly
    : data.monthly.filter(m => m.month === selectedMonth)

  const filteredTotal  = filteredMonthly.reduce((s, m) => s + m.total, 0)
  const filteredScope2 = filteredMonthly.reduce((s, m) => s + m.전기, 0)
  const filteredScope3 = filteredMonthly.reduce((s, m) => s + m.원소재 + m.운송, 0)
  const scope3pct = filteredTotal > 0 ? Math.round(filteredScope3 / filteredTotal * 1000) / 10 : 0

  const filteredActivities = selectedMonth === 'all'
    ? data.activities
    : data.activities.filter(a => new Date(a.date as any).toISOString().slice(0, 7) === selectedMonth)

  const scopeSummary: ScopeSummary[] = [
    {
      scope: 'scope3_upstream',
      label: 'Scope 3 업스트림',
      description: '공급망 배출 — 원자재 구매 및 외부 운송',
      co2e: Math.round(filteredScope3 * 10) / 10,
      percentage: scope3pct,
    },
    {
      scope: 'scope2',
      label: 'Scope 2 간접',
      description: '한국전력 구매 전력 사용',
      co2e: Math.round(filteredScope2 * 10) / 10,
      percentage: Math.round((100 - scope3pct) * 10) / 10,
    },
  ]

  return (
    <main style={{ padding:'clamp(16px, 4vw, 40px)', maxWidth:'1200px', margin:'0 auto', minHeight:'100vh' }}>

      {/* 헤더 */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'clamp(14px, 2vw, 18px)', fontWeight:'500', margin:0 }}>PCF 대시보드</h1>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px' }}>
          <label style={{ fontSize:'12px', color:'#888' }}>기간 선택</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ fontSize:'12px', padding:'6px 12px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', color:'#333', cursor:'pointer', outline:'none' }}
          >
            <option value="all">전체 기간</option>
            {data.monthly.map(m => (
              <option key={m.month} value={m.month}>{m.month}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px', marginBottom:'20px' }}>
        <KPICard label="총 탄소 발자국 (PCF)" value={Math.round(filteredTotal * 10) / 10 + ' kgCO₂e'} unit={selectedMonth === 'all' ? '전체 기간' : selectedMonth} />
        <KPICard label="Scope 3 비중 (공급망)" value={`${scope3pct}%`} unit="원소재 + 운송" />
        <KPICard label="전력 배출 (Scope 2)" value={Math.round(filteredScope2 * 10) / 10 + ' kg'} unit="kgCO₂e · 한국전력" />
        <KPICard label="데이터 기간" value={`${filteredMonthly.length}개월`} unit={selectedMonth === 'all' ? '전체' : selectedMonth} />
      </div>

      {/* LCA 전과정 흐름 */}
      <LCAFlow scopeData={scopeSummary} total={filteredTotal} />

      {/* 인사이트 */}
      <InsightCard monthly={data.monthly} total={data.totalCO2e} selectedMonth={selectedMonth} />

      {/* 차트 3개 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px' }}>
        <EmissionTrend data={filteredMonthly} />
        <ScopeDonut data={scopeSummary} />
        <TopSources activities={filteredActivities as any} total={filteredTotal} />
      </div>

    </main>
  )
}

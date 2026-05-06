'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

const COLORS = ['#5A7863', '#90AB8B', '#EBF4DD']

export default function ScopeDonut({ data }: Props) {
  const chartData = data.map(s => ({
    name: s.label,
    value: s.co2e,
    description: s.description,
  }))

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>GHG Scope별 배출 비중</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'8px' }}>GHG Protocol 기준 분류</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `${value.toLocaleString()} kgCO2e`} />
          <Legend
            formatter={(value) => <span style={{ fontSize:'11px', color:'#666' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ padding:'10px 14px', background:'#F6F0D7', borderRadius:'8px', fontSize:'10px', color:'#89986D', lineHeight:'1.8' }}>
        <strong>계산 기준</strong> — 활동량 × 배출계수 = kgCO₂e · GHG Protocol Product Standard
      </div>
    </div>
  )
}

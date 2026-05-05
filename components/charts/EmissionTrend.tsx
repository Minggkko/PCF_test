'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyEmission {
  month: string
  전기: number
  원소재: number
  운송: number
  total: number
}

interface Props {
  data: MonthlyEmission[]
}

export default function EmissionTrend({ data }: Props) {
  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>월별 탄소 배출 추이</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'16px' }}>활동 유형별 누적 (kgCO₂e)</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top:4, right:4, left:-10, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize:10 }} />
          <YAxis tick={{ fontSize:10 }} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} kgCO₂e`} />
          <Legend wrapperStyle={{ fontSize:'11px' }} />
          <Bar dataKey="원소재" stackId="a" fill="#D85A30" name="원소재 (Scope 3)" />
          <Bar dataKey="운송" stackId="a" fill="#BA7517" name="운송 (Scope 3)" />
          <Bar dataKey="전기" stackId="a" fill="#7F77DD" name="전기 (Scope 2)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

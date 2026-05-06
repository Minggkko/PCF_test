'use client'

import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const handleClick = (e: any) => {
    if (!e || !e.activePayload || e.activePayload.length === 0) return
    const month = e.activePayload[0].payload.month
    router.push(`/month/${month}`)
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>월별 탄소 배출 추이</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'16px' }}>막대 클릭 → 해당 월 상세 페이지로 이동</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top:4, right:4, left:-10, bottom:0 }} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis dataKey="month" tick={{ fontSize:10 }} />
          <YAxis tick={{ fontSize:10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize:'11px' }} />
          <Bar dataKey="원소재" stackId="a" fill="#89986D" name="원소재 (Scope 3)" cursor="pointer" />
          <Bar dataKey="운송"   stackId="a" fill="#C5D89D" name="운송 (Scope 3)"   cursor="pointer" />
          <Bar dataKey="전기"   stackId="a" fill="#9CAB84" name="전기 (Scope 2)"   cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop:'10px', textAlign:'center', fontSize:'11px', color:'#ccc' }}>
        막대 클릭 → 월별 원본 데이터 + 계산식
      </div>
    </div>
  )
}

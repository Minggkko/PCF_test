'use client'

interface MonthlyEmission {
  month: string
  전기: number
  원소재: number
  운송: number
  total: number
}

interface Props {
  monthly: MonthlyEmission[]
  total: number
  selectedMonth: string
}

export default function InsightCard({ monthly, total, selectedMonth }: Props) {
  if (monthly.length === 0) return null

  const allSorted = [...monthly].sort((a, b) => b.total - a.total)
  const maxMonth = allSorted[0]
  const minMonth = allSorted[allSorted.length - 1]

  // 전체 기간 인사이트
  if (selectedMonth === 'all') {
    const rawMaterialTotal = monthly.reduce((s, m) => s + m.원소재, 0)
    const rawPct = total > 0 ? Math.round(rawMaterialTotal / total * 100) : 0

    const last = monthly[monthly.length - 1]
    const prev = monthly[monthly.length - 2]
    const trend = prev ? ((last.total - prev.total) / prev.total * 100).toFixed(1) : null

    const insights = [
      {
        icon: '최대치',
        text: `최대 배출월은 <strong>${maxMonth.month}</strong>로 ${maxMonth.total.toLocaleString()} kgCO₂e 배출됐어요.`,
        color: '#faece7',
        border: '#D85A30',
      },
      {
        icon: '최소치',
        text: `최소 배출월은 <strong>${minMonth.month}</strong>로 ${minMonth.total.toLocaleString()} kgCO₂e 배출됐어요.`,
        color: '#f0f5eb',
        border: '#9CAB84',
      },
      trend ? {
        icon: Number(trend) > 0 ? '⚠️' : '✅',
        text: `최근 전월 대비 <strong>${Math.abs(Number(trend))}% ${Number(trend) > 0 ? '증가' : '감소'}</strong>했어요. (${prev?.month} → ${last.month})`,
        color: Number(trend) > 0 ? '#faece7' : '#f0f5eb',
        border: Number(trend) > 0 ? '#D85A30' : '#9CAB84',
      } : null,
      {
        icon: '감축 제안',
        text: `원소재가 전체의 <strong>${rawPct}%</strong>를 차지해요. 공급업체 전환이 가장 효과적인 감축 방법입니다.`,
        color: '#F6F0D7',
        border: '#89986D',
      },
    ].filter(Boolean) as any[]

    return (
      <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
        <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>AI 인사이트 — 전체 기간</div>
        <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'16px' }}>과거 데이터 기반 자동 분석</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'10px' }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ padding:'12px 14px', background:'#fff', borderRadius:'10px', border:`2px solid ${ins.border}` }}>
              <div style={{ fontSize:'16px', marginBottom:'6px' }}>{ins.icon}</div>
              <div style={{ fontSize:'12px', color:'#444', lineHeight:'1.6' }} dangerouslySetInnerHTML={{ __html: ins.text }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 특정 월 선택 시 인사이트
  const currentMonth = monthly.find(m => m.month === selectedMonth)
  if (!currentMonth) return null

  const diffFromMax = maxMonth.total - currentMonth.total
  const diffFromMaxPct = maxMonth.total > 0 ? Math.round(diffFromMax / maxMonth.total * 100) : 0

  const monthIndex = monthly.findIndex(m => m.month === selectedMonth)
  const prevMonth = monthIndex > 0 ? monthly[monthIndex - 1] : null
  const nextMonth = monthIndex < monthly.length - 1 ? monthly[monthIndex + 1] : null

  const diffFromPrev = prevMonth ? currentMonth.total - prevMonth.total : null
  const diffFromPrevPct = prevMonth && prevMonth.total > 0
    ? ((currentMonth.total - prevMonth.total) / prevMonth.total * 100).toFixed(1)
    : null

  const isMax = currentMonth.month === maxMonth.month
  const isMin = currentMonth.month === minMonth.month

  const insights = [
    isMax ? {
      icon: '최대치 비교',
      text: allSorted[1]
        ? `<strong>${selectedMonth}</strong>은 전체 기간 중 <strong>최대 배출월</strong>이에요. 다음으로 높은 달(${allSorted[1].month})보다 <strong>${(currentMonth.total - allSorted[1].total).toLocaleString()} kgCO₂e 더 많이</strong> 배출됐어요.`
        : `<strong>${selectedMonth}</strong>은 전체 기간 중 <strong>최대 배출월</strong>이에요. (${currentMonth.total.toLocaleString()} kgCO₂e)`,
      color: '#ECFDF5', border: '#10B981',
    } : 
    isMin ? {
      icon: '최소치 비교',
      text: `<strong>${selectedMonth}</strong>은 전체 기간 중 <strong>최소 배출월</strong>이에요. 최대 배출월(${maxMonth.month})보다 <strong>${(maxMonth.total - currentMonth.total).toLocaleString()} kgCO₂e 덜</strong> 배출됐어요.`,
      color: '#f0f5eb', border: '#9CAB84',
    } : {
      icon: '최대치 비교',
      text: `최대 배출월(${maxMonth.month}, ${maxMonth.total.toLocaleString()} kgCO₂e)보다 <strong>${diffFromMax.toLocaleString()} kgCO₂e(${diffFromMaxPct}%) 덜</strong> 배출됐어요.`,
      color: '#f0f5eb', border: '#9CAB84',
    } ,
    diffFromPrev !== null && diffFromPrevPct !== null ? {
      icon: diffFromPrev > 0 ? '전월대비' : '전월대비',
      text: `전월(${prevMonth?.month}) 대비 <strong>${Math.abs(Number(diffFromPrevPct))}% ${diffFromPrev > 0 ? '증가' : '감소'}</strong>했어요. (${Math.abs(diffFromPrev).toLocaleString()} kgCO₂e)`,
      color: diffFromPrev > 0 ? '#ECFDF5' : '#f0f5eb',
      border: diffFromPrev > 0 ? '#10B981' : '#9CAB84',
    } : null,
    nextMonth ? {
      icon: '향후 예측',
      text: `다음 달(${nextMonth.month})은 ${nextMonth.total > currentMonth.total
        ? `<strong>${((nextMonth.total - currentMonth.total) / currentMonth.total * 100).toFixed(1)}% 증가</strong>했어요.`
        : `<strong>${((currentMonth.total - nextMonth.total) / currentMonth.total * 100).toFixed(1)}% 감소</strong>했어요.`}`,
      color: nextMonth.total > currentMonth.total ? '#ECFDF5' : '#f0f5eb',
      border: nextMonth.total > currentMonth.total ? '#10B981' : '#9CAB84',
    } : null,
    {
      icon: '항목별 분석',
      text: `이 달 원소재 배출: <strong>${currentMonth.원소재.toLocaleString()} kgCO₂e</strong> · 전기: <strong>${currentMonth.전기.toLocaleString()} kgCO₂e</strong> · 운송: <strong>${currentMonth.운송.toLocaleString()} kgCO₂e</strong>`,
      color: '#F6F0D7', border: '#89986D',
    },
  ].filter(Boolean) as any[]

  return (
    <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
      <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>AI 인사이트 — {selectedMonth}</div>
      <div style={{ fontSize:'11px', color:'#aaa', marginBottom:'16px' }}>선택 월 vs 전체 기간 비교 분석</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'10px' }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ padding:'12px 14px', background:'#fff', borderRadius:'8px', border:`2px solid ${ins.border}` }}>
            <div style={{
                fontSize:'14px',
                fontWeight:'700',
                color:'#888',
              
                display:'inline-block',
                marginBottom:'8px',
                paddingBottom:'2px',
              }}>
                {ins.icon}
              </div>
          <div style={{ fontSize:'12px', color:'#444', lineHeight:'1.6' }} dangerouslySetInnerHTML={{ __html: ins.text }} />
          </div>
        ))}
      </div>
    </div>
  )
}

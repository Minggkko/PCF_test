import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCO2e, resolveScope, getScopeLabel } from '@/lib/carbon/calculator'
import type { ActivityType, MonthlyEmission, ScopeSummary } from '@/lib/carbon/types'

export async function GET() {
  // 활동 데이터 + 배출계수 함께 조회
  const activities = await prisma.activity.findMany({
    orderBy: { date: 'asc' },
  })

  const factors = await prisma.emissionFactor.findMany()

  // 배출계수 빠른 조회용 맵
  const factorMap = new Map(
    factors.map(f => [`${f.activityType}__${f.description}`, f])
  )

  // 활동별 CO₂e 계산
  const results = activities.map(activity => {
    const key = `${activity.activityType}__${activity.description}`
    const factor = factorMap.get(key)
    const co2e = factor ? calculateCO2e(activity.amount, factor.factor) : 0
    const scope = resolveScope(activity.activityType as ActivityType)

    return {
      id: activity.id,
      date: activity.date,
      activityType: activity.activityType,
      description: activity.description,
      amount: activity.amount,
      unit: activity.unit,
      factor: factor?.factor ?? 0,
      co2e,
      scope,
    }
  })

  // 총 CO₂e
  const totalCO2e = results.reduce((sum, r) => sum + r.co2e, 0)

  // 월별 집계
  const monthlyMap = new Map<string, MonthlyEmission>()
  for (const r of results) {
    const month = r.date.toISOString().slice(0, 7) // '2025-01'
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, 전기: 0, 원소재: 0, 운송: 0, total: 0 })
    }
    const entry = monthlyMap.get(month)!
    entry[r.activityType as '전기' | '원소재' | '운송'] += r.co2e
    entry.total += r.co2e
  }
  const monthly = Array.from(monthlyMap.values())

  // Scope별 집계
  const scopeMap = new Map<string, number>()
  for (const r of results) {
    scopeMap.set(r.scope, (scopeMap.get(r.scope) ?? 0) + r.co2e)
  }
  const scopeSummary: ScopeSummary[] = Array.from(scopeMap.entries()).map(
    ([scope, co2e]) => {
      const { label, description } = getScopeLabel(scope as any)
      return {
        scope: scope as any,
        label,
        description,
        co2e: Math.round(co2e * 10) / 10,
        percentage: Math.round((co2e / totalCO2e) * 1000) / 10,
      }
    }
  )

return new Response(JSON.stringify({
  totalCO2e: Math.round(totalCO2e * 10) / 10,
  monthly,
  scopeSummary,
  activities: results,
}), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})
}
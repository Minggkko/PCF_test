import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCO2e, resolveScope, getScopeLabel } from '@/lib/carbon/calculator'
import type { ActivityType, MonthlyEmission, ScopeSummary } from '@/lib/carbon/types'

export const dynamic = 'force-dynamic'
export async function GET() {
  const activities = await prisma.activity.findMany({ orderBy: { date: 'asc' } })
  const factors = await prisma.emissionFactor.findMany()
  const factorMap = new Map(factors.map(f => [`${f.activityType}__${f.description}`, f]))

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

  const totalCO2e = results.reduce((sum, r) => sum + r.co2e, 0)

  const monthlyMap = new Map<string, MonthlyEmission>()
  for (const r of results) {
    const month = new Date(r.date).toISOString().slice(0, 7)
    if (!monthlyMap.has(month)) monthlyMap.set(month, { month, 전기:0, 원소재:0, 운송:0, total:0 })
    const entry = monthlyMap.get(month)!
    entry[r.activityType as '전기'|'원소재'|'운송'] += r.co2e
    entry.total += r.co2e
  }
  const monthly = Array.from(monthlyMap.values())

  const scopeMap = new Map<string, number>()
  for (const r of results) scopeMap.set(r.scope, (scopeMap.get(r.scope) ?? 0) + r.co2e)

  const scopeSummary: ScopeSummary[] = Array.from(scopeMap.entries()).map(([scope, co2e]) => {
    const { label, description } = getScopeLabel(scope as any)
    return {
      scope: scope as any,
      label,
      description,
      co2e: Math.round(co2e * 10) / 10,
      percentage: Math.round((co2e / totalCO2e) * 1000) / 10,
    }
  })

  return NextResponse.json({
    totalCO2e: Math.round(totalCO2e * 10) / 10,
    monthly,
    scopeSummary,
    activities: results,
  })
}

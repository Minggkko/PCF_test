import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCO2e, resolveScope } from '@/lib/carbon/calculator'
import type { ActivityType } from '@/lib/carbon/types'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month')
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 })

  const [year, mon] = month.split('-').map(Number)
  const start = new Date(year, mon - 1, 1)
  const end = new Date(year, mon, 1)

  const activities = await prisma.activity.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: 'asc' },
  })

  const factors = await prisma.emissionFactor.findMany()
  const factorMap = new Map(factors.map(f => [`${f.activityType}__${f.description}`, f]))

  const results = activities.map(a => {
    const key = `${a.activityType}__${a.description}`
    const factor = factorMap.get(key)
    const co2e = factor ? calculateCO2e(a.amount, factor.factor) : 0
    const scope = resolveScope(a.activityType as ActivityType)
    return {
      id: a.id,
      date: a.date,
      activityType: a.activityType,
      description: a.description,
      amount: a.amount,
      unit: a.unit,
      factor: factor?.factor ?? 0,
      factorUnit: factor?.unit ?? '',
      co2e,
      scope,
    }
  })

  const total = results.reduce((s, r) => s + r.co2e, 0)

  return NextResponse.json({ month, results, total: Math.round(total * 10) / 10 })
}

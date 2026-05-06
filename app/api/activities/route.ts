import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { date, activityType, description, amount, unit } = await req.json()

    const activity = await prisma.activity.create({
      data: {
        date: new Date(date),
        activityType,
        description,
        amount,
        unit,
      }
    })

    return NextResponse.json({ success: true, activity })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

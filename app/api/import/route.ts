import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { rows, filename } = await req.json()

    let successRows = 0
    let skipRows = 0
    let errorRows = 0

    const log = await prisma.importLog.create({
      data: {
        filename,
        totalRows: rows.length,
        successRows: 0,
        errorRows: 0,
        status: 'processing',
      }
    })

    for (const row of rows) {
      try {
        const date = new Date(row.date)

        // 중복 체크 — 날짜 + 활동유형 + 설명 + 량이 동일하면 스킵
        const existing = await prisma.activity.findFirst({
          where: {
            date,
            activityType: row.activityType,
            description: row.description,
            amount: parseFloat(row.amount),
          }
        })

        if (existing) {
          skipRows++
          continue
        }

        await prisma.activity.create({
          data: {
            date,
            activityType: row.activityType,
            description: row.description,
            amount: parseFloat(row.amount),
            unit: row.unit,
            importLogId: log.id,
          }
        })
        successRows++
      } catch {
        errorRows++
      }
    }

    await prisma.importLog.update({
      where: { id: log.id },
      data: {
        successRows,
        errorRows,
        status: errorRows === 0 ? 'success' : 'partial',
      }
    })

    return NextResponse.json({ success: true, successRows, skipRows, errorRows, logId: log.id })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

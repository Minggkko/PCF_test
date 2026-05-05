import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.emissionFactor.createMany({
    data: [
      { activityType: '전기', description: '한국전력', factor: 0.456, unit: 'kgCO2e/kWh', version: 1 },
      { activityType: '원소재', description: '플라스틱 1', factor: 2.3, unit: 'kgCO2e/kg', version: 1 },
      { activityType: '원소재', description: '플라스틱 2', factor: 3.2, unit: 'kgCO2e/kg', version: 1 },
      { activityType: '운송', description: '트럭', factor: 3.5, unit: 'kgCO2e/ton-km', version: 1 },
    ],
  })

  await prisma.activity.createMany({
    data: [
      { date: new Date('2025-01-01'), activityType: '전기', description: '한국전력', amount: 110, unit: 'kWh' },
      { date: new Date('2025-02-01'), activityType: '전기', description: '한국전력', amount: 112, unit: 'kWh' },
      { date: new Date('2025-03-01'), activityType: '전기', description: '한국전력', amount: 115, unit: 'kWh' },
      { date: new Date('2025-04-01'), activityType: '전기', description: '한국전력', amount: 130, unit: 'kWh' },
      { date: new Date('2025-05-01'), activityType: '전기', description: '한국전력', amount: 120, unit: 'kWh' },
      { date: new Date('2025-06-01'), activityType: '전기', description: '한국전력', amount: 110, unit: 'kWh' },
      { date: new Date('2025-07-01'), activityType: '전기', description: '한국전력', amount: 120, unit: 'kWh' },
      { date: new Date('2025-08-01'), activityType: '전기', description: '한국전력', amount: 111, unit: 'kWh' },
      { date: new Date('2025-05-01'), activityType: '전기', description: '한국전력', amount: 101, unit: 'kWh' },
      { date: new Date('2025-01-01'), activityType: '원소재', description: '플라스틱 1', amount: 230, unit: 'kg' },
      { date: new Date('2025-02-01'), activityType: '원소재', description: '플라스틱 1', amount: 340, unit: 'kg' },
      { date: new Date('2025-03-01'), activityType: '원소재', description: '플라스틱 2', amount: 23, unit: 'kg' },
      { date: new Date('2025-03-01'), activityType: '원소재', description: '플라스틱 1', amount: 430, unit: 'kg' },
      { date: new Date('2025-04-01'), activityType: '원소재', description: '플라스틱 1', amount: 510, unit: 'kg' },
      { date: new Date('2025-05-01'), activityType: '원소재', description: '플라스틱 1', amount: 424, unit: 'kg' },
      { date: new Date('2025-05-01'), activityType: '원소재', description: '플라스틱 2', amount: 40, unit: 'kg' },
      { date: new Date('2025-06-01'), activityType: '원소재', description: '플라스틱 1', amount: 450, unit: 'kg' },
      { date: new Date('2025-07-01'), activityType: '원소재', description: '플라스틱 1', amount: 340, unit: 'kg' },
      { date: new Date('2025-07-01'), activityType: '원소재', description: '플라스틱 2', amount: 43, unit: 'kg' },
      { date: new Date('2025-08-01'), activityType: '원소재', description: '플라스틱 1', amount: 230, unit: 'kg' },
      { date: new Date('2025-05-01'), activityType: '원소재', description: '플라스틱 1', amount: 232, unit: 'kg' },
      { date: new Date('2025-01-01'), activityType: '운송', description: '트럭', amount: 41, unit: 'ton-km' },
      { date: new Date('2025-02-01'), activityType: '운송', description: '트럭', amount: 211, unit: 'ton-km' },
      { date: new Date('2025-03-01'), activityType: '운송', description: '트럭', amount: 123, unit: 'ton-km' },
      { date: new Date('2025-04-01'), activityType: '운송', description: '트럭', amount: 42, unit: 'ton-km' },
      { date: new Date('2025-05-01'), activityType: '운송', description: '트럭', amount: 123, unit: 'ton-km' },
      { date: new Date('2025-06-01'), activityType: '운송', description: '트럭', amount: 123, unit: 'ton-km' },
      { date: new Date('2025-07-01'), activityType: '운송', description: '트럭', amount: 41, unit: 'ton-km' },
      { date: new Date('2025-08-01'), activityType: '운송', description: '트럭', amount: 123, unit: 'ton-km' },
      { date: new Date('2025-05-01'), activityType: '운송', description: '트럭', amount: 12, unit: 'ton-km' },
    ],
  })

  console.log('✅ 시드 완료')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
// GHG Protocol 기준 Scope 분류
export type GHGScope = 'scope1' | 'scope2' | 'scope3_upstream'

// 활동 유형 — 원본 데이터 기준
export type ActivityType = '전기' | '원소재' | '운송'

// 배출계수 타입
export interface EmissionFactor {
  activityType: ActivityType
  description: string
  factor: number
  unit: string
  version: number
}

// 활동 데이터 타입
export interface Activity {
  id: number
  date: Date
  activityType: ActivityType
  description: string
  amount: number
  unit: string
}

// 배출량 계산 결과
export interface EmissionResult {
  activityId: number
  activityType: ActivityType
  description: string
  scope: GHGScope
  amount: number
  factor: number
  co2e: number        // 활동량 × 배출계수
  unit: string
  date: Date
}

// 월별 집계
export interface MonthlyEmission {
  month: string       // '2025-01'
  전기: number
  원소재: number
  운송: number
  total: number
}

// Scope별 집계
export interface ScopeSummary {
  scope: GHGScope
  label: string       // 비전문가용 한글 레이블
  description: string // 설명
  co2e: number
  percentage: number
}
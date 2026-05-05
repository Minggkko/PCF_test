import type { ActivityType, GHGScope, EmissionResult } from './types'

// 활동 유형 → GHG Scope 매핑
// GHG Protocol Product Standard 기준
const SCOPE_MAP: Record<ActivityType, GHGScope> = {
  전기: 'scope2',           // 외부 구매 전력
  원소재: 'scope3_upstream', // 공급망 원자재 조달
  운송: 'scope3_upstream',   // 업스트림 운송
}

export function resolveScope(activityType: ActivityType): GHGScope {
  return SCOPE_MAP[activityType]
}

// 핵심 계산식: 활동량 × 배출계수 = kgCO₂e
export function calculateCO2e(amount: number, factor: number): number {
  return Math.round(amount * factor * 1000) / 1000
}

// Scope별 한글 레이블 — 비전문가 경영자용
export function getScopeLabel(scope: GHGScope): { label: string; description: string } {
  const map = {
    scope1: {
      label: 'Scope 1 직접',
      description: '직접 연료 연소 — 자사 설비',
    },
    scope2: {
      label: 'Scope 2 간접',
      description: '한국전력 구매 전력 사용',
    },
    scope3_upstream: {
      label: 'Scope 3 업스트림',
      description: '공급망 배출 — 원자재 구매 및 외부 운송',
    },
  }
  return map[scope]
}
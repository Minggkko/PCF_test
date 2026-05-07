# PCF 대시보드 — HanaLoop 채용 과제

제품 탄소 발자국(PCF) 전과정 데이터를 시각화하는 인터랙티브 대시보드입니다.

---

## 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env 파일)
DATABASE_URL="postgresql://postgres:비밀번호@localhost:5432/pcf_db"

# 3. DB 마이그레이션
npx prisma migrate dev

# 4. 배출계수 초기 데이터 입력
npm run seed

# 5. 실행

## 개발 모드
yarn dev

## 프로덕션 모드
yarn build
yarn start
```

브라우저에서 `http://localhost:3000` 접속

---

## 기술 스택

- **Framework**: Next.js 16 (App Router) + TypeScript
- **DB**: PostgreSQL + Prisma ORM
- **차트**: Recharts
- **Excel 파싱**: SheetJS (xlsx)
- **검증**: Zod

---

## 페이지 구성

| 페이지 | 경로 | 설명 |
|--------|------|------|
| Overview | `/` | PCF 전과정 시각화, KPI, 인사이트 |
| 데이터 입력 | `/data` | 활동 데이터 수동 입력 |
| 데이터 업로드 | `/import` | Excel → PostgreSQL 직접 임포트 |
| 월별 상세 | `/month/[month]` | 월별 원본 데이터 + 계산식 |

---

## DB 스키마 (ERD)

```
┌─────────────────────────┐     ┌──────────────────────────┐
│        activities       │     │      emission_factors    │
├─────────────────────────┤     ├──────────────────────────┤
│ id          INT (PK)    │     │ id          INT (PK)     │
│ date        DATE        │     │ activity_type VARCHAR    │
│ activity_type VARCHAR   │─ ─ ▶│ description  VARCHAR     │
│ description VARCHAR     │     │ factor       FLOAT       │
│ amount      FLOAT       │     │ unit         VARCHAR     │
│ unit        VARCHAR     │     │ version      INT         │
│ import_log_id INT (FK)  │     │ created_at   TIMESTAMP   │
│ created_at  TIMESTAMP   │     └──────────────────────────┘
└────────────┬────────────┘
             │ N
             │ 1
┌────────────▼────────────┐
│        import_logs      │
├─────────────────────────┤
│ id          INT (PK)    │
│ filename    VARCHAR     │
│ total_rows  INT         │
│ success_rows INT        │
│ error_rows  INT         │
│ status      VARCHAR     │
│ imported_at TIMESTAMP   │
└─────────────────────────┘
```

---

## 시스템 설계

### 탄소 회계 개념 반영 (GHG Protocol)

```typescript
// GHG Protocol 기준 Scope 분류
type GHGScope = 'scope1' | 'scope2' | 'scope3_upstream'

const SCOPE_MAP: Record<ActivityType, GHGScope> = {
  전기: 'scope2',           // 외부 구매 전력
  원소재: 'scope3_upstream', // 공급망 원자재 조달
  운송: 'scope3_upstream',   // 업스트림 운송
}

// 핵심 계산식: 활동량 × 배출계수 = kgCO₂e
function calculateCO2e(amount: number, factor: number): number {
  return Math.round(amount * factor * 1000) / 1000
}
```

### 모듈형 컴포넌트 구조

```
app/                     ← 페이지 + API Route Handler
components/
├── charts/
│   ├── EmissionTrend    ← 월별 바차트
│   ├── ScopeDonut       ← Scope 도넛 차트
│   ├── LCAFlow          ← 전과정 흐름
│   └── TopSources       ← 배출원 Top5
├── ui/
│   └── KPICard          ← 재사용 KPI 카드
└── InsightCard          ← AI 인사이트
lib/
├── carbon/
│   ├── types.ts         ← 도메인 타입
│   └── calculator.ts    ← CO₂e 계산 함수
└── prisma.ts            ← DB 클라이언트 싱글턴
```

---

## 설계 결정 & Trade-off

### 1. 배출계수를 DB 테이블로 관리

**선택**: `emission_factors` 테이블 + `version` 컬럼

**이유**: 배출계수는 정책·연도마다 변경됨. 코드 상수로 관리하면 배포 없이 수정 불가능하고 변경 이력 추적 불가.

**trade-off**: 쿼리 복잡도 증가 vs 운영 유연성. 운영 유연성 선택.

### 2. Excel 파싱을 클라이언트에서 처리

**선택**: SheetJS를 브라우저에서 실행

**이유**: 파일 선택 즉시 미리보기 표시 가능. 행별 오류를 저장 전에 사용자에게 보여줄 수 있음.

**trade-off**: 클라이언트 보안 vs UX. 탄소 활동 데이터는 기밀성이 낮으므로 UX 우선.

### 3. 배출량 계산을 API에서 실시간 처리

**선택**: DB View 대신 API Route에서 계산

**이유**: 배출계수 변경 시 즉시 반영. 계산 로직이 코드로 테스트 가능. 감사 추적 용이.

**trade-off**: 응답 속도 vs 정확성. 데이터 규모가 크지 않아 실시간 계산 선택.

---

## AI 활용 내역

| 작업 | 사용한 프롬프트 요약 | AI 결과에서 변경한 부분 |
|------|---------------------|-----------------|
| Prisma 스키마 | "PCF 데이터를 위한 activities, emission_factors 테이블 설계" | AI가 단일 테이블로 설계했으나 배출계수 버전 관리를 위해 별도 테이블로 분리. version 컬럼 추가 |
| Excel 파싱 API | "SheetJS로 한글 헤더 Excel 파싱하는 Next.js route 작성" | AI가 서버 파싱으로 구현했으나 미리보기 UX를 위해 클라이언트 파싱으로 변경. 중복 체크 로직 추가 |
| Recharts 차트 | "Scope별 누적 바 차트 + 도넛 차트 컴포넌트 구조" | AI가 fetch 로직을 컴포넌트 안에 포함했으나 재사용성을 위해 props로 분리 |
| LCA 전과정 흐름 | "PCF LCA 단계별 카드 플로우 UI 컴포넌트" | AI가 하드코딩된 수치를 사용했으나 실제 DB 데이터 기반으로 동적 계산으로 변경 |

**AI가 도운 것**: boilerplate 코드, 라이브러리 사용 패턴, 컴포넌트 구조 초안

**변경한 이유**: 탄소 회계 도메인 특성과 실무자·경영자 두 페르소나의 요구사항에 맞게 조정

---
## 작업 소요 시간

총 약 2일 (약18시간)
가장 오래 걸린 작업: 탄소 도메인 학습 및 설계, 대시보드 구현

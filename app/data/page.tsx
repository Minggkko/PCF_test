'use client'

import { useState } from 'react'

const ACTIVITY_TYPES = ['전기', '원소재', '운송']
const DESCRIPTIONS: Record<string, string[]> = {
  전기: ['한국전력'],
  원소재: ['플라스틱 1', '플라스틱 2'],
  운송: ['트럭'],
}
const UNITS: Record<string, string> = {
  전기: 'kWh',
  원소재: 'kg',
  운송: 'ton-km',
}

export default function DataInputPage() {
  const [form, setForm] = useState({
    date: '',
    activityType: '전기',
    description: '한국전력',
    amount: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleTypeChange = (type: string) => {
    setForm(f => ({
      ...f,
      activityType: type,
      description: DESCRIPTIONS[type][0],
    }))
  }

  const handleSubmit = async () => {
    if (!form.date || !form.amount) {
      setStatus('error')
      setMessage('날짜와 량은 필수입니다.')
      return
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setStatus('error')
      setMessage('량은 0보다 큰 숫자여야 합니다.')
      return
    }

    setStatus('loading')
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: form.date,
        activityType: form.activityType,
        description: form.description,
        amount: Number(form.amount),
        unit: UNITS[form.activityType],
      }),
    })

    if (res.ok) {
      setStatus('success')
      setMessage('데이터가 안전하게 저장되었습니다.')
      setForm(f => ({ ...f, date: '', amount: '' }))
    } else {
      setStatus('error')
      setMessage('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: '520px', margin: '0 auto', fontFamily: 'Pretendard, sans-serif' }}>
      
      {/* 헤더 섹션 */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>데이터 입력</h1>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>탄소 배출 활동 데이터를 기록하여 관리하세요.</p>
      </div>

      {/* 입력 폼 카드 */}
      <div style={{ 
        background: '#fff', 
        padding: '28px', 
        borderRadius: '20px', 
        border: '1px solid #F3F4F6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 날짜 입력 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>날짜</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', 
                border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
                transition: 'all 0.2s', background: '#F9FAFB'
              }}
            />
          </div>

          {/* 활동 유형 (세그먼트 컨트롤 스타일) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>활동 유형</label>
            <div style={{ display: 'flex', gap: '6px', background: '#F3F4F6', padding: '4px', borderRadius: '14px' }}>
              {ACTIVITY_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                    border: 'none',
                    background: form.activityType === type ? '#fff' : 'transparent',
                    color: form.activityType === type ? '#10B981' : '#6B7280',
                    fontWeight: form.activityType === type ? '700' : '500',
                    boxShadow: form.activityType === type ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>상세 설명</label>
            <select
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', 
                border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', 
                background: '#F9FAFB', cursor: 'pointer' 
              }}
            >
              {DESCRIPTIONS[form.activityType].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 활동량 입력 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>
              활동량 <span style={{ color: '#9CA3AF', fontWeight: '400' }}>({UNITS[form.activityType]})</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              style={{ 
                width: '100%', padding: '12px 16px', borderRadius: '12px', 
                border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
                background: '#F9FAFB'
              }}
            />
          </div>

          {/* 배출계수 미리보기 카드 (뮤트 톤) */}
          <div style={{ 
            padding: '16px', background: '#F8FAFC', borderRadius: '14px', 
            border: '1px solid #F1F5F9', fontSize: '12px', color: '#64748B', lineHeight: '1.8' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#475569', fontWeight: '700' }}>
              <span>💡</span> 배출 데이터 요약
            </div>
            {form.activityType === '전기' && '한국전력: 0.456 kgCO₂e/kWh'}
            {form.activityType === '원소재' && form.description === '플라스틱 1' && '플라스틱 1: 2.3 kgCO₂e/kg'}
            {form.activityType === '원소재' && form.description === '플라스틱 2' && '플라스틱 2: 3.2 kgCO₂e/kg'}
            {form.activityType === '운송' && '트럭: 3.5 kgCO₂e/ton-km'}
            
            {form.amount && !isNaN(Number(form.amount)) && Number(form.amount) > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', color: '#10B981', fontWeight: '700' }}>
                예상 배출량: {
                  form.activityType === '전기' ? (Number(form.amount) * 0.456).toFixed(2) :
                  form.activityType === '원소재' && form.description === '플라스틱 1' ? (Number(form.amount) * 2.3).toFixed(2) :
                  form.activityType === '원소재' && form.description === '플라스틱 2' ? (Number(form.amount) * 3.2).toFixed(2) :
                  (Number(form.amount) * 3.5).toFixed(2)
                } kgCO₂e
              </div>
            )}
          </div>

          {/* 상태 메시지 */}
          {status === 'error' && (
            <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '12px', fontSize: '12px', color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>
              {message}
            </div>
          )}
          {status === 'success' && (
            <div style={{ padding: '12px', background: '#ECFDF5', borderRadius: '12px', fontSize: '12px', color: '#10B981', textAlign: 'center', fontWeight: '600' }}>
              {message}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            style={{
              marginTop: '8px',
              padding: '14px', borderRadius: '14px', border: 'none',
              background: status === 'loading' ? '#9CA3AF' : '#10B981',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              boxShadow: status === 'loading' ? 'none' : '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {status === 'loading' ? '데이터 저장 중...' : '활동 데이터 기록'}
          </button>

        </div>
      </div>
    </main>
  )
}
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
      setMessage('저장되었습니다.')
      setForm(f => ({ ...f, date: '', amount: '' }))
    } else {
      setStatus('error')
      setMessage('저장에 실패했습니다.')
    }
  }

  return (
    <main style={{ padding:'clamp(16px, 4vw, 40px)', maxWidth:'600px', margin:'0 auto' }}>

      <div style={{ marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'16px', fontWeight:'500', margin:0 }}>활동 데이터 수동 입력</h1>
        <div style={{ fontSize:'11px', color:'#aaa', marginTop:'4px' }}>전기·원소재·운송 데이터를 직접 입력합니다</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

        <div>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>날짜 *</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', outline:'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>활동 유형 *</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {ACTIVITY_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                style={{
                  flex:1, padding:'9px', borderRadius:'8px', fontSize:'13px', cursor:'pointer',
                  border: form.activityType === type ? '1.5px solid #9CAB84' : '1px solid #ddd',
                  background: form.activityType === type ? '#F6F0D7' : '#fff',
                  color: form.activityType === type ? '#89986D' : '#666',
                  fontWeight: form.activityType === type ? '500' : '400',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>설명</label>
          <select
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', outline:'none', background:'#fff' }}
          >
            {DESCRIPTIONS[form.activityType].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize:'12px', color:'#666', display:'block', marginBottom:'6px' }}>
            량 * <span style={{ color:'#aaa', fontWeight:'400' }}>({UNITS[form.activityType]})</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder={`숫자 입력 (${UNITS[form.activityType]})`}
            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'13px', outline:'none' }}
          />
        </div>

        {status === 'error' && (
          <div style={{ padding:'10px 14px', background:'#fff0f0', border:'1px solid #fcc', borderRadius:'8px', fontSize:'12px', color:'#c00' }}>
            ⚠️ {message}
          </div>
        )}

        {status === 'success' && (
          <div style={{ padding:'10px 14px', background:'#f0faf5', border:'1px solid #9CAB84', borderRadius:'8px', fontSize:'12px', color:'#89986D' }}>
            ✓ {message}
          </div>
        )}

        <div style={{ padding:'12px 14px', background:'#F6F0D7', borderRadius:'8px', fontSize:'11px', color:'#89986D', lineHeight:'1.8' }}>
          <strong>배출계수 미리보기</strong><br/>
          {form.activityType === '전기' && '한국전력: 0.456 kgCO₂e/kWh'}
          {form.activityType === '원소재' && form.description === '플라스틱 1' && '플라스틱 1: 2.3 kgCO₂e/kg'}
          {form.activityType === '원소재' && form.description === '플라스틱 2' && '플라스틱 2: 3.2 kgCO₂e/kg'}
          {form.activityType === '운송' && '트럭: 3.5 kgCO₂e/ton-km'}
          {form.amount && !isNaN(Number(form.amount)) && Number(form.amount) > 0 && (
            <span style={{ marginLeft:'8px', color:'#5a6b4a' }}>
              → 예상 배출량: <strong>
                {form.activityType === '전기' && (Number(form.amount) * 0.456).toFixed(2)}
                {form.activityType === '원소재' && form.description === '플라스틱 1' && (Number(form.amount) * 2.3).toFixed(2)}
                {form.activityType === '원소재' && form.description === '플라스틱 2' && (Number(form.amount) * 3.2).toFixed(2)}
                {form.activityType === '운송' && (Number(form.amount) * 3.5).toFixed(2)}
              </strong> kgCO₂e
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style={{
            padding:'11px', borderRadius:'8px', border:'none',
            background: status === 'loading' ? '#ccc' : '#9CAB84',
            color:'#fff', fontSize:'13px', fontWeight:'500',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'loading' ? '저장 중...' : '저장하기'}
        </button>

      </div>
    </main>
  )
}

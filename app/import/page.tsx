'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface PreviewRow {
  date: string
  activityType: string
  description: string
  amount: string
  unit: string
  valid: boolean
  error?: string
}

export default function ImportPage() {
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [filename, setFilename] = useState('')
  const [status, setStatus] = useState<'idle' | 'preview' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<{ successRows: number; errorRows: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const VALID_TYPES = ['전기', '원소재', '운송']

  const parseFile = (file: File) => {
    setFileError('')
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setFileError('xlsx 또는 xls 파일만 업로드할 수 있습니다.')
      return
    }
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]

      // 전체 rows를 raw로 읽어서 헤더 행 자동 탐색
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][]

      // 헤더 행 찾기 — '일자' 또는 'date' 포함한 행
      const headerRowIdx = allRows.findIndex(row =>
        row.some(cell => String(cell).includes('일자') || String(cell).toLowerCase() === 'date')
      )

      if (headerRowIdx === -1) {
        setFileError('헤더 행을 찾을 수 없습니다. "일자(원본)", "활동 유형", "량" 컬럼이 있는지 확인해주세요.')
        return
      }

      const headers = allRows[headerRowIdx].map(h => String(h).trim())
      const dataRows = allRows.slice(headerRowIdx + 1)

      const ALIASES: Record<string, string[]> = {
        date:         ['일자(원본)', '날짜', 'date'],
        activityType: ['활동 유형', '활동유형', 'activity_type'],
        description:  ['설명', 'description'],
        amount:       ['량', '수량', 'amount'],
        unit:         ['단위', 'unit'],
      }

      const findColIdx = (key: string) => {
        for (const alias of ALIASES[key]) {
          const idx = headers.findIndex(h => h === alias || h.includes(alias))
          if (idx !== -1) return idx
        }
        return -1
      }

      const dateIdx         = findColIdx('date')
      const activityTypeIdx = findColIdx('activityType')
      const descIdx         = findColIdx('description')
      const amountIdx       = findColIdx('amount')
      const unitIdx         = findColIdx('unit')

      const rows: PreviewRow[] = dataRows
        .map((row, i) => {
          const date         = dateIdx !== -1 ? String(row[dateIdx] ?? '').trim() : ''
          const activityType = activityTypeIdx !== -1 ? String(row[activityTypeIdx] ?? '').trim() : ''
          const description  = descIdx !== -1 ? String(row[descIdx] ?? '').trim() : ''
          const amount       = amountIdx !== -1 ? String(row[amountIdx] ?? '').trim() : ''
          const unit         = unitIdx !== -1 ? String(row[unitIdx] ?? '').trim() : ''

          let valid = true
          let error = ''

          if (!date) { valid = false; error = `${i + headerRowIdx + 2}행: 날짜가 비어 있습니다` }
          else if (!activityType) { valid = false; error = `${i + headerRowIdx + 2}행: 활동 유형이 없습니다` }
          else if (!VALID_TYPES.includes(activityType)) { valid = false; error = `${i + headerRowIdx + 2}행: 활동 유형 "${activityType}"이 유효하지 않습니다` }
          else if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { valid = false; error = `${i + headerRowIdx + 2}행: 량 "${amount}"이 올바르지 않습니다` }

          return { date, activityType, description, amount, unit, valid, error }
        })
        .filter(r => r.date)

      if (rows.length === 0) {
        setFileError('데이터 행이 없습니다.')
        return
      }

      setPreview(rows)
      setStatus('preview')
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  const handleImport = async () => {
    setStatus('loading')
    const validRows = preview.filter(r => r.valid)
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: validRows, filename }),
    })
    const data = await res.json()
    setResult(data)
    setStatus('done')
  }

  const validCount = preview.filter(r => r.valid).length
  const errorCount = preview.filter(r => !r.valid).length

  return (
    <main style={{ padding:'clamp(16px, 4vw, 40px)', maxWidth:'1000px', margin:'0 auto' }}>
      <div style={{ marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #eee' }}>
        <h1 style={{ fontSize:'16px', fontWeight:'500', margin:0 }}>Excel 데이터 임포트</h1>
        <div style={{ fontSize:'11px', color:'#aaa', marginTop:'4px' }}>가공 없이 직접 PostgreSQL 저장</div>
      </div>

      {status === 'idle' && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border:`2px dashed ${dragging ? '#9CAB84' : '#ddd'}`,
              borderRadius:'12px', padding:'60px 20px', textAlign:'center',
              cursor:'pointer', background: dragging ? '#f5f8f0' : '#fafafa', transition:'all 0.2s',
            }}
          >
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>📂</div>
            <div style={{ fontSize:'14px', fontWeight:'500', marginBottom:'6px' }}>Excel 파일을 드래그하거나 클릭해서 업로드</div>
            <div style={{ fontSize:'12px', color:'#aaa' }}>.xlsx, .xls 지원 · 한글 헤더 자동 인식</div>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }}
              onChange={e => { if(e.target.files?.[0]) parseFile(e.target.files[0]) }} />
          </div>
          {fileError && (
            <div style={{ marginTop:'12px', padding:'12px 16px', background:'#fff0f0', border:'1px solid #fcc', borderRadius:'8px', fontSize:'12px', color:'#c00' }}>
              ⚠️ {fileError}
            </div>
          )}
        </>
      )}

      {status === 'preview' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'13px' }}>📄 {filename}</span>
            <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'3px', background:'#e8f8f0', color:'#085041' }}>✓ 유효 {validCount}행</span>
            {errorCount > 0 && <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'3px', background:'#fde8e8', color:'#a00' }}>✗ 오류 {errorCount}행</span>}
            <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
              <button onClick={() => { setStatus('idle'); setPreview([]) }}
                style={{ fontSize:'12px', padding:'6px 14px', borderRadius:'6px', border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}>
                다시 선택
              </button>
              <button onClick={handleImport} disabled={validCount === 0}
                style={{ fontSize:'12px', padding:'6px 16px', borderRadius:'6px', border:'none', background: validCount > 0 ? '#9CAB84' : '#ccc', color:'#fff', cursor: validCount > 0 ? 'pointer' : 'not-allowed', fontWeight:'500' }}>
                {validCount}행 저장하기
              </button>
            </div>
          </div>

          {errorCount > 0 && (
            <div style={{ marginBottom:'12px', padding:'12px 16px', background:'#fff8f0', border:'1px solid #f5cba0', borderRadius:'8px' }}>
              <div style={{ fontSize:'12px', fontWeight:'500', color:'#8a4a00', marginBottom:'6px' }}>⚠️ 오류 항목 — 해당 행은 저장에서 제외됩니다</div>
              {preview.filter(r => !r.valid).map((r, i) => (
                <div key={i} style={{ fontSize:'11px', color:'#a00', marginTop:'3px' }}>• {r.error}</div>
              ))}
            </div>
          )}

          <div style={{ overflowX:'auto', borderRadius:'10px', border:'1px solid #eee' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
              <thead>
                <tr style={{ background:'#f9f9f9' }}>
                  {['날짜','활동 유형','설명','량','단위','상태'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:'500', color:'#666', borderBottom:'1px solid #eee' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #f5f5f5', background: row.valid ? '#fff' : '#fff8f8' }}>
                    <td style={{ padding:'9px 14px' }}>{row.date}</td>
                    <td style={{ padding:'9px 14px' }}>{row.activityType}</td>
                    <td style={{ padding:'9px 14px' }}>{row.description}</td>
                    <td style={{ padding:'9px 14px' }}>{row.amount}</td>
                    <td style={{ padding:'9px 14px' }}>{row.unit}</td>
                    <td style={{ padding:'9px 14px' }}>
                      {row.valid
                        ? <span style={{ color:'#9CAB84', fontSize:'11px' }}>✓ 정상</span>
                        : <span style={{ color:'#e53', fontSize:'11px' }}>✗ {row.error}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {status === 'loading' && (
        <div style={{ textAlign:'center', padding:'60px', color:'#aaa', fontSize:'14px' }}>저장 중...</div>
      )}

      {status === 'done' && result && (
        <div style={{ textAlign:'center', padding:'60px' }}>
          <div style={{ fontSize:'40px', marginBottom:'16px' }}>✅</div>
          <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'8px' }}>임포트 완료</div>
          <div style={{ fontSize:'13px', color:'#888', marginBottom:'24px' }}>
            저장 {(result as any).successRows}행 · 
            중복 스킵 {(result as any).skipRows}행 · 
            실패 {(result as any).errorRows}행
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
            <button onClick={() => { setStatus('idle'); setPreview([]); setResult(null) }}
              style={{ fontSize:'13px', padding:'8px 20px', borderRadius:'8px', border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}>
              추가 임포트
            </button>
            <a href="/" style={{ fontSize:'13px', padding:'8px 20px', borderRadius:'8px', background:'#9CAB84', color:'#fff', textDecoration:'none', display:'inline-block' }}>
              대시보드 보기
            </a>
          </div>
        </div>
)}
    </main>
  )
}

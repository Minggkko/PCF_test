'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navigation() {
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: '개요' },
    { href: '/data', label: '데이터 입력' },
    { href: '/import', label: '데이터 업로드' },
  ]

  return (
    <nav style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 24px', borderBottom:'1px solid #eee', background:'#fff', position:'sticky', top:0, zIndex:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginRight:'auto' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#9CAB84' }} />
        <span style={{ fontSize:'14px', fontWeight:'500' }}>HanaLoop PCF</span>
      </div>
      {tabs.map(tab => (
        <Link key={tab.href} href={tab.href} style={{
          fontSize:'12px',
          padding:'5px 14px',
          borderRadius:'6px',
          textDecoration:'none',
          background: pathname === tab.href ? '#F6F0D7' : 'transparent',
          color: pathname === tab.href ? '#89986D' : '#888',
          fontWeight: pathname === tab.href ? '500' : '400',
        }}>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

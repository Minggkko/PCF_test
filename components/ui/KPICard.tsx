interface KPICardProps {
  label: string
  value: string | number
  unit: string
  tag?: string
  tagColor?: string
}

export default function KPICard({ label, value, unit, tag, tagColor = '#f0f0f0' }: KPICardProps) {
  return (
    <div style={{ background:'#f4f4f4', borderRadius:'10px', padding:'16px' }}>
      <div style={{ fontSize:'11px', color:'#999', marginBottom:'8px' }}>{label}</div>
      <div style={{ fontSize:'clamp(20px, 3vw, 26px)', fontWeight:'500', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'11px', color:'#bbb', marginTop:'4px' }}>{unit}</div>
      {tag && (
        <div style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'3px', background:tagColor, display:'inline-block', marginTop:'8px' }}>
          {tag}
        </div>
      )}
    </div>
  )
}

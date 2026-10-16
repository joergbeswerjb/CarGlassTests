// Верхняя плашка карточки кандидата - краткая сводка по cardSummary из конфига.

import { B, SHAPE } from '../../utils/brand.js'
import { formatValue, discColorByValue } from '../../utils/hr-format.js'

function SummaryCell({ label, value, format }) {
  const f = formatValue(value, format)

  // Pct - крупная цифра
  if (f.kind === 'pct') {
    const isHigh = f.value >= 75
    const isLow = f.value < 45
    const color = isHigh ? '#1A7A3C' : (isLow ? '#9B1818' : B.text)
    return (
      <div style={cellWrap}>
        <div style={cellLabel}>{label}</div>
        <div style={{ ...cellValue, color: color }}>
          {f.value}<span style={{ fontSize: 18, marginLeft: 2 }}>%</span>
        </div>
      </div>
    )
  }

  // Rank badge - крупная буква в плашке
  if (f.kind === 'rank-badge') {
    const s = f.style
    return (
      <div style={cellWrap}>
        <div style={cellLabel}>{label}</div>
        <div style={{
          ...cellValue,
          display: 'inline-block',
          background: s.bg, color: s.color,
          border: '1px solid ' + s.border,
          borderRadius: SHAPE.input,
          padding: '4px 18px',
          fontSize: 28, fontWeight: 800, lineHeight: 1,
        }}>{f.value}</div>
      </div>
    )
  }

  // Gate-status
  if (f.kind === 'gate-status') {
    if (!f.triggered) {
      return (
        <div style={cellWrap}>
          <div style={cellLabel}>{label}</div>
          <div style={{ ...cellValue, color: '#1A7A3C', fontSize: 18 }}>
            пройден
          </div>
        </div>
      )
    }
    const s = f.style
    return (
      <div style={cellWrap}>
        <div style={cellLabel}>{label}</div>
        <div style={{
          display: 'inline-block',
          background: s.bg, color: s.color,
          border: '1px solid ' + s.border,
          borderRadius: SHAPE.input,
          padding: '4px 12px',
          fontSize: 13, fontWeight: 700,
          marginTop: 4,
        }}>сработал</div>
      </div>
    )
  }

  // Default (DISC осн.) - крупная буква с цветом
  if (label === 'DISC') {
    const color = discColorByValue(value)
    return (
      <div style={cellWrap}>
        <div style={cellLabel}>{label}</div>
        <div style={{ ...cellValue, color: color }}>
          {f.display}
        </div>
      </div>
    )
  }

  return (
    <div style={cellWrap}>
      <div style={cellLabel}>{label}</div>
      <div style={cellValue}>{f.display}</div>
    </div>
  )
}

const cellWrap = {
  flex: 1, minWidth: 120,
  padding: '16px 20px',
  borderRight: '1px solid ' + '#E0E4EB',
}

const cellLabel = {
  fontSize: 11,
  color: '#6C757D',
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  fontWeight: 600,
  marginBottom: 6,
}

const cellValue = {
  fontSize: 32,
  fontWeight: 700,
  color: '#212529',
  lineHeight: 1,
}

export default function CardSummary({ row, cfg }) {
  const items = cfg.cardSummary || []
  // Причина гейта / ограничения ранга — чтобы «D при 80%» не выглядело противоречием
  const reason = String(row['Причина гейта'] || '').trim()
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex',
        background: B.white,
        border: '1px solid ' + B.border,
        borderRadius: reason ? SHAPE.card + ' ' + SHAPE.card + ' 0 0' : SHAPE.card,
        overflow: 'hidden',
        flexWrap: 'wrap',
      }}>
        {items.map(function (item, i) {
          return (
            <SummaryCell
              key={item.key}
              label={item.label}
              value={row[item.key]}
              format={item.format}
            />
          )
        })}
      </div>
      {reason && (
        <div style={{
          background: '#FFF6E5', border: '1px solid ' + B.border, borderTop: 'none',
          borderRadius: '0 0 ' + SHAPE.card + ' ' + SHAPE.card,
          padding: '10px 20px', fontSize: 13, color: '#7A4D0F', lineHeight: 1.5,
        }}>
          <strong>Почему такой ранг:</strong> {reason}
        </div>
      )}
    </div>
  )
}

// Блок 2 — Ролевой банк (логист-координатор).
// Слой «одним взглядом»: общий счёт, раскладка по компетенциям, knockout-ответы
// (главный сигнал банка — показываем первыми и красным), бонус SCM.
// Источник — предметные колонки листа (сырые значения, не AI).

import { B, SHAPE } from '../../utils/brand.js'

function colorByPct(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return B.muted
  if (pct >= 70) return '#1A7A3C'
  if (pct >= 45) return '#BA7517'
  return '#9B1818'
}

// «9 из 12» → { score, max, pct }
function parseIz(value) {
  if (value === undefined || value === null) return null
  const m = String(value).trim().match(/^(\d+)\s*из\s*(\d+)$/)
  if (!m) return null
  const score = Number(m[1])
  const max = Number(m[2])
  return { score: score, max: max, pct: max > 0 ? Math.round((score / max) * 100) : 0 }
}

// «Рамки полномочий: 3 из 4; Учёт ...: 2 из 3» → [{ label, score, max, pct }]
function parseComps(value) {
  if (!value) return []
  return String(value).split(';').map(function (part) {
    const idx = part.lastIndexOf(':')
    if (idx < 0) return null
    const label = part.slice(0, idx).trim()
    const sc = parseIz(part.slice(idx + 1))
    return sc ? { label: label, score: sc.score, max: sc.max, pct: sc.pct } : null
  }).filter(Boolean)
}

function Stat({ title, value, color, hint }) {
  return (
    <div style={{
      flex: 1, minWidth: 130, background: B.light,
      border: '1px solid ' + B.border, borderRadius: SHAPE.card, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || B.text, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

export default function BlockRoleBankSummary({ row }) {
  const total = parseIz(row['Банк'])
  const ko = Number(row['Knockout'])
  const koList = String(row['Knockout ответы'] || '').split('\n').map(function (s) { return s.trim() }).filter(Boolean)
  const bonus = parseIz(row['Бонус SCM'])
  const comps = parseComps(row['Банк по компетенциям'])
  const koColor = isNaN(ko) ? B.muted : (ko >= 2 ? '#9B1818' : (ko === 1 ? '#BA7517' : '#1A7A3C'))

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Stat
          title="Банк"
          value={total ? total.score + ' / ' + total.max : '—'}
          color={colorByPct(total && total.pct)}
          hint={total ? total.pct + '%' : null}
        />
        <Stat
          title="Knockout"
          value={isNaN(ko) ? '—' : String(ko)}
          color={koColor}
          hint={isNaN(ko) ? null : (ko >= 2 ? 'красный флаг' : (ko === 1 ? 'проверить' : 'нет'))}
        />
        <Stat
          title="Потенциал SCM"
          value={bonus ? bonus.score + ' / ' + bonus.max : '—'}
          color={bonus && bonus.score >= 2 ? '#1A7A3C' : B.text}
          hint="бонус, вне процента"
        />
      </div>

      {koList.length > 0 && (
        <div style={{
          background: B.redBg, border: '1px solid #F3C9C9', borderRadius: SHAPE.input,
          padding: '12px 14px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9B1818', marginBottom: 6 }}>
            Knockout-ответы — выбор, типичный для главного риска роли
          </div>
          {koList.map(function (k, i) {
            return <div key={i} style={{ fontSize: 13, color: '#7A1A1A', lineHeight: 1.5, marginBottom: 4 }}>• {k}</div>
          })}
        </div>
      )}

      {comps.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 12 }}>
            По компетенциям
          </div>
          {comps.map(function (c) {
            return (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: B.muted, width: 190, flexShrink: 0 }}>{c.label}</span>
                <div style={{ flex: 1, height: 8, background: B.light, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: c.pct + '%', height: '100%', background: colorByPct(c.pct) }} />
                </div>
                <span style={{ fontSize: 13, color: B.text, width: 52, textAlign: 'right', flexShrink: 0 }}>
                  {c.score + '/' + c.max}
                </span>
              </div>
            )
          })}
          <div style={{ fontSize: 12, color: B.muted, marginTop: 8, lineHeight: 1.5 }}>
            На компетенцию 2–4 вопроса: раскладка — ориентир для интервью, не вердикт.
          </div>
        </div>
      )}
    </div>
  )
}

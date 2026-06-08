// Блок 3 — Визуальный стандарт для OD-формата.
// Цифры: найдено / процент / бонус / всего кликов + разворачиваемый список описаний.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { parseScore } from '../../utils/hr-format.js'

function MetricCard({ title, value, hint, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 140,
      background: B.light,
      border: '1px solid ' + B.border,
      borderRadius: SHAPE.card,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, color: B.muted,
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        fontWeight: 600, marginBottom: 8,
      }}>{title}</div>
      <div style={{
        fontSize: 22, fontWeight: 700,
        color: color || B.text, lineHeight: 1,
      }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>{hint}</div>
      )}
    </div>
  )
}

export default function BlockVisualExtendedSummary({ row }) {
  const [expanded, setExpanded] = useState(false)
  const foundScore = parseScore(row['Визуал. найдено'])
  const pctRaw = row['Визуал. %']
  const pct = pctRaw !== undefined && pctRaw !== null && pctRaw !== '' ? Number(pctRaw) : null
  const bonus = row['Визуал. бонус']
  const totalClicks = row['Визуал. всего кликов']

  // Парсинг описаний из 'Сырые данные' (JSON)
  let descriptions = []
  try {
    const raw = row['Сырые данные']
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (parsed && Array.isArray(parsed.raw_vis_marks)) {
        descriptions = parsed.raw_vis_marks
          .filter(function (m) { return m && m.note && String(m.note).trim().length > 0 })
          .map(function (m) {
            return {
              note: String(m.note).trim(),
              kind: m.kind || (m.hit ? 'hit' : 'miss'),
              scene: m.scene !== undefined ? m.scene : null,
            }
          })
      }
    }
  } catch (e) {
    // невалидный JSON - игнорируем, просто не покажем описания
  }

  function pctColor(p) {
    if (p === null) return B.muted
    if (p >= 75) return '#1A7A3C'
    if (p >= 50) return '#BA7517'
    return '#9B1818'
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetricCard
          title="Найдено нарушений"
          value={foundScore ? foundScore.score + ' / ' + foundScore.max : '—'}
          hint={pct !== null ? pct + '%' : null}
          color={pctColor(pct)}
        />
        <MetricCard
          title="Бонусных отметок"
          value={bonus !== undefined && bonus !== null && bonus !== '' ? String(bonus) : '—'}
          hint="осмысленные клики вне списка"
        />
        <MetricCard
          title="Всего кликов"
          value={totalClicks !== undefined && totalClicks !== null && totalClicks !== '' ? String(totalClicks) : '—'}
          hint="включая промахи"
        />
      </div>

      {descriptions.length > 0 && (
        <div>
          <button
            onClick={function () { setExpanded(!expanded) }}
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 0,
              fontSize: 12, color: B.primary, fontWeight: 600,
              fontFamily: 'inherit', marginBottom: 8,
            }}
          >
            {expanded ? '▾' : '▸'} Показать описания кандидата ({descriptions.length})
          </button>

          {expanded && (
            <div style={{
              background: B.white,
              border: '1px solid ' + B.border,
              borderRadius: SHAPE.input,
              padding: '12px 16px',
            }}>
              {descriptions.map(function (d, i) {
                const isHit = d.kind === 'hit'
                const isBonus = d.kind === 'bonus'
                const tagColor = isHit ? '#1A7A3C' : (isBonus ? '#BA7517' : B.muted)
                const tagBg = isHit ? '#E8F5EE' : (isBonus ? '#FFF6E5' : B.light)
                const tagLabel = isHit ? 'попадание' : (isBonus ? 'бонус' : 'промах')
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < descriptions.length - 1 ? '1px solid ' + B.border : 'none',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: tagColor, background: tagBg,
                      padding: '2px 8px', borderRadius: 3,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      flexShrink: 0, height: 18, lineHeight: '14px',
                      marginTop: 2,
                    }}>{tagLabel}</span>
                    <span style={{ color: B.text, wordBreak: 'break-word' }}>{d.note}</span>
                    {d.scene !== null && d.scene !== undefined && (
                      <span style={{ color: B.muted, fontSize: 11, flexShrink: 0 }}>
                        сцена {d.scene}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

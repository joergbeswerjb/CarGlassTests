// Блок 3 — Визуальный стандарт (HR-карточка OD).
// Счёт и взвешенный балл разнесены; клики целыми числами;
// показываем по существу: что найдено, что пропущено, и текст осмысленных наблюдений.
// Богатые данные берём из 'Сырые данные' (JSON payload). Старые записи (до обновления
// scoring) — мягкий фолбэк по колонкам.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { parseScore } from '../../utils/hr-format.js'

const LEVEL_RU = { easy: 'лёгкое', medium: 'среднее', hard: 'сложное' }

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

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: B.muted,
      textTransform: 'uppercase', letterSpacing: '.06em',
      fontWeight: 600, marginBottom: 8,
    }}>{children}</div>
  )
}

function LevelChip({ level }) {
  const label = LEVEL_RU[level]
  if (!label) return null
  return (
    <span style={{
      fontSize: 10, color: B.muted, background: B.light,
      padding: '1px 7px', borderRadius: 3, marginLeft: 8,
      flexShrink: 0,
    }}>{label}</span>
  )
}

function pctColor(p) {
  if (p === null) return B.muted
  if (p >= 75) return '#1A7A3C'
  if (p >= 50) return '#BA7517'
  return '#9B1818'
}

export default function BlockVisualExtendedSummary({ row }) {
  const [showMissed, setShowMissed] = useState(false)

  const pctRaw = row['Визуал. %']
  const pct = pctRaw !== undefined && pctRaw !== null && pctRaw !== '' ? Number(pctRaw) : null

  // Богатые данные из 'Сырые данные'
  let p = null
  try {
    const raw = row['Сырые данные']
    if (raw) p = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e) {
    p = null
  }

  const hasNew = !!(p && p.vis_found_count !== undefined && p.vis_total_count !== undefined)

  // ── Старая запись (до обновления scoring): мягкий фолбэк ──
  if (!hasNew) {
    const foundScore = parseScore(row['Визуал. найдено'])
    const bonus = row['Визуал. бонус']
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <MetricCard
          title="Найдено (взвеш.)"
          value={foundScore ? foundScore.score + ' / ' + foundScore.max : '—'}
          hint={pct !== null ? pct + '%' : null}
          color={pctColor(pct)}
        />
        <MetricCard
          title="Бонусных отметок"
          value={bonus !== undefined && bonus !== null && bonus !== '' ? String(bonus) : '—'}
          hint="осмысленные клики вне списка"
        />
        <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: B.muted }}>
          Запись сделана до обновления визуального блока — детальный разбор доступен для новых прохождений.
        </div>
      </div>
    )
  }

  // ── Новая запись: полный разбор ──
  const foundCount = p.vis_found_count
  const totalCount = p.vis_total_count
  const hits   = p.vis_hits !== undefined ? p.vis_hits : foundCount
  const bonusCount = p.vis_bonus_count !== undefined ? p.vis_bonus_count : 0
  const misses = p.vis_false_positives !== undefined ? p.vis_false_positives : 0
  const foundList  = Array.isArray(p.vis_found_list)  ? p.vis_found_list  : []
  const missedList = Array.isArray(p.vis_missed_list) ? p.vis_missed_list : []
  const bonusList  = Array.isArray(p.vis_bonus_list)  ? p.vis_bonus_list  : []

  const missedShown = showMissed ? missedList : missedList.slice(0, 3)

  return (
    <div>
      {/* Метрики: счёт и балл — раздельно */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetricCard
          title="Нарушений найдено"
          value={foundCount + ' / ' + totalCount}
          color={B.text}
        />
        <MetricCard
          title="Взвешенный балл"
          value={pct !== null ? pct + '%' : '—'}
          color={pctColor(pct)}
        />
      </div>

      {/* Клики — целыми числами */}
      <div style={{
        display: 'flex', gap: 18, flexWrap: 'wrap',
        padding: '10px 0',
        borderTop: '1px solid ' + B.border,
        borderBottom: '1px solid ' + B.border,
        marginBottom: 16, fontSize: 13, color: B.muted,
      }}>
        <span>Попаданий: <strong style={{ color: B.text, fontWeight: 700 }}>{hits}</strong></span>
        <span>Осмысленных мимо: <strong style={{ color: B.text, fontWeight: 700 }}>{bonusCount}</strong></span>
        <span>Промахов: <strong style={{ color: B.text, fontWeight: 700 }}>{misses}</strong></span>
      </div>

      {/* Найдено */}
      {foundList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Найдено</SectionLabel>
          {foundList.map(function (f, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', fontSize: 13, color: B.text }}>
                <span style={{ color: '#1A7A3C', marginRight: 8, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ wordBreak: 'break-word' }}>{f.label}</span>
                <LevelChip level={f.level} />
              </div>
            )
          })}
        </div>
      )}

      {/* Пропущено */}
      {missedList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Пропущено</SectionLabel>
          {missedShown.map(function (m, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', fontSize: 13, color: B.muted }}>
                <span style={{ marginRight: 8, flexShrink: 0 }}>–</span>
                <span style={{ wordBreak: 'break-word' }}>{m.label}</span>
                <LevelChip level={m.level} />
              </div>
            )
          })}
          {missedList.length > 3 && (
            <button
              onClick={function () { setShowMissed(!showMissed) }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '4px 0', fontSize: 12, color: B.primary,
                fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              {showMissed ? 'Свернуть' : 'Ещё ' + (missedList.length - 3)}
            </button>
          )}
        </div>
      )}

      {/* Осмысленные наблюдения вне списка (бонус) */}
      {bonusList.length > 0 && (
        <div>
          <SectionLabel>Осмысленные наблюдения вне списка</SectionLabel>
          {bonusList.map(function (b, i) {
            const text = b.explanation || b.note || ''
            if (!text) return null
            return (
              <div key={i} style={{
                background: '#FFF6E5',
                borderLeft: '3px solid ' + B.amber,
                borderRadius: SHAPE.input,
                padding: '10px 14px', marginBottom: 8,
                fontSize: 13, color: B.text, fontStyle: 'italic',
                lineHeight: 1.5,
              }}>
                «{text}»
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

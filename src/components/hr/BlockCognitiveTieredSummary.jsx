// Блок 1 — Когнитивный для office-universal.
// Не одно число, а раскладка «докуда дошёл»: тиры + потолок + ранг в пуле + время.
// Ранг в пуле считается на лету по всем строкам листа, в Sheets не хранится.

import { B, SHAPE } from '../../utils/brand.js'
import { parseScore } from '../../utils/hr-format.js'

const TIERS = [
  { key: 'Ког. база',    label: 'База'    },
  { key: 'Ког. средний', label: 'Средний' },
  { key: 'Ког. трудный', label: 'Трудный' },
]

function colorByPct(pct) {
  if (pct === null || pct === undefined) return B.muted
  if (pct >= 70) return '#1A7A3C'
  if (pct >= 40) return '#BA7517'
  return '#9B1818'
}

function formatTime(sec) {
  const n = Number(sec)
  if (isNaN(n) || n <= 0) return '—'
  const m = Math.floor(n / 60)
  const s = String(Math.round(n % 60)).padStart(2, '0')
  return m + ':' + s
}

// Ранг в пуле по общему когнитивному баллу. Осмысленно примерно с 15 прогонов.
function poolRank(rows, row) {
  if (!Array.isArray(rows) || rows.length < 2) return null
  const scored = rows
    .map(function (r) {
      const p = parseScore(r['Когнитивный'])
      return { id: String(r['ID']), score: p ? p.score : -1 }
    })
    .filter(function (x) { return x.score >= 0 })
  if (scored.length < 2) return null
  scored.sort(function (a, b) { return b.score - a.score })
  const idx = scored.findIndex(function (x) { return x.id === String(row['ID']) })
  if (idx < 0) return null
  return { place: idx + 1, total: scored.length }
}

function Stat({ title, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 120,
      background: B.light,
      border: '1px solid ' + B.border,
      borderRadius: SHAPE.card,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, color: B.muted, textTransform: 'uppercase',
        letterSpacing: '.06em', fontWeight: 600, marginBottom: 8,
      }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || B.text, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

export default function BlockCognitiveTieredSummary({ row, rows }) {
  const total = parseScore(row['Когнитивный'])
  const ceiling = row['Ког. потолок'] || '—'
  const unanswered = Number(row['Ког. не отвечено'])
  const rank = poolRank(rows, row)

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Stat
          title="Когнитивка"
          value={total ? total.score + ' / ' + total.max : '—'}
          color={colorByPct(total && total.pct)}
        />
        <Stat title="Потолок" value={ceiling} />
        <Stat
          title="Ранг в пуле"
          value={rank ? rank.place + ' / ' + rank.total : '—'}
        />
        <Stat title="Время" value={formatTime(row['Ког. время сек'])} />
      </div>

      <div style={{
        fontSize: 11, color: B.muted, textTransform: 'uppercase',
        letterSpacing: '.06em', fontWeight: 600, marginBottom: 12,
      }}>
        Раскладка по тирам
      </div>

      {TIERS.map(function (tier) {
        const sc = parseScore(row[tier.key])
        const pct = sc ? sc.pct : 0
        return (
          <div key={tier.key} style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, color: B.muted, width: 72, flexShrink: 0 }}>
              {tier.label}
            </span>
            <div style={{
              flex: 1, height: 8, background: B.light,
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: pct + '%', height: '100%',
                background: colorByPct(pct),
              }} />
            </div>
            <span style={{ fontSize: 13, color: B.text, width: 52, textAlign: 'right', flexShrink: 0 }}>
              {sc ? sc.score + '/' + sc.max : '—'}
            </span>
          </div>
        )
      })}

      {!isNaN(unanswered) && unanswered > 0 && (
        <div style={{ fontSize: 12, color: B.muted, marginTop: 12 }}>
          Не дошёл до {unanswered} вопрос(ов) — время закончилось раньше блока.
        </div>
      )}
    </div>
  )
}

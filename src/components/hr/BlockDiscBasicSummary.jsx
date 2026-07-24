// Блок 2 — DISC для office-universal. Профиль ОПИСАТЕЛЬНЫЙ.
// Целевого профиля роли нет и вердикта «подходит / не подходит» тоже:
// характер прикладывается к текущему составу команды вручную.
// Нормализация от теоретического диапазона −6…+12 (6 зачётных групп).

import { B, SHAPE } from '../../utils/brand.js'
import { DISC_LABELS, DISC_COLOR } from '../../utils/hr-format.js'

const SCALES = ['D', 'I', 'S', 'C']

function num(v) {
  const n = Number(v)
  return isNaN(n) ? null : n
}

export default function BlockDiscBasicSummary({ row }) {
  const primary = row['DISC осн.'] || '—'
  const secondary = row['DISC втор.'] || ''
  const trapNote = String(row['DISC ловушки'] || '').trim()

  const values = {
    D: num(row['DISC D %']),
    I: num(row['DISC I %']),
    S: num(row['DISC S %']),
    C: num(row['DISC C %']),
  }
  const rawValues = {
    D: num(row['DISC D raw']),
    I: num(row['DISC I raw']),
    S: num(row['DISC S raw']),
    C: num(row['DISC C raw']),
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 18, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, color: B.muted }}>
          Профиль снят как есть — целевого шаблона для позиции нет.
        </div>
        <span style={{
          background: B.light,
          border: '1px solid ' + B.border,
          borderRadius: SHAPE.input,
          padding: '5px 12px',
          fontSize: 13, fontWeight: 700,
          color: DISC_COLOR[String(primary).charAt(0)] || B.text,
        }}>
          {primary}{secondary ? ' / ' + secondary : ''}
        </span>
      </div>

      {SCALES.map(function (k) {
        const pct = values[k]
        const raw = rawValues[k]
        return (
          <div key={k} style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          }}>
            <span style={{
              width: 18, flexShrink: 0, fontSize: 14, fontWeight: 700,
              color: DISC_COLOR[k] || B.text,
            }}>{k}</span>
            <span style={{ width: 118, flexShrink: 0, fontSize: 12, color: B.muted }}>
              {DISC_LABELS[k]}
            </span>
            <div style={{
              flex: 1, height: 8, background: B.light,
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: (pct === null ? 0 : pct) + '%', height: '100%',
                background: DISC_COLOR[k] || B.muted,
              }} />
            </div>
            <span style={{
              width: 84, textAlign: 'right', flexShrink: 0,
              fontSize: 13, color: B.text,
            }}>
              {pct === null ? '—' : pct + '%'}
              {raw === null ? '' : ' (' + (raw > 0 ? '+' : '') + raw + ')'}
            </span>
          </div>
        )
      })}

      <div style={{
        marginTop: 16,
        padding: '10px 14px',
        background: trapNote ? '#FFF6E5' : B.light,
        border: '1px solid ' + (trapNote ? B.amber : B.border),
        borderRadius: SHAPE.input,
        fontSize: 12.5,
        color: trapNote ? '#7A4D0F' : B.muted,
        lineHeight: 1.6,
      }}>
        {trapNote
          ? 'Ловушки на согласованность: ' + trapNote + '. Расхождение — повод уточнить на интервью, не отказ.'
          : 'Ловушки на согласованность: пройдены.'}
      </div>
    </div>
  )
}

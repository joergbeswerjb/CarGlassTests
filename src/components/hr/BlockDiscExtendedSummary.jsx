// Блок 2 — DISC для OD-формата. 4 горизонтальные шкалы D/I/S/C с % и raw баллами + маркеры.

import { B, SHAPE } from '../../utils/brand.js'
import { DISC_COLOR, DISC_LABELS, parseList, discColorByValue } from '../../utils/hr-format.js'

// Классификация поведенческих маркеров (бэклог №1): не все "ловушки" негативны.
// positive - подтверждённая сила; critical - жёсткий риск; прочие (по умолчанию) -
// нейтральное "внимание". Локально, т.к. это про отображение в этом блоке;
// при общем использовании вынести в hr-format.js.
const TRAP_KIND = {
  d_healthy:          'positive',
  honest:             'positive',
  passive_risk:       'critical',
  social_desirability:'critical',
}

const KIND_STYLE = {
  positive: { bg: B.greenBg, border: B.green,   fg: B.green },
  warning:  { bg: '#FFF6E5', border: '#BA7517', fg: '#7A4D0F' },
  critical: { bg: B.redBg,   border: B.red,     fg: '#7A1A1A' },
}

function ScaleBar({ letter, pct, raw }) {
  const color = DISC_COLOR[letter] || B.muted
  const fullName = DISC_LABELS[letter] || ''
  const safePct = (pct === null || pct === undefined || isNaN(Number(pct))) ? 0 : Number(pct)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontSize: 18, fontWeight: 800, color: color,
            minWidth: 16,
          }}>{letter}</span>
          <span style={{ fontSize: 13, color: B.text }}>{fullName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 11, color: B.muted }}>
            сырой: {raw !== undefined && raw !== null && raw !== '' ? raw : '—'}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: B.text, minWidth: 40, textAlign: 'right' }}>
            {safePct}%
          </span>
        </div>
      </div>
      <div style={{
        height: 10,
        background: B.light,
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid ' + B.border,
      }}>
        <div style={{
          height: '100%',
          width: Math.max(0, Math.min(100, safePct)) + '%',
          background: color,
          borderRadius: 5,
          transition: 'width .5s',
        }} />
      </div>
    </div>
  )
}

export default function BlockDiscExtendedSummary({ row }) {
  const letters = ['D', 'I', 'S', 'C']
  const primary = row['DISC осн.']
  const secondary = row['DISC втор.']
  const traps = parseList(row['DISC ловушки'])

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {letters.map(function (l) {
          return (
            <ScaleBar
              key={l}
              letter={l}
              pct={row['DISC ' + l + ' %']}
              raw={row['DISC ' + l + ' raw']}
            />
          )
        })}
      </div>

      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap',
        padding: '14px 16px',
        background: B.light,
        border: '1px solid ' + B.border,
        borderRadius: SHAPE.input,
        marginBottom: traps.length > 0 ? 14 : 0,
      }}>
        <div>
          <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
            Основной
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800,
            color: discColorByValue(primary),
          }}>{primary || '—'}</div>
        </div>
        <div style={{ width: 1, background: B.border, alignSelf: 'stretch' }} />
        <div>
          <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
            Вторичный
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800,
            color: discColorByValue(secondary),
          }}>{secondary || '—'}</div>
        </div>
      </div>

      {traps.length > 0 && (
        <div style={{
          padding: '12px 16px',
          background: B.light,
          border: '1px solid ' + B.border,
          borderRadius: SHAPE.input,
          fontSize: 13,
        }}>
          <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 8 }}>
            Маркеры по ответам ({traps.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {traps.map(function (t, i) {
              const ks = KIND_STYLE[TRAP_KIND[t] || 'warning']
              return (
                <span key={i} style={{
                  display: 'inline-block',
                  background: ks.bg,
                  border: '1px solid ' + ks.border,
                  borderRadius: 4,
                  padding: '2px 10px',
                  fontSize: 12, fontWeight: 600,
                  color: ks.fg,
                  fontFamily: 'monospace',
                }}>
                  {t}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

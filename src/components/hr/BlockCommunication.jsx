// Блок 5 — Неудобный разговор. Три сырых ответа кандидата по кейсам.
// Показываем первый кейс, остальные — по клику «ещё».

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { ShowMore } from './Collapsible.jsx'

const CASES = [
  { key: 'Комм. кейс 1', label: 'Эскалация неприятной новости',          weight: 25 },
  { key: 'Комм. кейс 2', label: 'Несогласие с руководителем по решению', weight: 50 },
  { key: 'Комм. кейс 3', label: 'Давление вниз на сотрудника',           weight: 25 },
]

const PREVIEW_N = 1

export default function BlockCommunication({ row }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? CASES : CASES.slice(0, PREVIEW_N)
  const rest = CASES.length - PREVIEW_N

  return (
    <div>
      {shown.map(function (c, i) {
        const answer = row[c.key]
        return (
          <div key={c.key} style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              marginBottom: 6,
            }}>
              <div style={{ fontSize: 12, color: B.muted, fontWeight: 600 }}>
                ▸ Кейс {i + 1} — {c.label}
              </div>
              <div style={{
                fontSize: 10, color: B.muted,
                background: B.light, padding: '1px 6px',
                borderRadius: 3,
              }}>
                вес {c.weight}%
              </div>
            </div>
            <div style={{
              background: B.light,
              border: '1px solid ' + B.border,
              borderRadius: SHAPE.input,
              padding: '12px 14px',
              fontSize: 14, color: B.text, lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              minHeight: 20,
            }}>
              {answer ? String(answer) : (
                <span style={{ color: B.muted, fontStyle: 'italic' }}>— нет ответа —</span>
              )}
            </div>
          </div>
        )
      })}

      <ShowMore
        count={rest}
        expanded={expanded}
        onToggle={function () { setExpanded(!expanded) }}
        moreLabel={'Ещё ' + rest + ' кейса'}
        lessLabel="Свернуть кейсы"
      />

      <div style={{
        marginTop: 16,
        padding: '12px 14px',
        background: '#F0F4FA',
        borderLeft: '3px solid ' + B.primary,
        borderRadius: SHAPE.input,
        fontSize: 12, color: B.muted,
      }}>
        💡 <strong style={{ color: B.text }}>AI-оценка</strong>{' '}
        будет добавлена в Части B (поиск красных флагов: токсичное давление, отсутствие готовности эскалировать, защитная реакция при поражении фактами).
      </div>
    </div>
  )
}

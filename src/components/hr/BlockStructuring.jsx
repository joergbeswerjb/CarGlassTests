// Блок 4 — Структурирование идеи. Четыре сырых ответа кандидата.
// Показываем первые 2 поля, остальные — по клику «ещё».

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { ShowMore } from './Collapsible.jsx'

const FIELDS = [
  { key: 'Структ. вопросы',      label: 'Какие ключевые вопросы задать руководителю?' },
  { key: 'Структ. декомпозиция', label: 'Декомпозиция: как разложить задачу на этапы?' },
  { key: 'Структ. первый шаг',   label: 'Первый шаг в понедельник утром' },
  { key: 'Структ. улучшение',    label: 'Чем дополнить или улучшить идею?' },
]

const PREVIEW_N = 2

export default function BlockStructuring({ row }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? FIELDS : FIELDS.slice(0, PREVIEW_N)
  const rest = FIELDS.length - PREVIEW_N

  return (
    <div>
      {shown.map(function (f) {
        const answer = row[f.key]
        return (
          <div key={f.key} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 12, color: B.muted, marginBottom: 6,
              fontWeight: 600,
            }}>
              ▸ {f.label}
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
        moreLabel={'Ещё ' + rest + ' поля'}
        lessLabel="Свернуть поля"
      />

      {/* AI оценка - заглушка */}
      <div style={{
        marginTop: 16,
        padding: '12px 14px',
        background: '#F0F4FA',
        borderLeft: '3px solid ' + B.primary,
        borderRadius: SHAPE.input,
        fontSize: 12, color: B.muted,
      }}>
        💡 <strong style={{ color: B.text }}>AI-оценка</strong>{' '}
        будет добавлена в Части B (анализ структурного мышления, признаки hands-on / hands-off диспозиции).
      </div>
    </div>
  )
}

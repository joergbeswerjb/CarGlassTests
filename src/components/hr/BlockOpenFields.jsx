// Обобщённый HR-блок открытых полей роли.
// Поля приходят из hr-config (fields: [{key, label}]), а не хардкодятся —
// переиспользуется любой ролью с открытыми ответами (CoS: кейс+EN, приоритизация).
// Сырой ответ первичен (принцип платформы).

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { ShowMore } from './Collapsible.jsx'

const PREVIEW_N = 2

export default function BlockOpenFields({ row, cfg, block }) {
  const [expanded, setExpanded] = useState(false)

  // Поля берём из описания блока в hr-config (block.fields).
  const fields = (block && block.fields) || []
  const shown = expanded ? fields : fields.slice(0, PREVIEW_N)
  const rest = fields.length - PREVIEW_N

  return (
    <div>
      {shown.map(function (f) {
        const answer = row[f.key]
        return (
          <div key={f.key} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 12, color: B.muted, marginBottom: 6, fontWeight: 600,
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
              // Моноширинный шрифт для полей, где кандидат мог строить псевдотаблицу
              fontFamily: f.mono ? "'Consolas', 'Courier New', monospace" : 'inherit',
            }}>
              {answer ? String(answer) : (
                <span style={{ color: B.muted, fontStyle: 'italic' }}>— нет ответа —</span>
              )}
            </div>
          </div>
        )
      })}

      {rest > 0 && (
        <ShowMore
          count={rest}
          expanded={expanded}
          onToggle={function () { setExpanded(!expanded) }}
          moreLabel={'Ещё ' + rest + ' поле'}
          lessLabel="Свернуть поля"
        />
      )}

      <div style={{
        marginTop: 16,
        padding: '12px 14px',
        background: '#F0F4FA',
        borderLeft: '3px solid ' + B.primary,
        borderRadius: SHAPE.input,
        fontSize: 12, color: B.muted,
      }}>
        💡 <strong style={{ color: B.text }}>AI-оценка</strong>{' '}
        генерируется в HR-конвейере (флаги, разбор ловушек кейса, оценка делового английского).
      </div>
    </div>
  )
}

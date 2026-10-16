// Блок 5, часть 1 — План заказа (логист-координатор).
// Ответы кандидата против скрытого ключа: числа проверил код при сохранении,
// здесь — наглядная сверка по позициям + эталонный расчёт + сырой комментарий.
// Ловушки: C — товар в пути, E — срок годности.

import { B, SHAPE } from '../../utils/brand.js'
import logistContent from '../../data/questions/logist-coordinator.js'

const PLAN = logistContent.ORDER_PLAN

// «A: 9 ✓; B: 0 ✓; C: 4 ✗ (эталон 0); ...» → { A: { value, ok }, ... }
function parseResult(value) {
  const out = {}
  if (!value) return out
  String(value).split(';').forEach(function (part) {
    const m = part.trim().match(/^([A-Z]):\s*([^\s]+)\s*(✓|✗)/)
    if (m) out[m[1]] = { value: m[2], ok: m[3] === '✓' }
  })
  return out
}

export default function BlockOrderPlanSummary({ row }) {
  const res = parseResult(row['План ответы'])
  const comment = row['План: комментарий']

  return (
    <div>
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, background: B.white, border: '1px solid ' + B.border }}>
          <thead>
            <tr>
              {['Позиция', 'Ответ', 'Эталон', 'Расчёт'].map(function (h) {
                return (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 10px', background: B.light,
                    borderBottom: '1px solid ' + B.border, color: B.muted, fontSize: 11.5, fontWeight: 600,
                  }}>{h}</th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {PLAN.rows.map(function (r) {
              const k = PLAN.key[r.id]
              const a = res[r.id]
              const expected = k.min === k.max ? String(k.min) : k.min + '–' + k.max
              return (
                <tr key={r.id}>
                  <td style={td}>
                    <strong>{r.name}</strong>
                    {k.trap && <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>ловушка: {k.trap}</div>}
                  </td>
                  <td style={{ ...td, fontWeight: 700, color: a ? (a.ok ? '#1A7A3C' : '#9B1818') : B.muted, whiteSpace: 'nowrap' }}>
                    {a ? a.value + (a.ok ? ' ✓' : ' ✗') : '—'}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{expected}</td>
                  <td style={{ ...td, color: B.muted, fontSize: 12 }}>{PLAN.reference[r.id]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 12, color: B.muted, marginBottom: 6, fontWeight: 600 }}>▸ Комментарий кандидата к плану</div>
      <div style={{
        background: B.light, border: '1px solid ' + B.border, borderRadius: SHAPE.input,
        padding: '12px 14px', fontSize: 14, color: B.text, lineHeight: 1.6,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {comment ? String(comment) : <span style={{ color: B.muted, fontStyle: 'italic' }}>— нет ответа —</span>}
      </div>
      <div style={{ fontSize: 12, color: B.muted, marginTop: 8, lineHeight: 1.5 }}>
        Критерий AI по комментарию: {PLAN.comment_rubric.toLowerCase()}.
      </div>
    </div>
  )
}

const td = {
  padding: '8px 10px', borderBottom: '1px solid ' + B.border, color: B.text, verticalAlign: 'top',
}

// ─── Блок: план заказа (кейс, часть 1) ───────────────────────────────────────
// Таблица позиций с параметрами запаса + числовое поле «Заказать, шт» по каждой
// позиции + обязательный комментарий к плану. Числа проверяет код по скрытому
// ключу (scoring.js → calcOrderPlanLogist), комментарий — один AI-критерий
// на бэкенде. Ноль — допустимый ответ («не заказывать»), пустое поле — нет.
// Переход к следующей части односторонний.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'

function isFilledNumber(v) {
  if (v === undefined || v === null) return false
  const s = String(v).trim()
  return s !== '' && /^\d+$/.test(s)
}

export default function BlockOrderPlan({ plan, savedAnswers, onComplete }) {
  const initialQty = {}
  plan.rows.forEach(function (r) {
    initialQty[r.id] = (savedAnswers && savedAnswers.qty && savedAnswers.qty[r.id] !== undefined)
      ? String(savedAnswers.qty[r.id]) : ''
  })
  const [qty, setQty] = useState(initialQty)
  const [comment, setComment] = useState((savedAnswers && savedAnswers.comment) || '')

  const allNumbers = plan.rows.every(function (r) { return isFilledNumber(qty[r.id]) })
  const commentOk = comment.trim().length >= plan.comment.minChars
  const canProceed = allNumbers && commentOk

  function handleQty(id, value) {
    // Только цифры: защищает от «9 шт», «~10» и т.п.
    const clean = value.replace(/[^\d]/g, '').slice(0, 4)
    const next = Object.assign({}, qty)
    next[id] = clean
    setQty(next)
  }

  function handleSubmit() {
    if (!canProceed) return
    const out = {}
    plan.rows.forEach(function (r) { out[r.id] = Number(qty[r.id]) })
    onComplete({ qty: out, comment: comment })
  }

  const cellStyle = {
    padding: '8px 10px', borderBottom: '1px solid ' + B.border,
    color: B.text, fontSize: 13.5, verticalAlign: 'middle',
  }
  const headStyle = {
    textAlign: 'left', padding: '8px 10px', background: B.light,
    borderBottom: '1px solid ' + B.border, color: B.muted,
    fontSize: 11.5, fontWeight: 600, lineHeight: 1.3, verticalAlign: 'bottom',
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>{plan.blockLabel}</p>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>Без таймера</p>
      </div>

      <h3 style={{ marginTop: 20, marginBottom: 12, fontSize: 18, color: B.text }}>{plan.title}</h3>

      <div style={{
        background: B.white, border: '1px solid ' + B.border, borderRadius: 8,
        padding: '14px 16px', marginBottom: 18, fontSize: 14, lineHeight: 1.6, color: B.text,
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: B.muted }}>📋 Правило расчёта</p>
        {plan.rules.map(function (r, i) {
          return <div key={i} style={{ marginBottom: 4 }}>{(i + 1) + '. ' + r}</div>
        })}
        <div style={{ marginTop: 8, color: B.muted, fontSize: 13 }}>{plan.intro}</div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{
          borderCollapse: 'collapse', width: '100%',
          background: B.white, border: '1px solid ' + B.border,
        }}>
          <thead>
            <tr>
              {plan.head.map(function (h, i) { return <th key={i} style={headStyle}>{h}</th> })}
              <th style={{ ...headStyle, color: B.primary }}>{plan.inputLabel}</th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map(function (r) {
              const v = qty[r.id]
              const ok = isFilledNumber(v)
              return (
                <tr key={r.id}>
                  <td style={{ ...cellStyle, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                  {r.cells.map(function (c, ci) {
                    return <td key={ci} style={cellStyle}>{c}</td>
                  })}
                  <td style={cellStyle}>
                    <input
                      inputMode="numeric"
                      value={v}
                      onChange={function (e) { handleQty(r.id, e.target.value) }}
                      placeholder="шт"
                      style={{
                        width: 64, padding: '7px 8px', fontSize: 15, fontWeight: 600,
                        textAlign: 'center', fontFamily: 'inherit', color: B.text,
                        border: (ok ? 1.5 : 1) + 'px solid ' + (ok ? B.green : B.border),
                        borderRadius: SHAPE.input, outline: 'none', background: B.white,
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12.5, color: B.muted, margin: '-10px 0 20px' }}>
        Если по позиции заказывать не нужно — укажите 0.
      </p>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: B.text }}>{plan.comment.title}</label>
          <span style={{ fontSize: 12, color: commentOk ? B.green : B.muted, whiteSpace: 'nowrap', marginLeft: 10 }}>
            {commentOk ? '✓ заполнено' : 'мин. ' + plan.comment.minChars + ' символов'}
          </span>
        </div>
        <textarea
          value={comment}
          onChange={function (e) { setComment(e.target.value) }}
          placeholder="Коротко и по существу..."
          rows={4}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14, lineHeight: 1.6,
            border: '1px solid ' + (commentOk ? B.green : B.border), borderRadius: 6,
            fontFamily: 'inherit', resize: 'vertical', background: B.white,
            color: B.text, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{
        fontSize: 12, color: '#7A4D0F', background: '#FFF6E5',
        borderLeft: '3px solid ' + B.amber, borderRadius: 6,
        padding: '8px 12px', marginTop: 8, marginBottom: 4,
      }}>
        После перехода к следующей части вернуться к этим ответам нельзя.
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 16, borderTop: '1px solid ' + B.border, marginTop: 16,
      }}>
        <span style={{ fontSize: 13, color: B.muted }}>
          {plan.rows.filter(function (r) { return isFilledNumber(qty[r.id]) }).length} из {plan.rows.length} позиций
          {commentOk ? ' · комментарий есть' : ''}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canProceed}
          style={{
            padding: '10px 28px', fontSize: 14, fontWeight: 600, border: 'none',
            borderRadius: SHAPE.asymmetric,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? B.primary : B.border,
            color: canProceed ? B.white : B.muted,
            fontFamily: 'inherit',
          }}
        >
          Дальше →
        </button>
      </div>
    </div>
  )
}

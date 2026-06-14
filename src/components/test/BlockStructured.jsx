// ─── Блок 4: Структурирование сырой идеи ─────────────────────────────────────
// 4 открытых поля, минимум 30 символов на каждое.
// Кнопка «Дальше» неактивна, пока не все поля заполнены.
// Переход к Блоку 5 односторонний — предупреждаем заранее.

import { useState } from 'react'
import { B } from '../../utils/brand.js'
import BrandedButton from '../BrandedButton.jsx'

export default function BlockStructured({ caseData, savedAnswers, onComplete }) {
  // Инициализируем ответы — либо из сохранённого прогресса, либо пустые
  const initial = caseData.fields.reduce((acc, f) => {
    acc[f.id] = (savedAnswers && savedAnswers[f.id]) || ''
    return acc
  }, {})
  const [answers, setAnswers] = useState(initial)
  const [focused, setFocused] = useState(null)

  // Проверка готовности кнопки «Дальше»
  const allFilled = caseData.fields.every(f =>
    (answers[f.id] || '').trim().length >= f.minChars
  )
  const filledCount = caseData.fields.filter(f =>
    (answers[f.id] || '').trim().length >= f.minChars
  ).length

  function handleChange(fieldId, value) {
    setAnswers({ ...answers, [fieldId]: value })
  }

  function handleSubmit() {
    if (!allFilled) return
    onComplete(answers)
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Шапка блока */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>Блок 4 из 5 · Структурирование идеи</p>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>Без таймера</p>
      </div>

      {/* Сообщение от руководителя — стиль мессенджера */}
      <h3 style={{ marginTop: 20, marginBottom: 12, fontSize: 18, color: B.text }}>{caseData.title}</h3>
      <div style={{
        background: B.white,
        border: `1px solid ${B.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 24,
        fontSize: 14,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: B.muted }}>📱 Сообщение от руководителя</p>
        {caseData.message}
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20, color: B.text }}>
        {caseData.introBeforeFields}
      </p>

      {/* 4 поля */}
      {caseData.fields.map((field, idx) => {
        const value = answers[field.id] || ''
        const chars = value.trim().length
        const isFilled = chars >= field.minChars
        const isFocused = focused === field.id

        const borderColor = isFilled ? B.green : (isFocused ? B.red : B.border)
        const statusText = isFilled
          ? `✓ ${chars} символов`
          : `${chars} / ${field.minChars} символов`
        const statusColor = isFilled ? B.green : (chars > 0 ? '#BA7517' : B.muted)

        return (
          <div key={field.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: B.text }}>
                {field.title}
              </label>
              <span style={{ fontSize: 12, color: statusColor }}>
                {isFilled ? '✓ заполнено' : `мин. ${field.minChars} символов`}
              </span>
            </div>
            <textarea
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              onFocus={() => setFocused(field.id)}
              onBlur={() => setFocused(null)}
              placeholder="Опишите развёрнуто..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                lineHeight: 1.6,
                border: `${isFocused ? 2 : 1}px solid ${borderColor}`,
                borderRadius: 6,
                fontFamily: 'inherit',
                resize: 'vertical',
                background: B.white,
                color: B.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: statusColor }}>{statusText}</span>
            </div>
          </div>
        )
      })}

      {/* Предупреждение об одностороннем переходе */}
      <div style={{
        fontSize: 12, color: '#7A4D0F',
        background: '#FFF6E5',
        borderLeft: '3px solid ' + B.amber,
        borderRadius: 6,
        padding: '8px 12px', marginTop: 8, marginBottom: 4,
      }}>
        После перехода к следующему блоку вернуться к этим ответам нельзя.
      </div>

      {/* Кнопка «Дальше» */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTop: `1px solid ${B.border}`,
        marginTop: 16,
      }}>
        <span style={{ fontSize: 13, color: B.muted }}>
          {filledCount} из {caseData.fields.length} полей заполнены
        </span>
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          style={{
            padding: '10px 28px',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            borderRadius: '12px 0 12px 0',
            cursor: allFilled ? 'pointer' : 'not-allowed',
            background: allFilled ? B.primary : B.border,
            color: allFilled ? B.white : B.muted,
            transition: 'all .2s',
            fontFamily: 'inherit',
          }}
        >
          Дальше →
        </button>
      </div>
    </div>
  )
}

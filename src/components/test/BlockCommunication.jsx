// ─── Блок 5: Неудобный разговор ──────────────────────────────────────────────
// 3 кейса последовательно. Минимум 50 символов на ответ.
// Возврат между кейсами ЗАПРЕЩЁН. Подтверждение перед переходом.

import { useState } from 'react'
import { B } from '../../utils/brand.js'

export default function BlockCommunication({ cases, savedAnswers, onComplete }) {
  // Сохранённые ответы — массив, по индексу кейса
  const [answers, setAnswers] = useState(savedAnswers || cases.map(() => ''))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  const current = cases[currentIdx]
  const currentAnswer = answers[currentIdx] || ''
  const chars = currentAnswer.trim().length
  const isFilled = chars >= current.minChars
  const isLast = currentIdx === cases.length - 1

  function handleChange(value) {
    const next = [...answers]
    next[currentIdx] = value
    setAnswers(next)
  }

  function handleNextClick() {
    if (!isFilled) return
    setShowConfirm(true)
  }

  function handleConfirmNext() {
    setShowConfirm(false)
    if (isLast) {
      // Все кейсы пройдены — финализируем блок
      const result = cases.map((c, i) => ({
        caseId: c.id,
        answer: answers[i],
      }))
      onComplete(result)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  function handleCancelConfirm() {
    setShowConfirm(false)
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Шапка блока */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
          Блок 5 из 5 · Кейс {currentIdx + 1} из {cases.length}
        </p>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>Без таймера</p>
      </div>

      {/* Прогресс по кейсам внутри блока */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0 24px' }}>
        {cases.map((c, i) => {
          const isCompleted = i < currentIdx
          const isActive    = i === currentIdx
          const bg = isCompleted ? B.greenBg : (isActive ? '#FFF3F3' : B.light)
          const color = isCompleted ? B.green : (isActive ? B.primary : B.muted)
          const border = isActive ? `2px solid ${B.primary}` : `1px solid ${B.border}`

          return (
            <div key={c.id} style={{
              flex: 1,
              padding: '8px 10px',
              background: bg,
              color,
              border,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              textAlign: 'center',
            }}>
              {isCompleted ? '✓ ' : ''}Кейс {i + 1} — {c.title.length > 20 ? c.title.slice(0, 18) + '…' : c.title}
            </div>
          )
        })}
      </div>

      {/* Кейс */}
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: B.text }}>
        {current.title}
      </h3>
      <div style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: B.text,
        marginBottom: 16,
        whiteSpace: 'pre-wrap',
      }}>
        {current.scenario}
      </div>

      {/* Задание */}
      <div style={{
        background: '#E6F1FB',
        color: '#0C447C',
        borderRadius: 6,
        padding: '12px 14px',
        marginBottom: 16,
      }}>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500 }}>{current.prompt}</p>
        <p style={{ margin: 0, fontSize: 13 }}>
          Напишите так, как реально произнесёте — конкретные фразы, которые скажете. Не «опишите подход» — текст разговора.
        </p>
      </div>

      {/* Поле ответа */}
      <textarea
        value={currentAnswer}
        onChange={e => handleChange(e.target.value)}
        placeholder="Начните писать..."
        rows={8}
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: 14,
          lineHeight: 1.7,
          border: `2px solid ${isFilled ? B.green : B.primary}`,
          borderRadius: 6,
          fontFamily: 'inherit',
          resize: 'vertical',
          background: B.white,
          color: B.text,
          outline: 'none',
          minHeight: 160,
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: B.muted }}>Минимум {current.minChars} символов</span>
        <span style={{ fontSize: 12, color: isFilled ? B.green : '#BA7517' }}>
          {chars} / {current.minChars} {isFilled ? '✓' : ''}
        </span>
      </div>

      {/* Кнопка */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 16,
        borderTop: `1px solid ${B.border}`,
      }}>
        <button
          onClick={handleNextClick}
          disabled={!isFilled}
          style={{
            padding: '10px 28px',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            borderRadius: 6,
            cursor: isFilled ? 'pointer' : 'not-allowed',
            background: isFilled ? B.primary : B.border,
            color: isFilled ? B.white : B.muted,
            transition: 'all .2s',
          }}
        >
          {isLast ? 'Завершить блок →' : `К кейсу ${currentIdx + 2} →`}
        </button>
      </div>

      {/* Модалка подтверждения */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            background: B.white,
            borderRadius: 8,
            padding: 24,
            maxWidth: 420,
            width: '100%',
          }}>
            <h4 style={{ marginTop: 0, marginBottom: 12, fontSize: 17 }}>
              {isLast ? 'Завершить блок?' : 'Перейти к следующему кейсу?'}
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: B.text, marginBottom: 20 }}>
              {isLast
                ? 'После завершения вернуться к этому ответу будет нельзя.'
                : 'После перехода вернуться к этому кейсу будет нельзя — это сознательное ограничение, чтобы оценить вашу первую реакцию.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelConfirm}
                style={{
                  padding: '8px 20px',
                  fontSize: 14,
                  border: `1px solid ${B.border}`,
                  borderRadius: 6,
                  background: 'transparent',
                  color: B.text,
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmNext}
                style={{
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: 6,
                  background: B.red,
                  color: B.white,
                  cursor: 'pointer',
                }}
              >
                {isLast ? 'Завершить' : 'Перейти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Блок 1 (OD): Когнитивный с пулами и таймером ────────────────────────────
// Случайная выборка из банка по квотам. DATA-задачи (required) — обязательны все.
// Жёсткий таймер, переход к следующему вопросу — сразу после ответа.

import { useState, useEffect, useMemo } from 'react'
import { B } from '../../utils/brand.js'

function pickQuestions(bank, config) {
  const byCategory = {}
  bank.forEach(q => {
    if (!byCategory[q.cat]) byCategory[q.cat] = []
    byCategory[q.cat].push(q)
  })

  const selected = []
  Object.entries(config.quotas).forEach(([cat, count]) => {
    const pool = byCategory[cat] || []
    if (count === 'all') {
      selected.push(...pool.filter(q => q.required))
    } else {
      // Перемешиваем и берём count штук
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      selected.push(...shuffled.slice(0, count))
    }
  })

  // Финальный шафл, чтобы DATA не шли подряд
  return selected.sort(() => Math.random() - 0.5)
}

export default function BlockCognitiveOD({ bank, config, savedState, onComplete }) {
  // Выбираем вопросы один раз при монтировании (или восстанавливаем из сохранённого)
  const questions = useMemo(() => {
    if (savedState && savedState.questions) return savedState.questions
    return pickQuestions(bank, config)
  }, [])

  const [currentIdx, setCurrentIdx] = useState(savedState?.currentIdx || 0)
  const [answers,    setAnswers]    = useState(savedState?.answers    || [])
  const [timeLeft,   setTimeLeft]   = useState(savedState?.timeLeft ?? config.timeLimitSec)

  // Таймер
  useEffect(() => {
    if (timeLeft <= 0) {
      // Время вышло — финализируем с тем, что есть
      finalize(false)
      return
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  function finalize(inTime) {
    const result = {
      questions,
      answers,
      timeOk: inTime,
      totalTime: config.timeLimitSec - timeLeft,
    }
    onComplete(result)
  }

  function handleAnswer(answerIdx) {
    const current = questions[currentIdx]
    const next = [...answers, {
      questionId: current.id,
      cat: current.cat,
      selected: answerIdx,
      correct: current.a,
      isCorrect: answerIdx === current.a,
    }]
    setAnswers(next)

    if (currentIdx + 1 >= questions.length) {
      // Последний вопрос — финализируем
      const result = {
        questions,
        answers: next,
        timeOk: timeLeft > 0,
        totalTime: config.timeLimitSec - timeLeft,
      }
      onComplete(result)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const current = questions[currentIdx]
  const progress = ((currentIdx) / questions.length) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')
  const timerColor = timeLeft < 60 ? B.red : (timeLeft < 180 ? '#BA7517' : B.muted)

  return (
    <div style={{ padding: '1rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Шапка с таймером */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
          Блок 1 из 5 · Вопрос {currentIdx + 1} из {questions.length}
        </p>
        <p style={{ fontSize: 13, color: timerColor, fontWeight: 600, margin: 0 }}>
          ⏱ Осталось на блок: {minutes}:{seconds}
        </p>
      </div>

      {/* Прогресс */}
      <div style={{ height: 3, background: B.border, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          height: 3, background: B.primary, width: progress + '%',
          borderRadius: 2, transition: 'width .3s',
        }} />
      </div>

      {/* Одноразовое info-сообщение на первом вопросе */}
      {currentIdx === 0 && (
        <div style={{
          background: '#E6F1FB',
          color: '#0C447C',
          borderRadius: 6,
          padding: '10px 14px',
          marginBottom: 20,
          fontSize: 13,
          lineHeight: 1.5,
        }}>
          Таймер идёт на <strong>весь блок</strong> ({Math.floor(config.timeLimitSec / 60)} мин на {questions.length} вопросов), а не на каждый вопрос. Отвечайте в своём темпе.
        </div>
      )}

      {/* Вопрос */}
      <h3 style={{ fontSize: 16, lineHeight: 1.6, color: B.text, marginTop: 0, marginBottom: 24 }}>
        {current.q}
      </h3>

      {/* Варианты */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {current.o.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            style={{
              padding: '14px 16px',
              fontSize: 15,
              textAlign: 'left',
              background: B.white,
              border: `1px solid ${B.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              color: B.text,
              transition: 'all .15s',
              fontFamily: 'inherit',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = B.primary}
            onMouseOut={e =>  e.currentTarget.style.borderColor = B.border}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

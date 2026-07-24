// ─── Блок 1 (office-universal): Когнитивный по тирам ─────────────────────────
// Тиры идут по нарастанию сложности и НЕ перемешиваются между собой —
// иначе теряется смысл «докуда дошёл кандидат».
// Внутри тира вопросы перемешиваются, варианты ответов тоже.
// Правильный ответ хранится по индексу исходного варианта, а не по букве:
// после шафла «правильный — б» стало бы молчаливо неверным.

import { useState, useEffect, useMemo } from 'react'
import { B } from '../../utils/brand.js'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

// Сборка порядка: тиры по порядку, внутри тира шафл, варианты — шафл с сохранением индекса
function buildQuestions(bank, config) {
  const ordered = []
  config.tierOrder.forEach(function (tier) {
    const pool = bank.filter(function (q) { return q.tier === tier })
    shuffle(pool).forEach(function (q) {
      const opts = q.o.map(function (text, idx) { return { idx: idx, text: text } })
      ordered.push({
        id: q.id,
        tier: q.tier,
        q: q.q,
        correct: q.a,
        opts: config.shuffleOptions ? shuffle(opts) : opts,
      })
    })
  })
  return ordered
}

export default function BlockCognitiveTiered({ bank, config, savedState, onComplete }) {
  const questions = useMemo(function () {
    if (savedState && savedState.questions) return savedState.questions
    return buildQuestions(bank, config)
  }, [])

  const [currentIdx, setCurrentIdx] = useState((savedState && savedState.currentIdx) || 0)
  const [answers, setAnswers] = useState((savedState && savedState.answers) || [])
  const [timeLeft, setTimeLeft] = useState(
    savedState && savedState.timeLeft !== undefined ? savedState.timeLeft : config.timeLimitSec
  )

  useEffect(function () {
    if (timeLeft <= 0) {
      finalize(answers, false)
      return
    }
    const t = setTimeout(function () { setTimeLeft(timeLeft - 1) }, 1000)
    return function () { clearTimeout(t) }
  }, [timeLeft])

  function finalize(finalAnswers, inTime) {
    onComplete({
      questions: questions,
      answers: finalAnswers,
      timeOk: inTime,
      totalTime: config.timeLimitSec - timeLeft,
      unanswered: questions.length - finalAnswers.length,
    })
  }

  function handleAnswer(optIdx) {
    const current = questions[currentIdx]
    const next = answers.concat([{
      questionId: current.id,
      tier: current.tier,
      selected: optIdx,
      correct: current.correct,
      isCorrect: optIdx === current.correct,
    }])
    setAnswers(next)

    if (currentIdx + 1 >= questions.length) {
      finalize(next, timeLeft > 0)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const current = questions[currentIdx]
  if (!current) return null

  const progress = (currentIdx / questions.length) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = String(timeLeft % 60).padStart(2, '0')
  const timerColor = timeLeft < 60 ? B.red : (timeLeft < 180 ? '#BA7517' : B.muted)

  return (
    <div style={{ padding: '1rem', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
          Блок 1 из 2 · Вопрос {currentIdx + 1} из {questions.length}
        </p>
        <p style={{ fontSize: 13, color: timerColor, fontWeight: 600, margin: 0 }}>
          Осталось на блок: {minutes}:{seconds}
        </p>
      </div>

      <div style={{ height: 3, background: B.border, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          height: 3, background: B.primary, width: progress + '%',
          borderRadius: 2, transition: 'width .3s',
        }} />
      </div>

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
          Таймер идёт на <strong>весь блок</strong> ({Math.floor(config.timeLimitSec / 60)} мин
          на {questions.length} вопросов), а не на каждый вопрос. Вопросы идут от простых
          к сложным — если застряли, лучше выбрать вариант и двигаться дальше.
        </div>
      )}

      <h3 style={{ fontSize: 16, lineHeight: 1.6, color: B.text, marginTop: 0, marginBottom: 24 }}>
        {current.q}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {current.opts.map(function (opt) {
          return (
            <button
              key={opt.idx}
              onClick={function () { handleAnswer(opt.idx) }}
              style={{
                padding: '14px 16px',
                fontSize: 15,
                textAlign: 'left',
                background: B.white,
                border: '1px solid ' + B.border,
                borderRadius: 6,
                cursor: 'pointer',
                color: B.text,
                transition: 'all .15s',
                fontFamily: 'inherit',
              }}
              onMouseOver={function (e) { e.currentTarget.style.borderColor = B.primary }}
              onMouseOut={function (e) { e.currentTarget.style.borderColor = B.border }}
            >
              {opt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}

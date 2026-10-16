// ─── Блок: ситуационный ролевой банк (MCQ с таймером) ────────────────────────
// Используется ролью «Логист-координатор» (Блок 2). Отличия от когнитивных блоков:
//   - вопросы и варианты перемешиваются (config.shuffleQuestions / shuffleOptions);
//   - правильный ответ и knockout-варианты хранятся по ИНДЕКСУ исходного
//     варианта, а не по позиции на экране — шафл не ломает скоринг;
//   - вопрос может содержать таблицу (q.table: { head, rows }) для сверки;
//   - бонусные вопросы (q.bonus) идут вперемешку с остальными, кандидат их не
//     отличает; из процента их исключает скоринг.
// Переход к следующему вопросу — сразу после ответа. Таймер на весь блок.

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

function buildQuestions(bank, config) {
  const ordered = config.shuffleQuestions ? shuffle(bank) : bank.slice()
  return ordered.map(function (q) {
    const opts = q.o.map(function (text, idx) { return { idx: idx, text: text } })
    return {
      id: q.id,
      comp: q.comp,
      bonus: !!q.bonus,
      q: q.q,
      table: q.table || null,
      correct: q.a,
      ko: q.ko || [],
      opts: config.shuffleOptions ? shuffle(opts) : opts,
    }
  })
}

function QuestionTable({ table }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
      <table style={{
        borderCollapse: 'collapse', width: '100%', fontSize: 14,
        background: B.white, border: '1px solid ' + B.border,
      }}>
        <thead>
          <tr>
            {table.head.map(function (h, i) {
              return (
                <th key={i} style={{
                  textAlign: 'left', padding: '8px 12px', background: B.light,
                  borderBottom: '1px solid ' + B.border, color: B.muted,
                  fontSize: 12, fontWeight: 600,
                }}>{h}</th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(function (r, ri) {
            return (
              <tr key={ri}>
                {r.map(function (c, ci) {
                  return (
                    <td key={ci} style={{
                      padding: '8px 12px', borderBottom: '1px solid ' + B.border,
                      color: B.text, fontFamily: "'Consolas', 'Courier New', monospace",
                    }}>{c}</td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function BlockSituational({ bank, config, savedState, onComplete }) {
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
      comp: current.comp,
      bonus: current.bonus,
      selected: optIdx,
      correct: current.correct,
      isCorrect: optIdx === current.correct,
      isKnockout: current.ko.indexOf(optIdx) >= 0,
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
          {config.blockLabel || 'Блок 2'} · Вопрос {currentIdx + 1} из {questions.length}
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
          Рабочие ситуации склада и снабжения. В каждой выберите действие, которое считаете
          правильным. Таймер идёт на <strong>весь блок</strong> ({Math.floor(config.timeLimitSec / 60)} мин
          на {questions.length} вопросов).
        </div>
      )}

      <h3 style={{ fontSize: 16, lineHeight: 1.6, color: B.text, marginTop: 0, marginBottom: 20 }}>
        {current.q}
      </h3>

      {current.table && <QuestionTable table={current.table} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {current.opts.map(function (opt) {
          return (
            <button
              key={opt.idx}
              onClick={function () { handleAnswer(opt.idx) }}
              style={{
                padding: '14px 16px',
                fontSize: 15,
                lineHeight: 1.45,
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

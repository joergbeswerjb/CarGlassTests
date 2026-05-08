import { useState, useEffect, useRef } from 'react'
import { B } from '../../utils/brand.js'

const LETTERS = ['A', 'B', 'C', 'D']
const TIMER_SECONDS = 720 // 12 минут

const T = {
  ru: { block: 'Блок 1 — Когнитивный', qof: 'Вопрос', of: 'из', skip: 'Пропустить', next: 'Далее →' },
  kz: { block: '1-блок — Танымдық',   qof: 'Сұрақ',   of: 'ішінен', skip: 'Өткізу', next: 'Келесі →' },
}

export default function BlockCognitive({ questions, lang, onComplete }) {
  const [idx,      setIdx]      = useState(0)
  const [answers,  setAnswers]  = useState([]) // [{selected, correct}]
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const timerRef = useRef(null)
  const t = T[lang]

  // Таймер
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          finish([...answers, { selected: -1, correct: questions[idx].a }])
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  const timerWarn = timeLeft <= 60

  function finish(finalAnswers) {
    clearInterval(timerRef.current)
    onComplete(finalAnswers)
  }

  function go(skipCurrent = false) {
    const sel = skipCurrent ? -1 : selected
    const newAnswers = [...answers, { selected: sel, correct: questions[idx].a }]

    if (idx + 1 >= questions.length) {
      finish(newAnswers)
    } else {
      setAnswers(newAnswers)
      setIdx(idx + 1)
      setSelected(null)
    }
  }

  const q = questions[idx]
  const progress = Math.round(((idx + 1) / questions.length) * 100)

  return (
    <div style={{ background: B.white, border: `.5px solid ${B.border}`, borderTop: 'none', padding: '1.5rem 1.25rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          display: 'inline-flex', background: B.red, color: '#fff',
          fontSize: 10, fontWeight: 500, letterSpacing: '.08em',
          textTransform: 'uppercase', padding: '3px 10px',
        }}>
          {t.block}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: timerWarn ? B.red : B.muted,
          background: timerWarn ? '#FFF3F3' : B.light,
          border: `1px solid ${timerWarn ? B.red : B.border}`,
          padding: '4px 12px',
        }}>
          {timerStr}
        </div>
      </div>

      {/* Sub-progress bar */}
      <div style={{ height: 2, background: B.border, marginBottom: 16 }}>
        <div style={{ height: 2, width: progress + '%', background: B.red, transition: 'width .3s' }} />
      </div>

      <div style={{ fontSize: 12, color: B.muted, fontWeight: 500, marginBottom: 8 }}>
        {t.qof} {idx + 1} {t.of} {questions.length}
      </div>

      <div style={{ fontSize: 15, color: B.text, lineHeight: 1.65, marginBottom: '1.1rem' }}>
        {q.q[lang]}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: '1.25rem' }}>
        {q.o[lang].map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: '10px 14px',
              border: `1px solid ${selected === i ? B.red : B.border}`,
              background: selected === i ? '#FFF0F0' : B.white,
              fontSize: 13, color: B.text, cursor: 'pointer',
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <span style={{
              width: 20, height: 20, flexShrink: 0,
              border: `1px solid ${selected === i ? B.red : B.border}`,
              background: selected === i ? B.red : 'transparent',
              color: selected === i ? '#fff' : B.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 500,
            }}>
              {LETTERS[i]}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={() => go(true)}
          style={{
            padding: '9px 20px', background: B.light, color: B.muted,
            border: `1px solid ${B.border}`, fontSize: 13, cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {t.skip}
        </button>
        <button
          onClick={() => go(false)}
          style={{
            padding: '9px 20px', background: B.red, color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {t.next}
        </button>
      </div>
    </div>
  )
}

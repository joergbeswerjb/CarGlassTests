import { useState } from 'react'
import { B } from '../../utils/brand.js'

const T = {
  ru: {
    block: 'Блок 2 — Личностный профиль',
    qof: 'Вопрос', of: 'из',
    most: 'Наиболее похоже на меня',
    least: 'Наименее похоже на меня',
    next: 'Далее →',
    noMost: 'Выберите наиболее похожее утверждение (зелёный)',
  },
  kz: {
    block: '2-блок — Тұлғалық профиль',
    qof: 'Сұрақ', of: 'ішінен',
    most: 'Маған ең ұқсас',
    least: 'Маған ең аз ұқсас',
    next: 'Келесі →',
    noMost: 'Ең ұқсасын таңдаңыз (жасыл)',
  },
}

export default function BlockDisc({ questions, lang, onComplete }) {
  const [idx,     setIdx]     = useState(0)
  const [answers, setAnswers] = useState([]) // [{most, least, options}]
  const [most,    setMost]    = useState(null)
  const [least,   setLeast]   = useState(null)
  const t = T[lang]

  function handleClick(i) {
    if (most === i)       { setMost(null);  return }
    if (least === i)      { setLeast(null); return }
    if (most === null)    { setMost(i);     return }
    if (least === null && i !== most) { setLeast(i); return }
  }

  function next() {
    if (most === null) { alert(t.noMost); return }

    const q = questions[idx]
    const newAnswers = [...answers, { most, least, options: q.o }]

    if (idx + 1 >= questions.length) {
      onComplete(newAnswers)
    } else {
      setAnswers(newAnswers)
      setIdx(idx + 1)
      setMost(null)
      setLeast(null)
    }
  }

  const q = questions[idx]
  const progress = Math.round(((idx + 1) / questions.length) * 100)

  function optStyle(i) {
    const isMost  = most  === i
    const isLeast = least === i
    return {
      padding: '10px 12px',
      border: `${isMost ? 2 : isLeast ? 2 : 1}px solid ${isMost ? B.green : isLeast ? B.red : B.border}`,
      background: isMost ? B.greenBg : isLeast ? '#FFF0F0' : B.white,
      color: isMost ? B.green : isLeast ? B.red : B.text,
      fontSize: 13, cursor: 'pointer', textAlign: 'left',
      fontFamily: 'Arial, sans-serif', lineHeight: 1.4,
    }
  }

  return (
    <div style={{ background: B.white, border: `.5px solid ${B.border}`, borderTop: 'none', padding: '1.5rem 1.25rem' }}>
      {/* Tag */}
      <div style={{
        display: 'inline-flex', background: B.red, color: '#fff',
        fontSize: 10, fontWeight: 500, letterSpacing: '.08em',
        textTransform: 'uppercase', padding: '3px 10px', marginBottom: 10,
      }}>
        {t.block}
      </div>

      {/* Progress */}
      <div style={{ height: 2, background: B.border, marginBottom: 10 }}>
        <div style={{ height: 2, width: progress + '%', background: B.red, transition: 'width .3s' }} />
      </div>

      <div style={{ fontSize: 12, color: B.muted, fontWeight: 500, marginBottom: 8 }}>
        {t.qof} {idx + 1} {t.of} {questions.length}
      </div>

      <div style={{ fontSize: 15, color: B.text, lineHeight: 1.65, marginBottom: '1rem' }}>
        {q.q[lang]}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: B.muted }}>
          <div style={{ width: 10, height: 10, background: B.green }} />
          {t.most}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: B.muted }}>
          <div style={{ width: 10, height: 10, background: B.red }} />
          {t.least}
        </div>
      </div>

      {/* Options — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: '1.25rem' }}>
        {q.o.map((opt, i) => (
          <button key={i} onClick={() => handleClick(i)} style={optStyle(i)}>
            {opt[lang]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={next}
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

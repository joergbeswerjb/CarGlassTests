// ─── Блок 2 (OD): DISC ────────────────────────────────────────────────────────
// 8 фиксированных групп (6 ipsative + 2 ловушки), выбор most/least.
// Нет правильных/неправильных ответов — оцениваем поведенческий стиль.
// «Меньше всего» нейтрального (сланцевого) цвета, не красного: это не «ошибка».

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import BrandedButton from '../BrandedButton.jsx'

const SLATE    = '#5E6B7A'
const SLATE_BG = '#EDF0F4'

export default function BlockDiscOD({ questions, savedState, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(savedState?.currentIdx || 0)
  const [answers,    setAnswers]    = useState(savedState?.answers    || [])
  const [most,       setMost]       = useState(null)
  const [least,      setLeast]      = useState(null)

  const current = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1
  const canProceed = most !== null && least !== null && most !== least

  function handleNext() {
    if (!canProceed) return

    const newAnswer = {
      groupId: current.id,
      type: current.type,
      most,
      least,
      options: current.options,  // сохраняем для скоринга
    }
    const next = [...answers, newAnswer]
    setAnswers(next)

    if (isLast) {
      onComplete(next)
    } else {
      setCurrentIdx(currentIdx + 1)
      setMost(null)
      setLeast(null)
    }
  }

  const progress = ((currentIdx) / questions.length) * 100

  return (
    <div style={{ padding: '1rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
          Блок 2 из 5 · Группа {currentIdx + 1} из {questions.length}
        </p>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>Без таймера</p>
      </div>

      {/* Прогресс */}
      <div style={{ height: 3, background: B.border, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          height: 3, background: B.primary, width: progress + '%',
          borderRadius: 2, transition: 'width .3s',
        }} />
      </div>

      <h3 style={{ fontSize: 16, lineHeight: 1.5, color: B.text, marginTop: 0, marginBottom: 8 }}>
        {current.intro}
      </h3>

      <p style={{ fontSize: 13, color: B.muted, marginBottom: 6, lineHeight: 1.6 }}>
        Здесь нет правильных и неправильных ответов — мы оцениваем поведенческий стиль. Отвечайте как есть.
      </p>
      <p style={{ fontSize: 14, color: B.text, marginBottom: 20, lineHeight: 1.6 }}>
        Отметьте <strong style={{ color: B.green }}>одно</strong> утверждение «Больше всего» похоже на вас и{' '}
        <strong style={{ color: SLATE }}>одно</strong> — «Меньше всего».
      </p>

      {/* Варианты */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {current.options.map((opt, i) => {
          const isMost  = most === i
          const isLeast = least === i
          const bg = isMost ? B.greenBg : (isLeast ? SLATE_BG : B.white)
          const border = isMost ? B.green : (isLeast ? SLATE : B.border)

          return (
            <div key={i} style={{
              padding: '12px 14px',
              background: bg,
              border: `${(isMost || isLeast) ? 2 : 1}px solid ${border}`,
              borderRadius: SHAPE.card,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: B.text, flex: 1 }}>
                {opt.text}
              </span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    if (least === i) setLeast(null)
                    setMost(isMost ? null : i)
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1.5px solid ${isMost ? B.green : B.border}`,
                    background: isMost ? B.green : B.white,
                    color: isMost ? B.white : B.muted,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Больше
                </button>
                <button
                  onClick={() => {
                    if (most === i) setMost(null)
                    setLeast(isLeast ? null : i)
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1.5px solid ${isLeast ? SLATE : B.border}`,
                    background: isLeast ? SLATE : B.white,
                    color: isLeast ? B.white : B.muted,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Меньше
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: 16,
        borderTop: `1px solid ${B.border}`,
      }}>
        <BrandedButton onClick={handleNext} disabled={!canProceed}>
          {isLast ? 'Завершить блок →' : 'Дальше →'}
        </BrandedButton>
      </div>
    </div>
  )
}

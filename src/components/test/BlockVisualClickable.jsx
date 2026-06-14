// ─── Блок 3: Визуальный с кликом по фото ────────────────────────────────────
// Кандидат ставит пин на то, что заметил, и обязательно описывает (≥ 20 символов).
// Привязки к зонам НЕТ — пин это просто указатель (x/y для HR), а оценка ответа
// идёт по тексту примечания в AI-слое (сверка с скрытым эталоном сцены).
// Лимит 10 отметок на сцену. Неописанные подсвечиваются оранжевым.

import { useState, useRef } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import BrandedButton from '../BrandedButton.jsx'

const MAX_MARKS_PER_SCENE  = 10
const MIN_EXPLANATION_CHARS = 20

export default function BlockVisualClickable({ scenes, savedAnswers, onComplete }) {
  const [sceneIdx, setSceneIdx]           = useState(0)
  const [marks, setMarks]                 = useState(savedAnswers || scenes.map(() => []))
  const [activeMarkIdx, setActiveMarkIdx] = useState(null)
  const [limitFlash, setLimitFlash]       = useState(false)
  const imgRef = useRef(null)

  const currentScene = scenes[sceneIdx]
  const currentMarks = marks[sceneIdx] || []
  const isLastScene  = sceneIdx === scenes.length - 1

  const describedCount = currentMarks.filter(m =>
    (m.explanation || '').trim().length >= MIN_EXPLANATION_CHARS
  ).length
  const allDescribed = currentMarks.length > 0 && describedCount === currentMarks.length
  const limitReached = currentMarks.length >= MAX_MARKS_PER_SCENE

  function handleImageClick(e) {
    if (!imgRef.current) return
    if (limitReached) {
      setLimitFlash(true)
      setTimeout(() => setLimitFlash(false), 1200)
      return
    }
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    // Пин — просто указатель. Никакой привязки к зонам нарушений.
    const newMark = {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      explanation: '',
    }
    const next = [...marks]
    next[sceneIdx] = [...currentMarks, newMark]
    setMarks(next)
    setActiveMarkIdx(currentMarks.length)
  }

  function updateExplanation(markIdx, text) {
    const next = [...marks]
    next[sceneIdx] = [...currentMarks]
    next[sceneIdx][markIdx] = { ...next[sceneIdx][markIdx], explanation: text }
    setMarks(next)
  }

  function removeMark(markIdx) {
    const next = [...marks]
    next[sceneIdx] = currentMarks.filter((_, i) => i !== markIdx)
    setMarks(next)
    if (activeMarkIdx === markIdx) setActiveMarkIdx(null)
    else if (activeMarkIdx > markIdx) setActiveMarkIdx(activeMarkIdx - 1)
  }

  function handleNext() {
    if (!allDescribed) return
    if (isLastScene) {
      onComplete(marks)
    } else {
      setSceneIdx(sceneIdx + 1)
      setActiveMarkIdx(null)
    }
  }

  const activeMark = activeMarkIdx !== null ? currentMarks[activeMarkIdx] : null

  function markerStyle(mark, idx) {
    const hasExpl = (mark.explanation || '').trim().length >= MIN_EXPLANATION_CHARS
    const isActive = activeMarkIdx === idx
    if (isActive)      return { background: B.red,   borderColor: '#791F1F', color: B.white }
    if (!hasExpl)      return { background: B.amber, borderColor: '#7A4D0F', color: B.white }
    return                    { background: B.white, borderColor: B.dark,    color: B.dark  }
  }

  function rowStyle(mark, idx) {
    const hasExpl = (mark.explanation || '').trim().length >= MIN_EXPLANATION_CHARS
    const isActive = activeMarkIdx === idx
    if (isActive)      return { bg: '#E6F1FB',  border: '2px solid ' + B.primary, badgeBg: B.red,   badgeBorder: '#791F1F', badgeColor: B.white }
    if (!hasExpl)      return { bg: '#FFF6E5',  border: '1.5px solid ' + B.amber, badgeBg: B.amber, badgeBorder: '#7A4D0F', badgeColor: B.white }
    return                    { bg: B.white,    border: '1px solid ' + B.border,  badgeBg: B.white, badgeBorder: B.dark,    badgeColor: B.dark  }
  }

  function rowPreview(mark) {
    const text = (mark.explanation || '').trim()
    const chars = text.length
    if (chars === 0)
      return <span style={{ color: B.amber, fontStyle: 'italic' }}>нажмите, чтобы описать</span>
    if (chars < MIN_EXPLANATION_CHARS)
      return <span style={{ color: B.amber }}>{text.slice(0, 58)} <em>(мало символов)</em></span>
    return text.length > 60 ? text.slice(0, 58) + '…' : text
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
          Блок 3 из 5 · Сцена {sceneIdx + 1} из {scenes.length}
        </p>
        <p style={{ fontSize: 13, color: limitReached ? B.amber : B.muted, margin: 0 }}>
          {currentMarks.length} / {MAX_MARKS_PER_SCENE} отметок
        </p>
      </div>

      <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: 18, color: B.text }}>
        {currentScene.title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: B.text, marginBottom: 16 }}>
        {currentScene.intro}
      </p>

      <div style={{
        position: 'relative', background: B.light, borderRadius: SHAPE.card,
        overflow: 'hidden', marginBottom: 16,
        cursor: limitReached ? 'not-allowed' : 'crosshair',
      }}>
        <img
          ref={imgRef}
          src={currentScene.image}
          alt={currentScene.title}
          onClick={handleImageClick}
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
          draggable={false}
        />
        {currentMarks.map((m, i) => {
          const s = markerStyle(m, i)
          return (
            <div key={i}
              onClick={e => { e.stopPropagation(); setActiveMarkIdx(i) }}
              style={{
                position: 'absolute', left: m.x + '%', top: m.y + '%',
                transform: 'translate(-50%, -50%)',
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', zIndex: 2,
                borderWidth: 2, borderStyle: 'solid', ...s,
              }}>
              {i + 1}
            </div>
          )
        })}
      </div>

      <p style={{
        fontSize: 13,
        color: limitFlash ? B.red : (limitReached ? B.amber : B.muted),
        fontWeight: limitFlash ? 600 : 400,
        fontStyle: 'italic', marginBottom: 16, transition: 'color 0.2s',
      }}>
        {limitReached
          ? '⚠ Достигнут лимит отметок. Уберите одну, если хотите поставить другую.'
          : 'Нажмите на то, что считаете нарушением, — появится отметка. Каждую отметку опишите словами: что это и почему отклонение от стандарта (минимум ' + MIN_EXPLANATION_CHARS + ' символов в описании). Чтобы вернуться к отметке — нажмите на её номер на фото или в списке ниже.'}
      </p>

      {currentMarks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: B.muted, marginBottom: 8, fontWeight: 500 }}>
            Ваши отметки на этой сцене: {describedCount} из {currentMarks.length} описано
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {currentMarks.map((mark, i) => {
              const r = rowStyle(mark, i)
              const hasExpl = (mark.explanation || '').trim().length >= MIN_EXPLANATION_CHARS
              return (
                <div key={i} onClick={() => setActiveMarkIdx(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', background: r.bg, border: r.border,
                  borderRadius: 6, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: r.badgeBg, border: '2px solid ' + r.badgeBorder, color: r.badgeColor,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>{i + 1}</div>
                  <span style={{ flex: 1, color: B.text }}>{rowPreview(mark)}</span>
                  <span style={{ fontSize: 13, color: hasExpl ? B.green : B.amber }}>
                    {hasExpl ? '✓' : '⚠'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeMark && (
        <div style={{ background: B.greenBg, borderRadius: SHAPE.card, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: B.red, color: B.white,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
              }}>{activeMarkIdx + 1}</div>
              <span style={{ fontSize: 13, color: B.text, fontWeight: 500 }}>
                Описание отметки {activeMarkIdx + 1}
              </span>
            </div>
            <button onClick={() => removeMark(activeMarkIdx)} style={{
              fontSize: 12, color: B.red, background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '4px 8px',
            }}>
              ✕ Убрать
            </button>
          </div>
          <p style={{ fontSize: 13, color: B.text, margin: '0 0 8px' }}>Что вы видите и почему это нарушение стандарта?</p>
          <textarea
            value={activeMark.explanation}
            onChange={e => updateExplanation(activeMarkIdx, e.target.value)}
            placeholder="Опишите, что заметили и почему это отклонение от стандарта сервиса..."
            rows={3}
            style={{
              width: '100%', padding: '8px 10px',
              fontSize: 13, lineHeight: 1.5,
              border: '1px solid ' + B.border, borderRadius: 4,
              fontFamily: 'inherit', resize: 'vertical',
              background: B.white, color: B.text, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ textAlign: 'right', marginTop: 4 }}>
            <span style={{
              fontSize: 12,
              color: (activeMark.explanation || '').trim().length >= MIN_EXPLANATION_CHARS ? B.green : B.amber,
            }}>
              {(activeMark.explanation || '').trim().length} / {MIN_EXPLANATION_CHARS} символов
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid ' + B.border }}>
        <BrandedButton onClick={handleNext} disabled={!allDescribed}>
          {isLastScene ? 'Завершить блок →' : 'К сцене ' + (sceneIdx + 2) + ' →'}
        </BrandedButton>
      </div>
    </div>
  )
}

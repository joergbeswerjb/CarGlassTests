import { useState, useEffect } from 'react'
import { B } from '../../utils/brand.js'

const T = {
  ru: {
    block: 'Блок 3 — Стандарт качества',
    scene: 'Сцена', of: 'из',
    loading: 'Загружаем изображение...',
    sub: 'Отметьте все нарушения, которые вы замечаете:',
    next: 'Далее →',
    finish: 'Завершить тест →',
    imgNote: 'Внимательно изучите изображение перед тем как отмечать нарушения',
  },
  kz: {
    block: '3-блок — Сапа стандарты',
    scene: 'Сахна', of: 'ішінен',
    loading: 'Сурет жүктелуде...',
    sub: 'Суреттегі барлық бұзушылықтарды белгілеңіз:',
    next: 'Келесі →',
    finish: 'Тестті аяқтау →',
    imgNote: 'Бұзушылықтарды белгілемес бұрын суретті мұқият зерттеңіз',
  },
}

export default function BlockVisual({ scenes, lang, onComplete }) {
  const [idx,       setIdx]       = useState(0)
  const [answers,   setAnswers]   = useState([])   // [{selected:[]}]
  const [selected,  setSelected]  = useState([])
  const [imgLoaded, setImgLoaded] = useState(false)
  const t = T[lang]

  // Reset image state on scene change
  useEffect(() => {
    setImgLoaded(false)
    setSelected([])
  }, [idx])

  function toggle(i) {
    setSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  function next() {
    const newAnswers = [...answers, { selected }]
    if (idx + 1 >= scenes.length) {
      onComplete(newAnswers)
    } else {
      setAnswers(newAnswers)
      setIdx(idx + 1)
    }
  }

  const scene    = scenes[idx]
  const isLast   = idx + 1 >= scenes.length
  const progress = Math.round(((idx + 1) / scenes.length) * 100)

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
        {t.scene} {idx + 1} {t.of} {scenes.length}
      </div>

      <div style={{ fontSize: 15, color: B.text, lineHeight: 1.65, marginBottom: '1rem' }}>
        {scene.q[lang]}
      </div>

      {/* Image */}
      <div style={{
        position: 'relative', background: B.dark,
        borderLeft: `4px solid ${B.yellow}`,
        marginBottom: '1rem', minHeight: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {!imgLoaded && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
            {t.loading}
          </div>
        )}
        <img
          src={scene.img}
          alt={scene.q[lang]}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', display: imgLoaded ? 'block' : 'none',
            maxHeight: 380, objectFit: 'cover',
          }}
        />
      </div>

      {/* Image note */}
      <div style={{
        fontSize: 12, color: B.muted,
        background: B.light, borderLeft: `3px solid ${B.yellow}`,
        padding: '8px 12px', marginBottom: '1rem',
      }}>
        ⚠ {t.imgNote}
      </div>

      {/* Violations list */}
      <div style={{ fontSize: 13, color: B.muted, marginBottom: 10 }}>{t.sub}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.5rem' }}>
        {scene.violations.map((v, i) => {
          const checked = selected.includes(i)
          return (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', cursor: 'pointer',
                border: `1px solid ${checked ? B.green : B.border}`,
                background: checked ? B.greenBg : B.white,
                fontSize: 13, color: B.text,
              }}
            >
              <div style={{
                width: 18, height: 18, flexShrink: 0,
                border: `1px solid ${checked ? B.green : B.border}`,
                background: checked ? B.green : 'transparent',
                color: checked ? '#fff' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
              }}>
                ✓
              </div>
              {v.t[lang]}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={next}
          disabled={!imgLoaded}
          style={{
            padding: '9px 20px',
            background: imgLoaded ? B.red : '#ccc',
            color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 500,
            cursor: imgLoaded ? 'pointer' : 'not-allowed',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {isLast ? t.finish : t.next}
        </button>
      </div>
    </div>
  )
}

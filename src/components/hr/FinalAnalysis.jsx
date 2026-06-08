// Финальный анализ (B.3). Кнопка -> generate_analysis (Opus) -> досье из 6 блоков:
// рекомендация, вердикт, тест-против-интервью, силы, риски с действиями,
// что компенсировать в команде, вопросы для референса.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { generateAnalysis } from '../../utils/api.js'

function parseStoredObject(raw) {
  if (!raw) return null
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object' && obj.recommendation) return obj
    return null
  } catch (e) {
    return null
  }
}

// Цвета бейджа рекомендации.
function recoStyle(reco) {
  if (reco === 'рекомендуется') return { bg: B.greenBg, color: B.green }
  if (reco === 'не рекомендуется') return { bg: B.redBg, color: B.red }
  return { bg: '#FBF1E0', color: B.amber } // условно
}

function BlockTitle({ children }) {
  return (
    <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, margin: '18px 0 8px' }}>
      {children}
    </div>
  )
}

function Dossier({ d }) {
  const rs = recoStyle(d.recommendation)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: rs.color, background: rs.bg,
          padding: '6px 14px', borderRadius: SHAPE.asymmetric, textTransform: 'uppercase', letterSpacing: '.03em',
        }}>
          {d.recommendation}
        </span>
      </div>
      <p style={{ fontSize: 15, color: B.text, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{d.verdict}</p>

      <BlockTitle>Тест ↔ интервью</BlockTitle>
      <p style={{ fontSize: 13, color: B.text, lineHeight: 1.6, margin: 0 }}>{d.test_vs_interview}</p>

      <BlockTitle>Подтверждённые силы</BlockTitle>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {(d.strengths || []).map(function (s, i) {
          return <li key={i} style={{ fontSize: 13, color: B.text, lineHeight: 1.6, marginBottom: 6 }}>{s}</li>
        })}
      </ul>

      <BlockTitle>Риски и действия на onboarding</BlockTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(d.risks || []).map(function (r, i) {
          return (
            <div key={i} style={{ background: B.light, border: '1px solid ' + B.border, borderRadius: SHAPE.input, padding: '10px 12px' }}>
              <div style={{ fontSize: 13, color: B.text, lineHeight: 1.5, marginBottom: 5 }}>
                <span style={{ color: B.red, fontWeight: 600 }}>Риск: </span>{r.risk}
              </div>
              <div style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>
                <span style={{ color: B.green, fontWeight: 600 }}>Действие: </span>{r.action}
              </div>
            </div>
          )
        })}
      </div>

      <BlockTitle>Что компенсировать в команде</BlockTitle>
      <p style={{ fontSize: 13, color: B.text, lineHeight: 1.6, margin: 0 }}>{d.team_compensation}</p>

      <BlockTitle>Вопросы для референса</BlockTitle>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {(d.reference_questions || []).map(function (q, i) {
          return <li key={i} style={{ fontSize: 13, color: B.text, lineHeight: 1.6, marginBottom: 6 }}>{q}</li>
        })}
      </ul>
    </div>
  )
}

export default function FinalAnalysis({ row }) {
  const id = row['ID']
  const role = row['Роль']
  const [dossier, setDossier] = useState(function () { return parseStoredObject(row['Финальный анализ']) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function run() {
    setLoading(true)
    setError(null)
    generateAnalysis(id, role)
      .then(function (result) {
        setDossier(result)
        setLoading(false)
      })
      .catch(function (err) {
        setError(String(err.message || err))
        setLoading(false)
      })
  }

  if (loading) {
    return (
      <div style={{ fontSize: 13, color: B.muted, padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: B.primary, display: 'inline-block' }} />
        Opus собирает досье из теста, CV, сценария и ответов, ~25-30 секунд...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: B.redBg, border: '1px solid #F3C9C9', borderRadius: SHAPE.card, padding: '12px 14px' }}>
        <p style={{ fontSize: 13, color: B.red, margin: '0 0 10px', lineHeight: 1.5 }}>
          Не удалось собрать анализ: {error}
        </p>
        <button onClick={run} style={{
          padding: '8px 16px', background: B.primary, color: B.white,
          border: 'none', borderRadius: SHAPE.asymmetric,
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Попробовать снова
        </button>
      </div>
    )
  }

  if (!dossier) {
    return (
      <button onClick={run} style={{
        padding: '9px 18px', background: B.primary, color: B.white,
        border: 'none', borderRadius: SHAPE.asymmetric,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Создать финальный анализ
      </button>
    )
  }

  return (
    <div>
      <Dossier d={dossier} />
      <button onClick={run} style={{
        marginTop: 16, padding: '6px 12px', background: 'transparent', color: B.muted,
        border: '1px solid ' + B.border, borderRadius: SHAPE.input,
        fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Пересобрать анализ
      </button>
    </div>
  )
}

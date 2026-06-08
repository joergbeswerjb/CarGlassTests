// Сценарий интервью + рабочий лист ответов (B.2 + B.3).
// Вводная и закрытие - фиксированный шаблон. Основная часть - STAR-вопросы,
// сгенерированные через generate_script. Под каждым вопросом - поле для ответа
// кандидата с интервью; ответы сохраняются через save_answers и потом идут
// в финальный анализ.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { generateScript, saveAnswers } from '../../utils/api.js'

const INTRO_FRAMING = 'Спасибо, что нашли время. Я заранее посмотрел ваше резюме и результаты теста - пересказывать карьеру не нужно. Сегодня сфокусируемся на конкретных рабочих ситуациях: интересно не что в резюме, а как вы действуете.'
const INTRO_WARMUPS = [
  'Коротко - что именно в этой роли вам интересно и почему сейчас? (~2 мин)',
  'В двух предложениях: как вы понимаете задачу операционного директора у нас? (~2 мин)',
]
const INTRO_TRANSITION = 'Хорошо. Теперь разберём несколько конкретных ситуаций из вашей практики.'
const CLOSING = [
  'Что вы хотели бы узнать о роли, команде или компании?',
  'Следующие шаги по процессу.',
]

function parseStored(raw) {
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr) && arr.length > 0) return arr
    return null
  } catch (e) {
    return null
  }
}

// Достаём сохранённые ответы и раскладываем по индексам вопросов.
function parseAnswers(raw, scriptLen) {
  const out = []
  for (let i = 0; i < scriptLen; i++) out.push('')
  if (!raw) return out
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      for (let i = 0; i < scriptLen && i < arr.length; i++) {
        const a = arr[i]
        out[i] = (a && typeof a === 'object') ? (a.answer || '') : String(a || '')
      }
    }
  } catch (e) {}
  return out
}

function TemplateBlock({ label, children }) {
  return (
    <div style={{
      background: B.light, border: '1px solid ' + B.border,
      borderRadius: SHAPE.input, padding: '14px 16px', marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function QuestionCard({ q, index, answer, onAnswerChange }) {
  function handleChange(e) {
    onAnswerChange(index, e.target.value)
  }
  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, padding: '16px 18px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: B.muted }}>{index + 1}.</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: B.text, lineHeight: 1.5 }}>{q.question}</span>
      </div>
      <div style={{ fontSize: 13, color: B.text, marginBottom: 10, lineHeight: 1.5 }}>
        <span style={{ color: B.muted }}>Проверяем: </span>{q.probes}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: B.green, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>Сильный: </span>{q.good_signal}
        </div>
        <div style={{ fontSize: 13, color: B.red, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>Тревожный: </span>{q.concern_signal}
        </div>
      </div>
      <textarea
        value={answer}
        onChange={handleChange}
        placeholder="Ответ кандидата с интервью..."
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box',
          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
          color: B.text, background: B.light,
          border: '1px solid ' + B.border, borderRadius: SHAPE.input,
          padding: '8px 10px', resize: 'vertical',
        }}
      />
    </div>
  )
}

export default function InterviewScript({ row }) {
  const id = row['ID']
  const role = row['Роль']
  const initialScript = parseStored(row['Сценарий интервью'])

  const [script, setScript] = useState(function () { return initialScript })
  const [answers, setAnswers] = useState(function () {
    return parseAnswers(row['Ответы интервью'], initialScript ? initialScript.length : 0)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savingAnswers, setSavingAnswers] = useState(false)
  const [answersSaved, setAnswersSaved] = useState(false)
  const [answersError, setAnswersError] = useState(null)

  function run() {
    setLoading(true)
    setError(null)
    generateScript(id, role)
      .then(function (result) {
        setScript(result)
        const blank = []
        for (let i = 0; i < result.length; i++) blank.push('')
        setAnswers(blank)
        setAnswersSaved(false)
        setLoading(false)
      })
      .catch(function (err) {
        setError(String(err.message || err))
        setLoading(false)
      })
  }

  function handleAnswerChange(i, val) {
    const next = answers.slice()
    next[i] = val
    setAnswers(next)
    setAnswersSaved(false)
  }

  function handleSaveAnswers() {
    setSavingAnswers(true)
    setAnswersSaved(false)
    setAnswersError(null)
    const payload = script.map(function (q, i) {
      return { question: q.question, answer: answers[i] || '' }
    })
    saveAnswers(id, role, payload)
      .then(function () {
        setSavingAnswers(false)
        setAnswersSaved(true)
      })
      .catch(function (err) {
        setSavingAnswers(false)
        setAnswersError(String(err.message || err))
      })
  }

  if (loading) {
    return (
      <div style={{
        fontSize: 13, color: B.muted, padding: '10px 0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: B.primary, display: 'inline-block' }} />
        AI составляет сценарий по тесту, флагам и CV, ~15 секунд...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: B.redBg, border: '1px solid #F3C9C9', borderRadius: SHAPE.card, padding: '12px 14px' }}>
        <p style={{ fontSize: 13, color: B.red, margin: '0 0 10px', lineHeight: 1.5 }}>
          Не удалось сгенерировать сценарий: {error}
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

  if (!script) {
    return (
      <button onClick={run} style={{
        padding: '9px 18px', background: B.primary, color: B.white,
        border: 'none', borderRadius: SHAPE.asymmetric,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Сгенерировать сценарий
      </button>
    )
  }

  return (
    <div>
      <TemplateBlock label="Вводная (стандартная)">
        <p style={{ fontSize: 14, color: B.text, lineHeight: 1.6, margin: '0 0 10px' }}>{INTRO_FRAMING}</p>
        <div style={{ fontSize: 13, color: B.text, lineHeight: 1.7 }}>
          {INTRO_WARMUPS.map(function (w, i) {
            return <div key={i}>- {w}</div>
          })}
        </div>
        <p style={{ fontSize: 13, color: B.muted, fontStyle: 'italic', margin: '10px 0 0' }}>{INTRO_TRANSITION}</p>
      </TemplateBlock>

      <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, margin: '0 2px 8px' }}>
        Основная часть — под кандидата
      </div>
      {script.map(function (q, i) {
        return (
          <QuestionCard
            key={i}
            q={q}
            index={i}
            answer={answers[i] || ''}
            onAnswerChange={handleAnswerChange}
          />
        )
      })}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 16px' }}>
        <button
          onClick={handleSaveAnswers}
          disabled={savingAnswers}
          style={{
            padding: '8px 16px',
            background: savingAnswers ? B.light : B.primary,
            color: savingAnswers ? B.muted : B.white,
            border: 'none', borderRadius: SHAPE.asymmetric,
            fontSize: 13, fontWeight: 600,
            cursor: savingAnswers ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {savingAnswers ? 'Сохранение...' : 'Сохранить ответы'}
        </button>
        {answersSaved && <span style={{ fontSize: 13, color: B.green }}>Ответы сохранены</span>}
        {answersError && <span style={{ fontSize: 13, color: B.red }}>Ошибка: {answersError}</span>}
      </div>

      <TemplateBlock label="Закрытие (стандартное)">
        <div style={{ fontSize: 14, color: B.text, lineHeight: 1.7 }}>
          {CLOSING.map(function (c, i) {
            return <div key={i}>- {c}</div>
          })}
        </div>
      </TemplateBlock>

      <button onClick={run} style={{
        marginTop: 4, padding: '6px 12px', background: 'transparent', color: B.muted,
        border: '1px solid ' + B.border, borderRadius: SHAPE.input,
        fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Перегенерировать сценарий
      </button>
    </div>
  )
}

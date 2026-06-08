// ─── TestPage — универсальная страница теста ────────────────────────────────
// Поддерживает два типа тестов:
//   - 'classic'  : intro → cognitive → disc → visual → done (техник)
//   - 'extended' : access_code → intro → cognitive → disc → visual_clickable → structuring → communication → done (OD)

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoleBySlug } from '../data/roles.js'
import { B, SHAPE }      from '../utils/brand.js'
import { saveAssessment } from '../utils/api.js'
import {
  calcCognitive, calcDisc, calcVisual, calcOverall, buildPayload,
  calcCognitiveOD, calcDiscOD, calcVisualOD, calcOverallOD, buildPayloadOD,
} from '../utils/scoring.js'
import { useAutosave, loadAutosave, clearAutosave } from '../utils/useAutosave.js'

// Классические блоки (техник)
import BlockIntro     from '../components/test/BlockIntro.jsx'
import BlockCognitive from '../components/test/BlockCognitive.jsx'
import BlockDisc      from '../components/test/BlockDisc.jsx'
import BlockVisual    from '../components/test/BlockVisual.jsx'

// Расширенные блоки (OD и далее)
import BlockAccessCode       from '../components/test/BlockAccessCode.jsx'
import BlockCognitiveOD      from '../components/test/BlockCognitiveOD.jsx'
import BlockDiscOD           from '../components/test/BlockDiscOD.jsx'
import BlockVisualClickable  from '../components/test/BlockVisualClickable.jsx'
import BlockStructured       from '../components/test/BlockStructured.jsx'
import BlockCommunication    from '../components/test/BlockCommunication.jsx'

// Конфигурация шагов по типу теста
const STEPS_BY_TYPE = {
  classic:  ['intro', 'cognitive', 'disc', 'visual', 'submitting'],
  extended: ['access', 'intro', 'cognitive', 'disc', 'visual', 'structuring', 'communication', 'submitting'],
}

export default function TestPage() {
  const { roleSlug } = useParams()
  const navigate     = useNavigate()
  const role         = getRoleBySlug(roleSlug)

  // Если роль не найдена
  if (!role) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
        <div style={{ fontSize: 18, color: B.muted }}>Тест не найден. Проверьте ссылку.</div>
      </div>
    )
  }

  const testType = role.testType || 'classic'
  const STEPS = STEPS_BY_TYPE[testType]
  const initialStep = role.accessCode ? 'access' : 'intro'

  // Ключ для автосохранения
  const autosaveKey = `glassgo-test-${roleSlug}`

  // Восстановление из сохранённого прогресса
  const saved = loadAutosave(autosaveKey)

  const [step, setStep]       = useState(saved?.state.step    || initialStep)
  const [lang, setLang]       = useState(saved?.state.lang    || 'ru')
  const [name, setName]       = useState(saved?.state.name    || '')

  // Универсальное хранилище ответов всех блоков
  const [answers, setAnswers] = useState(saved?.state.answers || {})
  const [error,   setError]   = useState('')

  // Автосохранение прогресса
  useAutosave(autosaveKey, { step, lang, name, answers }, step !== 'submitting')

  // Прогресс по шагам (без access и submitting)
  const visibleSteps = STEPS.filter(s => s !== 'access' && s !== 'submitting')
  const stepIdx  = visibleSteps.indexOf(step)
  const progress = Math.round(((stepIdx + 1) / (visibleSteps.length + 1)) * 100)

  // ─── Финальная отправка ─────────────────────────────────────────────
  async function handleSubmit(finalAnswers) {
    setStep('submitting')
    setError('')

    try {
      let payload

      if (testType === 'classic') {
        // Классический техник
        const { COGNITIVE, DISC, VISUAL_SCENES } = role.questions
        const cogResult  = calcCognitive(finalAnswers.cognitive || [])
        const discResult = calcDisc(finalAnswers.disc || [])
        const visResult  = calcVisual(finalAnswers.visual || [], VISUAL_SCENES)
        const overall    = calcOverall(cogResult, discResult, visResult, role)

        payload = buildPayload({
          name, lang, role,
          cogResult, discResult, visResult,
          overallResult: overall,
          rawCog:  finalAnswers.cognitive,
          rawDisc: finalAnswers.disc,
          rawVis:  finalAnswers.visual,
        })
      } else {
        // OD-тест (extended)
        const cogResult    = calcCognitiveOD(finalAnswers.cognitive)
        const discResult   = calcDiscOD(finalAnswers.disc)
        const visResult    = calcVisualOD(finalAnswers.visual, role.questions.VISUAL_SCENES)
        const overall      = calcOverallOD({
          cog: cogResult, disc: discResult, vis: visResult,
          structuring: finalAnswers.structuring,
          communication: finalAnswers.communication,
          role,
        })

        payload = buildPayloadOD({
          name, role,
          cogResult, discResult, visResult,
          structuringAnswers: finalAnswers.structuring,
          communicationAnswers: finalAnswers.communication,
          overallResult: overall,
        })
      }

      await saveAssessment(payload)
      clearAutosave(autosaveKey)
      navigate('/done')
    } catch (e) {
      console.error('Save error:', e)
      setError('Ошибка при сохранении. Проверьте интернет и попробуйте ещё раз.')
      // Откатываем шаг — отдаём кандидата обратно на последний блок
      const prevStep = STEPS[STEPS.indexOf('submitting') - 1]
      setStep(prevStep)
    }
  }

  function recordAnswer(blockKey, blockAnswers) {
    setAnswers(prev => ({ ...prev, [blockKey]: blockAnswers }))
  }

  // ─── Шапка ──────────────────────────────────────────────────────────
  const Header = () => (
    <>
      <div style={{
        background: B.white,
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${B.border}`,
      }}>
        <img src={B.LOGO_PATH} style={{ height: 28, width: 'auto' }} alt="GlassGo" />

        {/* Переключатель языка — только если поддерживается несколько */}
        {role.languages && role.languages.length > 1 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {role.languages.map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 12px',
                border: `1px solid ${l === lang ? B.primary : B.border}`,
                background: l === lang ? B.primary : 'transparent',
                color: l === lang ? B.white : B.muted,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 4,
                fontFamily: 'inherit',
              }}>
                {l === 'ru' ? 'RU' : 'ҚЗ'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Полоса прогресса */}
      {step !== 'access' && step !== 'submitting' && (
        <div style={{ height: 3, background: B.border }}>
          <div style={{
            height: 3, width: progress + '%', background: B.primary, transition: 'width .4s',
          }} />
        </div>
      )}
    </>
  )

  // ─── Экран отправки ─────────────────────────────────────────────────
  if (step === 'submitting') {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 2rem' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, color: B.muted }}>Сохраняем результаты...</div>
        </div>
      </div>
    )
  }

  // ─── Основной layout ────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
      <Header />

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {error && (
          <div style={{
            background: B.redBg,
            border: `1px solid ${B.red}`,
            borderLeft: `4px solid ${B.red}`,
            padding: '12px 16px',
            fontSize: 13,
            color: B.red,
            margin: '1rem',
            borderRadius: SHAPE.card,
          }}>
            {error}
          </div>
        )}

        {/* ── Экран кода доступа (только для extended) ── */}
        {step === 'access' && (
          <BlockAccessCode
            expectedCode={role.accessCode}
            onSuccess={() => setStep('intro')}
          />
        )}

        {/* ── Intro (общий) ── */}
        {step === 'intro' && (
          <BlockIntro
            role={role}
            lang={lang}
            name={name}
            onNameChange={setName}
            onStart={() => setStep('cognitive')}
          />
        )}

        {/* ── Cognitive ── */}
        {step === 'cognitive' && testType === 'classic' && (
          <BlockCognitive
            questions={role.questions.COGNITIVE}
            lang={lang}
            onComplete={a => { recordAnswer('cognitive', a); setStep('disc') }}
          />
        )}
        {step === 'cognitive' && testType === 'extended' && (
          <BlockCognitiveOD
            bank={role.questions.COGNITIVE_BANK}
            config={role.questions.COGNITIVE_CONFIG}
            savedState={answers.cognitive}
            onComplete={a => { recordAnswer('cognitive', a); setStep('disc') }}
          />
        )}

        {/* ── DISC ── */}
        {step === 'disc' && testType === 'classic' && (
          <BlockDisc
            questions={role.questions.DISC}
            lang={lang}
            onComplete={a => { recordAnswer('disc', a); setStep('visual') }}
          />
        )}
        {step === 'disc' && testType === 'extended' && (
          <BlockDiscOD
            questions={role.questions.DISC}
            savedState={answers.disc}
            onComplete={a => { recordAnswer('disc', a); setStep('visual') }}
          />
        )}

        {/* ── Visual ── */}
        {step === 'visual' && testType === 'classic' && (
          <BlockVisual
            scenes={role.questions.VISUAL_SCENES}
            lang={lang}
            onComplete={a => {
              recordAnswer('visual', a)
              // Для classic visual — последний блок
              handleSubmit({ ...answers, visual: a })
            }}
          />
        )}
        {step === 'visual' && testType === 'extended' && (
          <BlockVisualClickable
            scenes={role.questions.VISUAL_SCENES}
            savedAnswers={answers.visual}
            onComplete={a => { recordAnswer('visual', a); setStep('structuring') }}
          />
        )}

        {/* ── Structuring (только extended) ── */}
        {step === 'structuring' && testType === 'extended' && (
          <BlockStructured
            caseData={role.questions.STRUCTURING_CASE}
            savedAnswers={answers.structuring}
            onComplete={a => { recordAnswer('structuring', a); setStep('communication') }}
          />
        )}

        {/* ── Communication (только extended) ── */}
        {step === 'communication' && testType === 'extended' && (
          <BlockCommunication
            cases={role.questions.COMMUNICATION_CASES}
            savedAnswers={answers.communication}
            onComplete={a => {
              recordAnswer('communication', a)
              handleSubmit({ ...answers, communication: a })
            }}
          />
        )}
      </div>
    </div>
  )
}

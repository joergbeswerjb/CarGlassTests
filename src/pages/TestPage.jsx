import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoleBySlug } from '../data/roles.js'
import { B } from '../utils/brand.js'
import { calcCognitive, calcDisc, calcVisual, calcOverall, buildPayload } from '../utils/scoring.js'
import { saveAssessment } from '../utils/api.js'
import BlockIntro     from '../components/test/BlockIntro.jsx'
import BlockCognitive from '../components/test/BlockCognitive.jsx'
import BlockDisc      from '../components/test/BlockDisc.jsx'
import BlockVisual    from '../components/test/BlockVisual.jsx'

const LOGO_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAARCABmAOEDASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAcBAgQGCAUD/8QATBAAAQMDAgMEBgUHCAgHAAAAAQACAwQFEQYhBxIxE0FRYQgVInGR0RQygZOhFiNCVZSx0hckUlNUYnOyMzQ1NkRGY5VWcnSDhOLw/9oADAMBAAIRAxEAPwDr5ERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERerererer'

// ШАГИ: intro → cognitive → disc → visual → submitting → done (redirect)
const STEPS = ['intro', 'cognitive', 'disc', 'visual', 'submitting']

export default function TestPage() {
  const { roleSlug } = useParams()
  const navigate     = useNavigate()
  const role         = getRoleBySlug(roleSlug)

  const [step,       setStep]       = useState('intro')
  const [lang,       setLang]       = useState('ru')
  const [name,       setName]       = useState('')
  const [cogAnswers, setCogAnswers] = useState([])
  const [discAnswers,setDiscAnswers]= useState([])
  const [visAnswers, setVisAnswers] = useState([])
  const [error,      setError]      = useState('')

  // Прогресс
  const stepIdx  = STEPS.indexOf(step)
  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100)

  // Роль не найдена
  if (!role) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
        <div style={{ fontSize: 18, color: B.muted }}>Тест не найден. Проверьте QR-код.</div>
      </div>
    )
  }

  const { COGNITIVE, DISC, VISUAL_SCENES } = role.questions

  // ─── Финальная отправка ────────────────────────────────────────────────────
  async function handleSubmit(visAns) {
    setStep('submitting')
    setError('')

    try {
      const cogResult  = calcCognitive(cogAnswers)
      const discResult = calcDisc(discAnswers)
      const visResult  = calcVisual(visAns, VISUAL_SCENES)
      const overall    = calcOverall(cogResult, discResult, visResult, role)

      const payload = buildPayload({
        name, lang, role,
        cogResult, discResult, visResult,
        overallResult: overall,
        rawCog:  cogAnswers,
        rawDisc: discAnswers,
        rawVis:  visAns,
      })

      await saveAssessment(payload)
      navigate('/done')
    } catch (e) {
      setError('Ошибка при сохранении. Проверьте интернет и попробуйте ещё раз.')
      setStep('visual')
    }
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  const Header = () => (
    <>
      <div style={{
        background: B.dark, padding: '12px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `3px solid ${B.red}`,
      }}>
        <img src={`data:image/jpeg;base64,${LOGO_B64}`} style={{ width: 180, height: 'auto' }} alt="CarGlass" />
        <div style={{ display: 'flex', gap: 6 }}>
          {['ru', 'kz'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '4px 11px', border: `1px solid ${l === lang ? B.red : 'rgba(255,255,255,.18)'}`,
              background: l === lang ? B.red : 'transparent',
              color: l === lang ? '#fff' : 'rgba(255,255,255,.45)',
              cursor: 'pointer', fontSize: 11, fontWeight: 500,
            }}>
              {l === 'ru' ? 'RU' : 'ҚЗ'}
            </button>
          ))}
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#2E2E2E' }}>
        <div style={{ height: 3, width: progress + '%', background: B.red, transition: 'width .4s' }} />
      </div>
    </>
  )

  // ─── Submitting screen ─────────────────────────────────────────────────────
  if (step === 'submitting') {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 2rem' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, color: B.muted }}>
            Сохраняем результаты...<br />
            <span style={{ fontSize: 13 }}>Жауаптар сақталуда...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
      <Header />

      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {error && (
          <div style={{
            background: '#FFF3F3', border: `1px solid ${B.red}`,
            borderLeft: `4px solid ${B.red}`, padding: '12px 16px',
            fontSize: 13, color: B.red, margin: '1rem',
          }}>
            {error}
          </div>
        )}

        {step === 'intro' && (
          <BlockIntro
            role={role}
            lang={lang}
            name={name}
            onNameChange={setName}
            onStart={() => setStep('cognitive')}
          />
        )}

        {step === 'cognitive' && (
          <BlockCognitive
            questions={COGNITIVE}
            lang={lang}
            onComplete={(answers) => {
              setCogAnswers(answers)
              setStep('disc')
            }}
          />
        )}

        {step === 'disc' && (
          <BlockDisc
            questions={DISC}
            lang={lang}
            onComplete={(answers) => {
              setDiscAnswers(answers)
              setStep('visual')
            }}
          />
        )}

        {step === 'visual' && (
          <BlockVisual
            scenes={VISUAL_SCENES}
            lang={lang}
            onComplete={(answers) => {
              setVisAnswers(answers)
              handleSubmit(answers)
            }}
          />
        )}

      </div>
    </div>
  )
}

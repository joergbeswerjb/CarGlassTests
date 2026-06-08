// ─── DonePage — финальный экран после прохождения теста ─────────────────────
// Универсальный для всех ролей платформы GlassGo.
// Билингвальный (RU+KZ блок) показывается опционально — управляется через query string.
// По умолчанию для extended-теста (OD) — только русский.

import { useNavigate, useSearchParams } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'

export default function DonePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Поддержка билингвальности: ?bilingual=1 включает блок казахского
  // Если параметра нет — только русский (актуально для OD и других топ-ролей)
  const showKazakh = searchParams.get('bilingual') === '1'

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
      {/* Светлая шапка с логотипом */}
      <header style={{
        background: B.white,
        padding: '14px 20px',
        borderBottom: `1px solid ${B.border}`,
      }}>
        <img src={B.LOGO_PATH} style={{ height: 28, width: 'auto' }} alt="GlassGo" />
      </header>

      {/* Done screen */}
      <main style={{ maxWidth: 520, margin: '80px auto', padding: '0 1.5rem', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: B.greenBg, border: `3px solid ${B.green}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
          color: B.green, fontWeight: 700,
        }}>✓</div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: B.text, marginBottom: 12 }}>
          Тест завершён
        </h1>
        <p style={{ fontSize: 15, color: B.muted, lineHeight: 1.7, marginBottom: 32 }}>
          Спасибо! Ваши ответы записаны.<br />
          Результаты будут рассмотрены HR-отделом.<br />
          Вы можете закрыть эту страницу.
        </p>

        {/* Казахский блок — опциональный, по флагу ?bilingual=1 */}
        {showKazakh && (
          <div style={{
            background: B.white, border: `1px solid ${B.border}`,
            borderLeft: `3px solid ${B.primary}`,
            padding: '14px 18px', marginBottom: 32, textAlign: 'left',
            borderRadius: SHAPE.card,
          }}>
            <p style={{ fontSize: 14, color: B.text, lineHeight: 1.7, margin: 0 }}>
              Рахмет! Жауаптарыңыз жазылды.<br />
              Нәтижелерді HR бөлімі қарастырады.<br />
              Бұл бетті жабуға болады.
            </p>
          </div>
        )}

        <div style={{
          fontSize: 11, color: B.muted,
          letterSpacing: '.12em', textTransform: 'uppercase',
          fontWeight: 600, marginTop: 40,
        }}>
          GlassGo · Оценка кандидатов
        </div>
      </main>
    </div>
  )
}

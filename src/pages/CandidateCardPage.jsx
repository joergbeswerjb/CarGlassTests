// CandidateCardPage - детальная карточка кандидата.
// В C.1 это заглушка. В C.2 будет полноценная карточка со всеми блоками.

import { useNavigate, useParams } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'

export default function CandidateCardPage() {
  const navigate = useNavigate()
  const params = useParams()

  return (
    <div style={{ background: B.light, minHeight: '100vh' }}>
      <header style={{
        background: B.white, padding: '14px 20px',
        borderBottom: '1px solid ' + B.border,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <img src={B.LOGO_PATH} style={{ height: 28, width: 'auto' }} alt="GlassGo" />
        <div style={{
          fontSize: 11, color: B.muted,
          letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          HR-панель · Оценка кандидатов
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px' }}>
        <button
          onClick={function () { navigate('/hr') }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: B.muted, fontSize: 13, padding: 0, marginBottom: 20,
            fontFamily: 'inherit',
          }}
        >
          ← Назад к списку
        </button>

        <div style={{
          background: B.white, border: '1px solid ' + B.border,
          borderRadius: SHAPE.card, padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: B.text, margin: '0 0 8px' }}>
            Детальная карточка в разработке
          </h1>
          <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.6, margin: '0 0 16px' }}>
            Будет реализована в C.2 — следующий шаг.<br />
            Тут появится полный разбор результата кандидата:
            краткая сводка, разделы по 5 блокам, AI-секции.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '8px 14px',
            background: B.light, borderRadius: SHAPE.input,
            fontSize: 12, color: B.muted, fontFamily: 'monospace',
          }}>
            Роль: {params.roleSlug} · ID: {params.id}
          </div>
        </div>
      </main>
    </div>
  )
}

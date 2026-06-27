import { Link } from 'react-router-dom'

// ── Брендовые токены (инлайн, без зависимости от brand.js) ──────────────
const BLUE = '#1763C6'        // синий акцент GlassGo — при необходимости поправь хекс
const BLUE_DARK = '#0F4A99'
const INK = '#1B2733'
const MUTED = '#6B7886'
const BORDER = '#E3E8EE'
const FONT = "'Calibri Light', Calibri, 'Segoe UI', system-ui, sans-serif"

const ROLES = [
  {
    slug: 'operations-director',
    title: 'Операционный директор',
    desc: 'Когнитивный блок, DISC, визуальный стандарт, структурирование и коммуникация.',
  },
  {
    slug: 'technician',
    title: 'Техник филиала',
    desc: 'Профессиональная и практическая оценка кандидата на позицию техника.',
  },
]

export default function StartPage() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.brandRow}>
          <span style={S.brand}>
            Glass<span style={{ color: BLUE }}>Go</span>
          </span>
        </div>

        <h1 style={S.h1}>Оценка кандидатов</h1>
        <p style={S.sub}>Выберите тест для прохождения.</p>

        <div style={S.grid}>
          {ROLES.map((r) => (
            <Link key={r.slug} to={`/test/${r.slug}`} style={S.card} className="gg-card">
              <span style={S.cardTitle}>{r.title}</span>
              <span style={S.cardDesc}>{r.desc}</span>
              <span style={S.cardCta}>Начать тест →</span>
            </Link>
          ))}
        </div>

        <div style={S.footer}>
          <Link to="/hr" style={S.hrLink}>Вход для HR</Link>
        </div>
      </div>

      <style>{`
        .gg-card { transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
        .gg-card:hover {
          border-color: ${BLUE};
          box-shadow: 0 6px 22px rgba(23,99,198,.12);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: FONT,
    color: INK,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
  },
  wrap: {
    width: '100%',
    maxWidth: 760,
    textAlign: 'center',
  },
  brandRow: { marginBottom: 28 },
  brand: {
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: '.5px',
    color: INK,
  },
  h1: {
    fontSize: 30,
    fontWeight: 400,
    margin: '0 0 8px',
    color: INK,
  },
  sub: {
    fontSize: 16,
    color: MUTED,
    margin: '0 0 36px',
    fontWeight: 300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 18,
    textAlign: 'left',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '24px 22px',
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    background: '#FFFFFF',
    textDecoration: 'none',
    color: INK,
  },
  cardTitle: { fontSize: 19, fontWeight: 500, color: INK },
  cardDesc: { fontSize: 14, lineHeight: 1.5, color: MUTED, fontWeight: 300 },
  cardCta: { marginTop: 6, fontSize: 15, fontWeight: 500, color: BLUE },
  footer: { marginTop: 40 },
  hrLink: {
    fontSize: 13,
    color: MUTED,
    textDecoration: 'none',
    fontWeight: 300,
    borderBottom: `1px solid transparent`,
  },
}

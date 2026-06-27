import { Link } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'

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
          <img src={B.LOGO_PATH} alt="GlassGo" style={S.logo} />
        </div>

        <h1 style={S.h1}>Оценка кандидатов</h1>
        <p style={S.sub}>Выберите тест для прохождения.</p>

        <div style={S.grid}>
          {ROLES.map((r) => (
            <Link key={r.slug} to={`/test/${r.slug}`} style={S.card} className="gg-card">
              <span style={S.cardTitle}>{r.title}</span>
              <span style={S.cardDesc}>{r.desc}</span>
              <span style={S.cardCta} className="gg-cta">Начать тест →</span>
            </Link>
          ))}
        </div>

        <div style={S.footer}>
          <Link to="/hr" style={S.hrLink}>Вход для HR</Link>
        </div>
      </div>

      <style>{`
        .gg-card {
          transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
        }
        .gg-card:hover {
          border-color: ${B.primary};
          box-shadow: 0 8px 26px rgba(15,56,118,.12);
          transform: translateY(-2px);
        }
        .gg-card:hover .gg-cta {
          background: ${B.primaryDark};
        }
      `}</style>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    background: B.light,
    fontFamily: FONT,
    color: B.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
  },
  wrap: {
    width: '100%',
    maxWidth: 780,
    textAlign: 'center',
  },
  brandRow: { marginBottom: 30 },
  logo: {
    height: 44,
    width: 'auto',
    objectFit: 'contain',
  },
  h1: {
    fontSize: 30,
    fontWeight: 400,
    margin: '0 0 8px',
    color: B.text,
  },
  sub: {
    fontSize: 16,
    color: B.muted,
    margin: '0 0 36px',
    fontWeight: 300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
    gap: 18,
    textAlign: 'left',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '26px 24px',
    border: `1px solid ${B.border}`,
    borderRadius: SHAPE.card,
    background: B.white,
    textDecoration: 'none',
    color: B.text,
  },
  cardTitle: { fontSize: 19, fontWeight: 500, color: B.text },
  cardDesc: { fontSize: 14, lineHeight: 1.5, color: B.muted, fontWeight: 300 },
  cardCta: {
    marginTop: 14,
    alignSelf: 'flex-start',
    padding: '9px 18px',
    fontSize: 15,
    fontWeight: 500,
    color: B.white,
    background: B.primary,
    borderRadius: SHAPE.asymmetric,
    transition: 'background .15s ease',
  },
  footer: { marginTop: 44 },
  hrLink: {
    fontSize: 13,
    color: B.muted,
    textDecoration: 'none',
    fontWeight: 300,
  },
}

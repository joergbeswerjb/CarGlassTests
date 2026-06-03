import { B } from '../../utils/brand.js'

const T = {
  ru: {
    badge:    'CarGlass Kazakhstan · Оценка персонала',
    wlc:      'Тест кандидата',
    sub:      'Когнитивный потенциал · Личностный профиль · Стандарт качества',
    b1:       'Когнитивный\nблок',
    b2:       'Личностный\nпрофиль DISC',
    b3:       'Визуальный\nстандарт',
    time:     'Общее время',
    timer:    'Таймер Блок 1',
    threshold:'Порог (когнит.)',
    rulesTtl: 'Правила тестирования',
    rules:    'Отвечайте самостоятельно, без посторонней помощи. Блок 1 проходит строго по таймеру. В Блоке 3 внимательно изучите изображение перед тем как отмечать нарушения.',
    nameLabel:'Имя и фамилия кандидата:',
    namePh:   'Иванов Иван',
    start:    'Начать тест ->',
    noName:   'Введите имя кандидата',
  },
  kz: {
    badge:    'CarGlass Kazakhstan · Персоналды бағалау',
    wlc:      'Кандидат тесті',
    sub:      'Танымдық · Тұлғалық профиль · Сапа стандарты',
    b1:       'Танымдық\nблок',
    b2:       'Тұлғалық\nпрофиль DISC',
    b3:       'Визуалдық\nстандарт',
    time:     'Жалпы уақыт',
    timer:    '1-блок таймері',
    threshold:'Шек (танымдық)',
    rulesTtl: 'Тест ережелері',
    rules:    'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді. 3-блокта суретті мұқият зерттеңіз.',
    nameLabel:'Кандидаттың аты-жөні:',
    namePh:   'Иванов Иван',
    start:    'Тестті бастау ->',
    noName:   'Кандидаттың атын енгізіңіз',
  },
}

export default function BlockIntro({ role, lang, name, onNameChange, onStart }) {
  const t = T[lang]

  function handleStart() {
    if (!name.trim()) { alert(t.noName); return }
    onStart()
  }

  return (
    <div style={{ background: B.white, border: '.5px solid ' + B.border, borderTop: 'none' }}>
      {/* Hero */}
      <div style={{
        background: B.dark, padding: '2rem 1.5rem',
        borderLeft: '5px solid ' + B.red,
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 8 }}>
          {t.badge}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
          {t.wlc}<br />
          <span style={{ color: B.yellow }}>{role.label[lang]}</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 6 }}>{t.sub}</div>
      </div>

      <div style={{ padding: '1.5rem 1.25rem' }}>
        {/* Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {[
            { n: role.questions.COGNITIVE.length, l: t.b1 },
            { n: role.questions.DISC.length,      l: t.b2 },
            { n: role.questions.VISUAL_SCENES.length, l: t.b3 },
          ].map((item, i) => (
            <div key={i} style={{ background: B.dark, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: B.yellow, marginBottom: 4 }}>{item.n}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{item.l}</div>
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {[
            { l: t.time,      v: '25-30 мин' },
            { l: t.timer,     v: '12 минут'  },
            { l: t.threshold, v: Math.round(role.ranks.A * 0.8) + '+ / ' + role.cogMax },
          ].map((item, i) => (
            <div key={i} style={{
              background: B.light, border: '.5px solid ' + B.border,
              borderTop: '3px solid ' + B.red, padding: '.75rem 1rem',
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: B.muted, marginBottom: 3 }}>{item.l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: B.text }}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div style={{
          background: '#FFFBF0', borderLeft: '3px solid ' + B.yellow,
          padding: '.875rem 1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B5500', marginBottom: 4 }}>{t.rulesTtl}</div>
          <div style={{ fontSize: 12, color: '#6B5500', lineHeight: 1.65 }}>{t.rules}</div>
        </div>

        <div style={{ height: 1, background: B.border, margin: '1.25rem 0' }} />

        {/* Name input */}
        <div style={{ fontSize: 13, color: B.muted, marginBottom: 6 }}>{t.nameLabel}</div>
        <input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          placeholder={t.namePh}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '11px 12px', fontSize: 14, color: B.text,
            border: '1px solid ' + B.border, background: B.white,
            fontFamily: 'Arial, sans-serif', marginBottom: '1rem',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = B.red}
          onBlur={e => e.target.style.borderColor = B.border}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleStart}
            style={{
              padding: '10px 28px', background: B.red, color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {t.start}
          </button>
        </div>
      </div>
    </div>
  )
}

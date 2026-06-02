// ─── BlockIntro — универсальный стартовый экран для всех ролей ──────────────
// Поддерживает обе модели:
//   - classic  (techник): 3 блока, билингвальный RU/KZ
//   - extended (OD): 5 блоков, только русский
// Брендинг GlassGo: синий primary, асимметричная плашка на кнопке.

import { B, SHAPE } from '../../utils/brand.js'

// ── Тексты ──
const T = {
  ru: {
    badge:    'GlassGo · Оценка кандидатов',
    wlc:      'Тест кандидата',
    sub_classic:  'Когнитивный потенциал · Личностный профиль · Стандарт качества',
    sub_extended: 'Когнитивный · DISC · Визуальный · Структурирование · Коммуникация',
    b_cog:    'Когнитивный\nблок',
    b_disc:   'Личностный\nпрофиль DISC',
    b_vis:    'Визуальный\nстандарт',
    b_struct: 'Структурирование\nидеи',
    b_comm:   'Неудобный\nразговор',
    time_classic:  'Общее время',
    time_classic_val:  '25–30 мин',
    time_extended: 'Общее время',
    time_extended_val: '40–60 мин',
    timer:     'Таймер Блок 1',
    timer_classic_val:  '12 минут',
    timer_extended_val: '22 минуты',
    rulesTtl: 'Правила тестирования',
    rules_classic:  'Отвечайте самостоятельно, без посторонней помощи. Блок 1 проходит строго по таймеру. В Блоке 3 внимательно изучите изображение перед тем, как отмечать нарушения.',
    rules_extended: 'Отвечайте самостоятельно, без посторонней помощи. Блок 1 проходит строго по таймеру (22 мин). В блоках 3-5 ваши ответы оцениваются по существу — пишите развёрнуто и конкретно. Прогресс сохраняется автоматически.',
    nameLabel:'Имя и фамилия кандидата:',
    namePh:   'Иванов Иван',
    start:    'Начать тест →',
    noName:   'Введите имя кандидата',
  },
  kz: {
    badge:    'GlassGo · Кандидаттарды бағалау',
    wlc:      'Кандидат тесті',
    sub_classic:  'Танымдық · Тұлғалық профиль · Сапа стандарты',
    sub_extended: 'Танымдық · DISC · Визуалдық · Идеяны құрылымдау · Коммуникация',
    b_cog:    'Танымдық\nблок',
    b_disc:   'Тұлғалық\nпрофиль DISC',
    b_vis:    'Визуалдық\nстандарт',
    b_struct: 'Идеяны\nқұрылымдау',
    b_comm:   'Қиын\nәңгіме',
    time_classic:  'Жалпы уақыт',
    time_classic_val:  '25–30 мин',
    time_extended: 'Жалпы уақыт',
    time_extended_val: '40–60 мин',
    timer:     '1-блок таймері',
    timer_classic_val:  '12 минут',
    timer_extended_val: '22 минут',
    rulesTtl: 'Тест ережелері',
    rules_classic:  'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді. 3-блокта суретті мұқият зерттеңіз.',
    rules_extended: 'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді (22 мин). 3-5 блоктарда жауаптарыңыз мазмұны бойынша бағаланады. Прогресс автоматты түрде сақталады.',
    nameLabel:'Кандидаттың аты-жөні:',
    namePh:   'Иванов Иван',
    start:    'Тестті бастау →',
    noName:   'Кандидаттың атын енгізіңіз',
  },
}

export default function BlockIntro({ role, lang, name, onNameChange, onStart }) {
  const t = T[lang] || T.ru
  const testType = role.testType || 'classic'

  // Универсальная функция получения количества вопросов в блоке —
  // работает и для classic (COGNITIVE), и для extended (COGNITIVE_BANK)
  function getQuestionCount(blockKey) {
    const q = role.questions
    if (blockKey === 'cognitive') {
      if (q.COGNITIVE_BANK && q.COGNITIVE_CONFIG) {
        // Для extended: суммируем квоты
        const quotas = q.COGNITIVE_CONFIG.quotas
        let total = 0
        Object.entries(quotas).forEach(([cat, count]) => {
          if (count === 'all') {
            total += (q.COGNITIVE_BANK.filter(item => item.cat === cat && item.required) || []).length
          } else {
            total += count
          }
        })
        return total
      }
      return (q.COGNITIVE || []).length
    }
    if (blockKey === 'disc') return (q.DISC || []).length
    if (blockKey === 'visual') return (q.VISUAL_SCENES || []).length
    if (blockKey === 'structuring') return (q.STRUCTURING_CASE?.fields || []).length
    if (blockKey === 'communication') return (q.COMMUNICATION_CASES || []).length
    return 0
  }

  function handleStart() {
    if (!name.trim()) { alert(t.noName); return }
    onStart()
  }

  // Список блоков для отображения
  const blocks = testType === 'extended'
    ? [
        { n: getQuestionCount('cognitive'),     l: t.b_cog,    label: 'вопросов' },
        { n: getQuestionCount('disc'),          l: t.b_disc,   label: 'групп'    },
        { n: getQuestionCount('visual'),        l: t.b_vis,    label: 'сцен'     },
        { n: getQuestionCount('structuring'),   l: t.b_struct, label: 'полей'    },
        { n: getQuestionCount('communication'), l: t.b_comm,   label: 'кейсов'   },
      ]
    : [
        { n: getQuestionCount('cognitive'), l: t.b_cog,  label: 'вопросов' },
        { n: getQuestionCount('disc'),      l: t.b_disc, label: 'групп'    },
        { n: getQuestionCount('visual'),    l: t.b_vis,  label: 'сцен'     },
      ]

  const sub = testType === 'extended' ? t.sub_extended : t.sub_classic
  const timeVal  = testType === 'extended' ? t.time_extended_val  : t.time_classic_val
  const timerVal = testType === 'extended' ? t.timer_extended_val : t.timer_classic_val
  const rules    = testType === 'extended' ? t.rules_extended     : t.rules_classic

  return (
    <div style={{ background: B.white, border: '1px solid ' + B.border, borderTop: 'none' }}>
      {/* Hero — светлая шапка под GlassGo */}
      <div style={{
        background: B.dark,
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,.45)',
          letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          {t.badge}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: B.white, lineHeight: 1.2, marginBottom: 4 }}>
          {t.wlc}<br />
          <span style={{ color: B.primary, background: B.white, padding: '2px 10px', borderRadius: SHAPE.asymmetricSm, fontSize: 22 }}>
            {role.label[lang] || role.label.ru}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 10 }}>{sub}</div>
      </div>

      <div style={{ padding: '1.5rem 1.25rem' }}>
        {/* Блоки */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${blocks.length}, 1fr)`,
          gap: 8,
          marginBottom: '1.25rem',
        }}>
          {blocks.map((item, i) => (
            <div key={i} style={{
              background: B.light,
              border: '1px solid ' + B.border,
              padding: '1rem .5rem',
              textAlign: 'center',
              borderRadius: SHAPE.card,
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: B.primary, marginBottom: 4 }}>{item.n}</div>
              <div style={{ fontSize: 11, color: B.muted, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{item.l}</div>
            </div>
          ))}
        </div>

        {/* Информация о времени */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: testType === 'extended' ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
          gap: 8,
          marginBottom: '1.25rem',
        }}>
          <div style={{
            background: B.light, border: '1px solid ' + B.border,
            borderTop: '3px solid ' + B.primary, padding: '.75rem 1rem',
            borderRadius: SHAPE.card,
          }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: B.muted, marginBottom: 3 }}>
              {testType === 'extended' ? t.time_extended : t.time_classic}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: B.text }}>{timeVal}</div>
          </div>
          <div style={{
            background: B.light, border: '1px solid ' + B.border,
            borderTop: '3px solid ' + B.primary, padding: '.75rem 1rem',
            borderRadius: SHAPE.card,
          }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: B.muted, marginBottom: 3 }}>{t.timer}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: B.text }}>{timerVal}</div>
          </div>
          {testType !== 'extended' && (
            <div style={{
              background: B.light, border: '1px solid ' + B.border,
              borderTop: '3px solid ' + B.primary, padding: '.75rem 1rem',
              borderRadius: SHAPE.card,
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: B.muted, marginBottom: 3 }}>Порог</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: B.text }}>
                {role.ranks?.A ? `${Math.round(role.ranks.A * 0.8)}+ / ${role.cogMax || '—'}` : '—'}
              </div>
            </div>
          )}
        </div>

        {/* Правила */}
        <div style={{
          background: '#FFF6E5',
          borderLeft: '3px solid ' + B.amber,
          padding: '.875rem 1rem', marginBottom: '1.25rem',
          borderRadius: SHAPE.card,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7A4D0F', marginBottom: 4 }}>{t.rulesTtl}</div>
          <div style={{ fontSize: 12, color: '#7A4D0F', lineHeight: 1.65 }}>{rules}</div>
        </div>

        <div style={{ height: 1, background: B.border, margin: '1.25rem 0' }} />

        {/* Имя */}
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
            fontFamily: 'inherit', marginBottom: '1rem',
            outline: 'none', borderRadius: SHAPE.input,
          }}
          onFocus={e => e.target.style.borderColor = B.primary}
          onBlur={e => e.target.style.borderColor = B.border}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleStart}
            style={{
              padding: '10px 28px',
              background: B.primary, color: B.white,
              border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              borderRadius: SHAPE.asymmetric,
            }}
          >
            {t.start}
          </button>
        </div>
      </div>
    </div>
  )
}

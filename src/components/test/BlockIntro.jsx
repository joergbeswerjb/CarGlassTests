// ─── BlockIntro — универсальный стартовый экран для всех ролей ──────────────
// Поддерживает обе модели:
//   - classic  (techник): 3 блока, билингвальный RU/KZ
//   - extended (OD): 5 блоков, только русский
// Брендинг GlassGo: светлая страница, синий primary, асимметричная плашка.

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
    rules_extended: 'Отвечайте самостоятельно, без посторонней помощи. Блок 1 проходит строго по таймеру на весь блок (22 мин на 20 вопросов). В блоках 3-5 ваши ответы оцениваются по существу — пишите развёрнуто и конкретно. Прогресс сохраняется автоматически.',
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

  function getQuestionCount(blockKey) {
    const q = role.questions
    if (blockKey === 'cognitive') {
      if (q.COGNITIVE_BANK && q.COGNITIVE_CONFIG) {
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

  const blocks = testType === 'extended'
    ? [
        { n: getQuestionCount('cognitive'),     l: t.b_cog    },
        { n: getQuestionCount('disc'),          l: t.b_disc   },
        { n: getQuestionCount('visual'),        l: t.b_vis    },
        { n: getQuestionCount('structuring'),   l: t.b_struct },
        { n: getQuestionCount('communication'), l: t.b_comm   },
      ]
    : [
        { n: getQuestionCount('cognitive'), l: t.b_cog  },
        { n: getQuestionCount('disc'),      l: t.b_disc },
        { n: getQuestionCount('visual'),    l: t.b_vis  },
      ]

  const sub = testType === 'extended' ? t.sub_extended : t.sub_classic
  const timeVal  = testType === 'extended' ? t.time_extended_val  : t.time_classic_val
  const timerVal = testType === 'extended' ? t.timer_extended_val : t.timer_classic_val
  const rules    = testType === 'extended' ? t.rules_extended     : t.rules_classic

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '2.5rem 1.5rem 2rem',
    }}>
      {/* Бейдж сверху */}
      <div style={{
        fontSize: 11,
        color: B.muted,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        marginBottom: 14,
        fontWeight: 600,
      }}>
        {t.badge}
      </div>

      {/* Заголовок + плашка с названием роли */}
      <h1 style={{
        fontSize: 30, fontWeight: 700, color: B.text,
        lineHeight: 1.25, margin: '0 0 14px',
      }}>
        {t.wlc}
      </h1>
      <div style={{ marginBottom: 18 }}>
        <span style={{
          display: 'inline-block',
          color: B.white, background: B.primary,
          padding: '6px 16px',
          borderRadius: SHAPE.asymmetricSm,
          fontSize: 18, fontWeight: 600,
        }}>
          {role.label[lang] || role.label.ru}
        </span>
      </div>

      {/* Подзаголовок */}
      <p style={{
        fontSize: 14, color: B.muted, lineHeight: 1.6,
        marginBottom: 32, marginTop: 0,
      }}>
        {sub}
      </p>

      {/* Блоки — карточки с цифрами */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${blocks.length}, 1fr)`,
        gap: 10,
        marginBottom: 24,
      }}>
        {blocks.map((item, i) => (
          <div key={i} style={{
            background: B.white,
            border: '1px solid ' + B.border,
            padding: '1rem .5rem',
            textAlign: 'center',
            borderRadius: SHAPE.card,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 700,
              color: B.primary, marginBottom: 6,
            }}>{item.n}</div>
            <div style={{
              fontSize: 11, color: B.muted,
              lineHeight: 1.4, whiteSpace: 'pre-line',
            }}>{item.l}</div>
          </div>
        ))}
      </div>

      {/* Информация о времени */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: testType === 'extended' ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
        gap: 10,
        marginBottom: 24,
      }}>
        <div style={{
          background: B.white, border: '1px solid ' + B.border,
          borderLeft: '3px solid ' + B.primary,
          padding: '.85rem 1rem',
          borderRadius: SHAPE.card,
        }}>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em',
            color: B.muted, marginBottom: 4,
          }}>
            {testType === 'extended' ? t.time_extended : t.time_classic}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: B.text }}>{timeVal}</div>
        </div>
        <div style={{
          background: B.white, border: '1px solid ' + B.border,
          borderLeft: '3px solid ' + B.primary,
          padding: '.85rem 1rem',
          borderRadius: SHAPE.card,
        }}>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em',
            color: B.muted, marginBottom: 4,
          }}>{t.timer}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: B.text }}>{timerVal}</div>
        </div>
        {testType !== 'extended' && (
          <div style={{
            background: B.white, border: '1px solid ' + B.border,
            borderLeft: '3px solid ' + B.primary,
            padding: '.85rem 1rem',
            borderRadius: SHAPE.card,
          }}>
            <div style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em',
              color: B.muted, marginBottom: 4,
            }}>Порог</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: B.text }}>
              {role.ranks?.A ? `${Math.round(role.ranks

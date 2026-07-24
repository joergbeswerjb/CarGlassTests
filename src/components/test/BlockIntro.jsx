// BlockIntro - универсальный стартовый экран для всех ролей
// Поддерживает обе модели:
//   - classic  (technик): 3 блока, билингвальный RU/KZ
//   - extended (OD): 5 блоков, только русский
//   - basic    (офисные позиции): 2 блока, только русский, с выбором вакансии
// Брендинг GlassGo: светлая страница, синий primary, асимметричная плашка.
// Согласие на обработку данных - обязательная галочка, без неё тест не стартует.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'

const T = {
  ru: {
    badge:    'GlassGo · Оценка кандидатов',
    wlc:      'Тест кандидата',
    sub_classic:  'Когнитивный потенциал · Личностный профиль · Стандарт качества',
    sub_extended: 'Когнитивный · DISC · Визуальный · Структурирование · Коммуникация',
    sub_basic:    'Когнитивный потенциал · Личностный профиль DISC',
    b_cog:    'Когнитивный\nблок',
    b_disc:   'Личностный\nпрофиль DISC',
    b_vis:    'Визуальный\nстандарт',
    b_struct: 'Структурирование\nидеи',
    b_comm:   'Неудобный\nразговор',
    time_classic:  'Общее время',
    time_classic_val:  '25-30 мин',
    time_extended: 'Общее время',
    time_extended_val: '40-60 мин',
    timer:     'Таймер Блок 1',
    timer_classic_val:  '12 минут',
    timer_extended_val: '22 минуты',
    time_basic_val:  '30-35 мин',
    timer_basic_val: '20 минут',
    rulesTtl: 'Правила тестирования',
    rules_classic:  'Отвечайте самостоятельно, без посторонней помощи. Блок 1 проходит строго по таймеру. В Блоке 3 внимательно изучите изображение перед тем, как отмечать нарушения.',
    rules_extended: 'Отвечайте самостоятельно, без посторонней помощи и без ИИ-сервисов. Блок 1 проходит строго по таймеру (22 минуты на 20 вопросов); можно пользоваться калькулятором. Тест проходите с компьютера. В блоках 3-5 ответы оцениваются по существу - пишите развёрнуто и конкретно; вернуться к уже пройденному блоку нельзя. Прогресс сохраняется автоматически. Ответы, похожие на сгенерированные ИИ, помечаются и являются основанием для отказа, а все ответы разбираются на собеседовании.',
    rules_basic: 'Отвечайте самостоятельно, без посторонней помощи и без ИИ-сервисов. Блок 1 проходит строго по таймеру (20 минут на 30 вопросов); можно пользоваться калькулятором. Вопросы идут от простых к сложным — дойти до конца удаётся не всем, это нормально. Вернуться к уже пройденному блоку нельзя. В Блоке 2 нет правильных и неправильных ответов: отвечайте как есть.',
    vacancyLabel: 'Позиция, на которую вы претендуете:',
    vacancyPh:    'Выберите позицию',
    noVacancy:    'Выберите позицию',
    consentTtl:   'Согласие на обработку данных',
    consentText:  'Тест собирает и обрабатывает ваши персональные данные (ФИО, ответы, резюме) для оценки кандидатуры. Данные хранятся на облачных сервисах, в том числе за пределами РК, используются только для найма и по запросу могут быть предоставлены, исправлены или удалены.',
    consentCheck: 'Я ознакомлен и даю согласие на обработку моих персональных данных, включая хранение за пределами РК.',
    nameLabel:'Имя и фамилия кандидата:',
    namePh:   'Иванов Иван',
    start:    'Начать тест ->',
    noName:   'Введите имя кандидата',
    noConsent:'Отметьте согласие на обработку данных, чтобы начать',
  },
  kz: {
    badge:    'GlassGo · Кандидаттарды бағалау',
    wlc:      'Кандидат тесті',
    sub_classic:  'Танымдық · Тұлғалық профиль · Сапа стандарты',
    sub_extended: 'Танымдық · DISC · Визуалдық · Идеяны құрылымдау · Коммуникация',
    sub_basic:    'Танымдық әлеует · DISC тұлғалық профилі',
    b_cog:    'Танымдық\nблок',
    b_disc:   'Тұлғалық\nпрофиль DISC',
    b_vis:    'Визуалдық\nстандарт',
    b_struct: 'Идеяны\nқұрылымдау',
    b_comm:   'Қиын\nәңгіме',
    time_classic:  'Жалпы уақыт',
    time_classic_val:  '25-30 мин',
    time_extended: 'Жалпы уақыт',
    time_extended_val: '40-60 мин',
    timer:     '1-блок таймері',
    timer_classic_val:  '12 минут',
    timer_extended_val: '22 минут',
    time_basic_val:  '30-35 мин',
    timer_basic_val: '20 минут',
    rulesTtl: 'Тест ережелері',
    rules_classic:  'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді. 3-блокта суретті мұқият зерттеңіз.',
    rules_extended: 'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді (22 мин). 3-5 блоктарда жауаптарыңыз мазмұны бойынша бағаланады. Прогресс автоматты түрде сақталады.',
    rules_basic: 'Өз бетіңізше жауап беріңіз. 1-блок таймер бойынша жүреді (20 мин). Сұрақтар қарапайымнан күрделіге қарай жүреді. 2-блокта дұрыс және бұрыс жауап жоқ.',
    vacancyLabel: 'Сіз үміткер болып отырған лауазым:',
    vacancyPh:    'Лауазымды таңдаңыз',
    noVacancy:    'Лауазымды таңдаңыз',
    consentTtl:   'Деректерді өңдеуге келісім',
    consentText:  'Тест сіздің жеке деректеріңізді (аты-жөні, жауаптар, түйіндеме) кандидатураны бағалау үшін жинайды және өңдейді. Деректер бұлттық сервистерде, оның ішінде ҚР-дан тыс жерде сақталады, тек жұмысқа қабылдау үшін пайдаланылады және сұрау бойынша берілуі, түзетілуі немесе жойылуы мүмкін.',
    consentCheck: 'Жеке деректерімді өңдеуге, оның ішінде ҚР-дан тыс сақтауға келісім беремін.',
    nameLabel:'Кандидаттың аты-жөні:',
    namePh:   'Иванов Иван',
    start:    'Тестті бастау ->',
    noName:   'Кандидаттың атын енгізіңіз',
    noConsent:'Бастау үшін деректерді өңдеуге келісімді белгілеңіз',
  },
}

export default function BlockIntro({ role, lang, name, onNameChange, vacancy, onVacancyChange, onStart }) {
  const t = T[lang] || T.ru
  const testType = role.testType || 'classic'
  const [consent, setConsent] = useState(false)

  function getQuestionCount(blockKey) {
    const q = role.questions
    if (blockKey === 'cognitive') {
      if (q.COGNITIVE_BANK && q.COGNITIVE_CONFIG) {
        const quotas = q.COGNITIVE_CONFIG.quotas
        if (!quotas) return q.COGNITIVE_BANK.length
        let total = 0
        Object.entries(quotas).forEach(function (entry) {
          const cat = entry[0]
          const count = entry[1]
          if (count === 'all') {
            const required = (q.COGNITIVE_BANK || []).filter(function (item) {
              return item.cat === cat && item.required
            })
            total += required.length
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
    if (blockKey === 'structuring') {
      if (q.STRUCTURING_CASE && q.STRUCTURING_CASE.fields) {
        return q.STRUCTURING_CASE.fields.length
      }
      return 0
    }
    if (blockKey === 'communication') return (q.COMMUNICATION_CASES || []).length
    return 0
  }

  const needsVacancy = Array.isArray(role.vacancies) && role.vacancies.length > 0

  function handleStart() {
    if (!name.trim()) { alert(t.noName); return }
    if (needsVacancy && !vacancy) { alert(t.noVacancy); return }
    if (!consent) { alert(t.noConsent); return }
    onStart()
  }

  const blocksBasic = [
    { n: getQuestionCount('cognitive'), l: t.b_cog  },
    { n: getQuestionCount('disc'),      l: t.b_disc },
  ]

  const blocks = testType === 'basic'
    ? blocksBasic
    : testType === 'extended'
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

  const sub = testType === 'basic' ? t.sub_basic
    : testType === 'extended' ? t.sub_extended : t.sub_classic
  const timeVal = testType === 'basic' ? t.time_basic_val
    : testType === 'extended' ? t.time_extended_val : t.time_classic_val
  const timerVal = testType === 'basic' ? t.timer_basic_val
    : testType === 'extended' ? t.timer_extended_val : t.timer_classic_val
  const rules = testType === 'basic' ? t.rules_basic
    : testType === 'extended' ? t.rules_extended : t.rules_classic

  const gridCols = 'repeat(' + blocks.length + ', 1fr)'
  const timeCols = testType === 'extended' ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  let thresholdText = '-'
  const cogCfg = role.questions && role.questions.COGNITIVE_CONFIG
  if (testType === 'basic' && cogCfg && cogCfg.gate) {
    const baseCount = (role.questions.COGNITIVE_BANK || []).filter(function (q) {
      return q.tier === cogCfg.gate.tier
    }).length
    thresholdText = cogCfg.gate.minCorrect + '+ / ' + baseCount
  } else if (role.ranks && role.ranks.A) {
    const minScore = Math.round(role.ranks.A * 0.8)
    const cogMax = role.cogMax || '-'
    thresholdText = minScore + '+ / ' + cogMax
  }

  const canStart = name.trim() !== '' && consent && (!needsVacancy || vacancy !== '')

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '2.5rem 1.5rem 2rem',
    }}>
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

      {testType !== 'extended' && (
        <p style={{
          fontSize: 14, color: B.muted, lineHeight: 1.6,
          marginBottom: 32, marginTop: 0,
        }}>
          {sub}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: 10,
        marginBottom: 24,
        marginTop: testType === 'extended' ? 28 : 0,
      }}>
        {blocks.map(function (item, i) {
          return (
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
          )
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: timeCols,
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
            <div style={{ fontSize: 15, fontWeight: 600, color: B.text }}>{thresholdText}</div>
          </div>
        )}
      </div>

      <div style={{
        background: '#FFF6E5',
        borderLeft: '3px solid ' + B.amber,
        padding: '.95rem 1.1rem', marginBottom: 24,
        borderRadius: SHAPE.card,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#7A4D0F', marginBottom: 6 }}>{t.rulesTtl}</div>
        <div style={{ fontSize: 13, color: '#7A4D0F', lineHeight: 1.65 }}>{rules}</div>
      </div>

      <div style={{ fontSize: 13, color: B.muted, marginBottom: 8 }}>{t.nameLabel}</div>
      <input
        value={name}
        onChange={function (e) { onNameChange(e.target.value) }}
        onKeyDown={function (e) { if (e.key === 'Enter') handleStart() }}
        placeholder={t.namePh}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', fontSize: 14, color: B.text,
          border: '1px solid ' + B.border, background: B.white,
          fontFamily: 'inherit', marginBottom: '1.25rem',
          outline: 'none', borderRadius: SHAPE.input,
        }}
        onFocus={function (e) { e.target.style.borderColor = B.primary }}
        onBlur={function (e) { e.target.style.borderColor = B.border }}
      />

      {needsVacancy && (
        <div>
          <div style={{ fontSize: 13, color: B.muted, marginBottom: 8 }}>{t.vacancyLabel}</div>
          <select
            value={vacancy || ''}
            onChange={function (e) { onVacancyChange(e.target.value) }}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', fontSize: 14,
              color: vacancy ? B.text : B.muted,
              border: '1px solid ' + B.border, background: B.white,
              fontFamily: 'inherit', marginBottom: '1.25rem',
              outline: 'none', borderRadius: SHAPE.input,
              cursor: 'pointer',
            }}
            onFocus={function (e) { e.target.style.borderColor = B.primary }}
            onBlur={function (e) { e.target.style.borderColor = B.border }}
          >
            <option value="">{t.vacancyPh}</option>
            {role.vacancies.map(function (v) {
              return <option key={v} value={v}>{v}</option>
            })}
          </select>
        </div>
      )}

      <div style={{
        background: B.light, border: '1px solid ' + B.border,
        borderRadius: SHAPE.card, padding: '14px 16px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: B.text, marginBottom: 6 }}>{t.consentTtl}</div>
        <div style={{ fontSize: 12, color: B.muted, lineHeight: 1.6 }}>{t.consentText}</div>
      </div>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        marginBottom: 22, cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={function (e) { setConsent(e.target.checked) }}
          style={{
            marginTop: 2, width: 17, height: 17, flexShrink: 0,
            cursor: 'pointer', accentColor: B.primary,
          }}
        />
        <span style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>{t.consentCheck}</span>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            padding: '12px 32px',
            background: canStart ? B.primary : B.light,
            color: canStart ? B.white : B.muted,
            border: 'none',
            fontSize: 15, fontWeight: 600,
            cursor: canStart ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            borderRadius: SHAPE.asymmetric,
          }}
        >
          {t.start}
        </button>
      </div>
    </div>
  )
}

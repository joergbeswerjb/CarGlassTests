// CandidateCardPage - детальная карточка кандидата.
// Диспетчер: читает cfg из hr-config, маппит типы блоков на компоненты, рендерит.
// Блоки 1-5 свёрнуты в Collapsible (метрика/превью в заголовке); скоркард всегда открыт.
// Глобальный тумблер «Развернуть всё / Свернуть всё» синхронизирует все блоки.
// v10: панель «Оценить кейсы (AI)» — рубричная оценка Блок 4/5 + пересчёт Итога.

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'
import { fetchAssessments, deleteAssessment, generateCaseEval, recomputeOverall } from '../utils/api.js'
import { HR_CONFIG } from '../data/hr-config.js'
import { formatDateLong } from '../utils/hr-format.js'

// Компоненты блоков
import CardSummary from '../components/hr/CardSummary.jsx'
import Collapsible from '../components/hr/Collapsible.jsx'
import BlockCognitiveExtendedSummary from '../components/hr/BlockCognitiveExtendedSummary.jsx'
import BlockDiscExtendedSummary from '../components/hr/BlockDiscExtendedSummary.jsx'
import BlockVisualExtendedSummary from '../components/hr/BlockVisualExtendedSummary.jsx'
import BlockStructuring from '../components/hr/BlockStructuring.jsx'
import BlockCommunication from '../components/hr/BlockCommunication.jsx'
import BlockOpenFields from '../components/hr/BlockOpenFields.jsx'
import BlockCognitiveTieredSummary from '../components/hr/BlockCognitiveTieredSummary.jsx'
import BlockDiscBasicSummary from '../components/hr/BlockDiscBasicSummary.jsx'
import AISections from '../components/hr/AISections.jsx'

// Маппинг типа блока на компонент-рендерер
const BLOCK_RENDERERS = {
  'cognitive-extended': BlockCognitiveExtendedSummary,
  'disc-extended':      BlockDiscExtendedSummary,
  'visual-extended':    BlockVisualExtendedSummary,
  'cognitive-tiered':   BlockCognitiveTieredSummary,
  'disc-basic':         BlockDiscBasicSummary,
  'structuring':        BlockStructuring,
  'communication':      BlockCommunication,
  'case-study':         BlockOpenFields,
  'prioritization':     BlockOpenFields,
  'commercial':           BlockOpenFields,
  'communication-cases':  BlockOpenFields,
  // Classic-блоки для техника - добавим позже когда понадобятся
  'cognitive':          null,
  'disc':               null,
  'visual':             null,
}

// Заголовки секций блоков
const BLOCK_TITLES = {
  'cognitive':          { num: '1', title: 'Когнитивный' },
  'cognitive-extended': { num: '1', title: 'Когнитивный' },
  'disc':               { num: '2', title: 'DISC' },
  'disc-extended':      { num: '2', title: 'DISC' },
  'cognitive-tiered':   { num: '1', title: 'Когнитивный' },
  'disc-basic':         { num: '2', title: 'DISC — профиль' },
  'visual':             { num: '3', title: 'Визуальный стандарт' },
  'visual-extended':    { num: '3', title: 'Визуальный стандарт' },
  'structuring':        { num: '4', title: 'Структурирование идеи' },
  'communication':      { num: '5', title: 'Неудобный разговор' },
  'case-study':         { num: '3', title: 'Кейс-аналитика + письмо EN' },
  'prioritization':     { num: '4', title: 'Приоритизация' },
  'commercial':           { num: '3', title: 'Коммерческое суждение' },
  'communication-cases':  { num: '4', title: 'Коммуникация / переговоры' },
}

// Превью первой строки сырого ответа (для свёрнутого заголовка)
function truncate(s, n) {
  if (s === undefined || s === null) return ''
  const t = String(s).trim()
  if (!t) return ''
  return t.length > n ? '«' + t.slice(0, n) + '…»' : '«' + t + '»'
}

// Метрика/превью для свёрнутого заголовка блока
function blockMeta(blockType, row) {
  if (blockType === 'cognitive-tiered') {
    // Источник — те же колонки, что читает тело блока
    const sc = row['Когнитивный']
    const level = row['Ког. уровень']
    const parts = []
    if (sc) parts.push(String(sc))
    if (level) parts.push('уровень: ' + level)
    return parts.join(' · ')
  }
  if (blockType === 'disc-basic') {
    const osn = row['DISC осн.']
    const vtor = row['DISC втор.']
    const trap = String(row['DISC ловушки'] || '').trim()
    if (!osn) return ''
    return osn + (vtor ? ' / ' + vtor : '') + (trap ? ' · ловушки: расхождение' : '')
  }
  if (blockType === 'cognitive-extended' || blockType === 'cognitive') {
    const sc = row['Когнитивный']
    const pct = row['Когн. %']
    const parts = []
    if (sc) parts.push(String(sc))
    if (pct !== '' && pct !== undefined && pct !== null) parts.push(pct + '%')
    return parts.join(' · ')
  }
  if (blockType === 'disc-extended' || blockType === 'disc') {
    const osn = row['DISC осн.']
    const vtor = row['DISC втор.']
    if (osn) return 'осн. ' + osn + (vtor ? ' · втор. ' + vtor : '')
    return ''
  }
  if (blockType === 'visual-extended' || blockType === 'visual') {
    // Источник истины — тот же JSON, что читает тело блока («AI оценка визуал»).
    const raw = row['AI оценка визуал']
    if (raw) {
      try {
        const o = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (o && o.found_count !== undefined && Array.isArray(o.found_list)) {
          const p = typeof o.pct === 'number' ? o.pct : null
          return o.found_count + '/' + o.total_count + (p !== null ? ' · ' + p + '%' : '')
        }
      } catch (e) { /* невалидный JSON — упадём в запасной вариант ниже */ }
    }
    // Запасной вариант — старые колонки-помощники
    const found = row['Визуал. найдено']
    const pct = row['Визуал. %']
    if (found) return String(found) + (pct !== '' && pct !== undefined && pct !== null ? ' · ' + pct + '%' : '')
    return 'не оценён'
  }
  if (blockType === 'structuring') {
    return caseBlockMeta(row['AI оценка Блок 4'], row['Структ. вопросы'])
  }
  if (blockType === 'communication') {
    return caseBlockMeta(row['AI оценка Блок 5'], row['Комм. кейс 1'])
  }
  if (blockType === 'case-study') {
    return truncate(row['Кейс: сравнение RU'], 38)
  }
  if (blockType === 'prioritization') {
    return truncate(row['Приоритизация'], 38)
  }
  if (blockType === 'commercial') {
    return truncate(row['Кейс: первая сделка'], 38)
  }
  if (blockType === 'communication-cases') {
    return truncate(row['Комм.: барьер доверия'], 38)
  }
  return ''
}

// Для блоков 4/5: если есть AI-оценка — показываем % в заголовке, иначе превью ответа.
function caseBlockMeta(aiRaw, fallbackText) {
  if (aiRaw) {
    try {
      const o = typeof aiRaw === 'string' ? JSON.parse(aiRaw) : aiRaw
      if (o && typeof o.pct === 'number') {
        const rf = o.red_flags && o.red_flags.length ? ' · ⚑ ' + o.red_flags.length : ''
        return 'AI: ' + o.pct + '%' + rf
      }
    } catch (e) { /* битый JSON — упадём в превью */ }
  }
  return truncate(fallbackText, 38)
}

// ============================================================
// Панель «Оценить кейсы (AI)» — рубричная оценка Блок 4/5 + пересчёт Итога
// ============================================================
function pctColor(p) {
  if (p === null || p === undefined) return B.muted
  if (p >= 70) return '#1B7A3D'
  if (p >= 45) return '#B8860B'
  return '#9B1818'
}

function CriteriaList({ title, pct, detail }) {
  const criteria = (detail && detail.criteria) || []
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: B.text }}>{title}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: pctColor(pct) }}>
          {pct === null || pct === undefined ? '—' : pct + '%'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {criteria.map(function (c) {
          return (
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 13, lineHeight: '18px', fontWeight: 700,
                color: c.met ? '#1B7A3D' : '#B0B0B0', minWidth: 14,
              }}>
                {c.met ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: c.met ? B.text : B.muted, lineHeight: 1.4 }}>
                  {c.label} <span style={{ color: B.muted }}>· вес {c.weight}</span>
                </div>
                {c.evidence ? (
                  <div style={{
                    fontSize: 11.5, color: B.muted, fontStyle: 'italic',
                    marginTop: 2, lineHeight: 1.4,
                  }}>
                    {c.evidence}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CaseEvalPanel({ id, role, onDone }) {
  const [state, setState] = useState('idle')   // idle | loading | done | error
  const [cases, setCases] = useState(null)
  const [overall, setOverall] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  function run(fn, failLabel) {
    setState('loading')
    setErrMsg('')
    fn()
      .then(function (res) {
        if (res && res.cases) setCases(res.cases)
        // generate_case_eval → { cases, overall }; recompute_overall → overall-объект
        const ov = res && res.overall !== undefined ? res.overall : res
        setOverall(ov)
        setState('done')
        if (onDone) onDone()   // перезагрузить строку → обновить сводку (Итог/Ранг/Гейт)
      })
      .catch(function (e) {
        setErrMsg((e && e.message) || failLabel)
        setState('error')
      })
  }

  const redFlags = (cases && Array.isArray(cases.red_flags)) ? cases.red_flags : []

  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, padding: '18px 20px', marginTop: 14,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: B.text }}>
            Оценка кейсов (AI) — Блок 4 / Блок 5
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginTop: 3, lineHeight: 1.5 }}>
            AI отмечает критерии рубрики, балл считает код — по смыслу, не по длине.
            Итог % и ранг пересчитываются сразу.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={function () { run(function () { return generateCaseEval(id, role) }, 'Ошибка оценки кейсов') }}
            disabled={state === 'loading'}
            style={{
              padding: '10px 18px', background: B.primary || '#0F3876', color: '#FFFFFF',
              border: 'none', borderRadius: SHAPE.input, fontSize: 13, fontWeight: 600,
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: state === 'loading' ? 0.6 : 1, whiteSpace: 'nowrap',
            }}
          >
            {state === 'loading' ? 'Оценка… (AI, ~15–30 сек)' : state === 'done' ? 'Оценить заново' : 'Оценить кейсы (AI)'}
          </button>
        </div>
      </div>

      {/* Вторичная ссылка: пересчитать Итог без повторного вызова AI */}
      {state !== 'loading' && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={function () { run(function () { return recomputeOverall(id, role) }, 'Ошибка пересчёта') }}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: B.muted, fontSize: 12, padding: 0, fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            только пересчитать Итог (без повторной AI-оценки)
          </button>
        </div>
      )}

      {state === 'error' && (
        <div style={{
          marginTop: 14, padding: '10px 12px', background: '#FDECEC',
          border: '1px solid #E7B4B4', borderRadius: SHAPE.input,
          color: '#9B1818', fontSize: 12.5, lineHeight: 1.5,
        }}>
          {errMsg || 'Не удалось выполнить. Проверь, что кейсы заполнены и бэкенд на v20.'}
        </div>
      )}

      {state === 'done' && (
        <div style={{ marginTop: 16, borderTop: '1px solid ' + B.border, paddingTop: 16 }}>
          {/* Новый Итог */}
          {overall && overall.ok && (
            <div style={{
              display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center',
              marginBottom: 16, padding: '10px 14px',
              background: B.light, borderRadius: SHAPE.input,
            }}>
              <div>
                <span style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Итог</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: pctColor(overall.overall_pct) }}>
                  {overall.overall_pct}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Ранг</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: B.text }}>{overall.rank}</div>
              </div>
              <div style={{ fontSize: 12, color: B.muted, flex: 1, minWidth: 180, lineHeight: 1.5 }}>
                Пересчитано по реальным баллам: когнитивный, DISC, визуал, структурирование и коммуникация.
                {overall.gated ? ' Гейт сработал (нокаут).' : ' Гейт-режим: флаг — профиль не обнулён.'}
              </div>
            </div>
          )}
          {overall && overall.ok === false && overall.needCases && (
            <div style={{
              marginBottom: 14, padding: '10px 12px', background: '#FFF7E6',
              border: '1px solid #E8D08A', borderRadius: SHAPE.input,
              color: '#8A6D1B', fontSize: 12.5, lineHeight: 1.5,
            }}>
              Итог не пересчитан: кейсы ещё не оценены AI. Нажми «Оценить кейсы (AI)».
            </div>
          )}

          {/* Красные флаги — наверху, заметно */}
          {redFlags.length > 0 && (
            <div style={{
              marginBottom: 16, padding: '12px 14px', background: '#FDECEC',
              border: '1px solid #E7B4B4', borderRadius: SHAPE.input,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#9B1818', marginBottom: 6 }}>
                ⚑ Красные флаги ({redFlags.length})
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#9B1818', fontSize: 12.5, lineHeight: 1.5 }}>
                {redFlags.map(function (f, i) {
                  const txt = typeof f === 'string' ? f : (f.quote || f.text || JSON.stringify(f))
                  return <li key={i} style={{ marginBottom: 3 }}>{txt}</li>
                })}
              </ul>
            </div>
          )}

          {/* Разбор по рубрике */}
          {cases && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <CriteriaList title="Структурирование (Блок 4)" pct={cases.struct_pct} detail={cases.struct_detail} />
              <CriteriaList title="Коммуникация (Блок 5)" pct={cases.comm_pct} detail={cases.comm_detail} />
            </div>
          )}

          {cases && cases.summary ? (
            <div style={{ marginTop: 10, fontSize: 12.5, color: B.muted, fontStyle: 'italic', lineHeight: 1.5 }}>
              {cases.summary}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Header (общий с HRPage стиль)
// ============================================================
function Header() {
  return (
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
  )
}

// ============================================================
// Loading / Error / NotFound
// ============================================================
function CenteredCard({ icon, title, description, action }) {
  return (
    <main style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px' }}>
      <div style={{
        background: B.white, border: '1px solid ' + B.border,
        borderRadius: SHAPE.card, padding: '40px 28px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: B.text, margin: '0 0 10px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
          {description}
        </p>
        {action}
      </div>
    </main>
  )
}

// ============================================================
// Main Component
// ============================================================
export default function CandidateCardPage() {
  const navigate = useNavigate()
  const params = useParams()
  const roleSlug = params.roleSlug
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [row, setRow] = useState(null)
  const [allRows, setAllRows] = useState([])
  const [deleting, setDeleting] = useState(false)

  // Глобальный тумблер «Развернуть/Свернуть всё»
  const [forceOpen, setForceOpen] = useState(null)
  const [forceKey, setForceKey] = useState(0)
  const [allOpen, setAllOpen] = useState(false)

  const cfg = HR_CONFIG[roleSlug]

  function toggleAll() {
    const next = !allOpen
    setAllOpen(next)
    setForceOpen(next)
    setForceKey(function (k) { return k + 1 })
  }

  // Загрузка строки кандидата. showLoading=false — тихий рефреш (после AI-оценки).
  function load(showLoading) {
    if (!cfg) {
      setError('role-not-configured')
      setLoading(false)
      return
    }
    if (showLoading) setLoading(true)
    setError(null)
    fetchAssessments(cfg.sheetName)
      .then(function (rows) {
        setAllRows(rows)
        const found = rows.find(function (r) { return String(r['ID']) === String(id) })
        if (!found) {
          setError('not-found')
        } else {
          setRow(found)
        }
      })
      .catch(function (e) {
        setError(e.message || 'Fetch failed')
      })
      .finally(function () {
        if (showLoading) setLoading(false)
      })
  }

  useEffect(function () {
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleSlug, id])

  function handleDelete() {
    if (!row || deleting) return
    const ok = window.confirm('Удалить запись кандидата «' + (row['Имя'] || id) + '»?\nЭто действие нельзя отменить.')
    if (!ok) return
    setDeleting(true)
    deleteAssessment(id, cfg.sheetName)
      .then(function () { navigate('/hr') })
      .catch(function (e) {
        alert('Не удалось удалить: ' + (e.message || 'unknown error'))
        setDeleting(false)
      })
  }

  // ─── Состояния ───
  if (!cfg) {
    return (
      <div style={{ background: B.light, minHeight: '100vh' }}>
        <Header />
        <CenteredCard
          icon="⚠"
          title="Роль не найдена"
          description={'Роль "' + roleSlug + '" не зарегистрирована в HR-конфиге. Проверьте URL.'}
          action={
            <button onClick={function () { navigate('/hr') }} style={btnPrimary}>
              Вернуться к списку
            </button>
          }
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ background: B.light, minHeight: '100vh' }}>
        <Header />
        <CenteredCard icon="…" title="Загрузка" description="Получаем данные кандидата" />
      </div>
    )
  }

  if (error === 'not-found') {
    return (
      <div style={{ background: B.light, minHeight: '100vh' }}>
        <Header />
        <CenteredCard
          icon="🔍"
          title="Кандидат не найден"
          description={'Запись с ID ' + id + ' отсутствует в таблице. Возможно, она была удалена.'}
          action={
            <button onClick={function () { navigate('/hr') }} style={btnPrimary}>
              Вернуться к списку
            </button>
          }
        />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: B.light, minHeight: '100vh' }}>
        <Header />
        <CenteredCard
          icon="⚠"
          title="Ошибка загрузки"
          description={String(error)}
          action={
            <button onClick={function () { navigate('/hr') }} style={btnPrimary}>
              Вернуться к списку
            </button>
          }
        />
      </div>
    )
  }

  // ─── Карточка ───
  const blocks = cfg.cardBlocks || []
  const aiSections = cfg.aiSections || []
  // Панель оценки кейсов — только для ролей с открытыми блоками структ./комм.
  const hasCaseBlocks = blocks.indexOf('structuring') >= 0 || blocks.indexOf('communication') >= 0

  return (
    <div style={{ background: B.light, minHeight: '100vh' }}>
      <Header />

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

        {/* Имя кандидата + дата + роль */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: B.text,
            margin: '0 0 6px',
          }}>
            {row['Имя'] || 'Без имени'}
          </h1>
          <div style={{ fontSize: 13, color: B.muted }}>
            {cfg.label} · {formatDateLong(row['Дата'])}
          </div>
        </div>

        {/* Краткая сводка — всегда открыта */}
        <CardSummary row={row} cfg={cfg} />

        {/* Оценка кейсов (AI) + пересчёт Итога */}
        {hasCaseBlocks && (
          <CaseEvalPanel
            id={id}
            role={cfg.sheetName}
            onDone={function () { load(false) }}
          />
        )}

        {/* Глобальный тумблер */}
        {blocks.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px 0 12px' }}>
            <button
              onClick={toggleAll}
              style={{
                background: 'transparent', border: '1px solid ' + B.border,
                borderRadius: SHAPE.input, cursor: 'pointer',
                color: B.muted, fontSize: 12, fontWeight: 600,
                padding: '6px 14px', fontFamily: 'inherit',
              }}
            >
              {allOpen ? 'Свернуть всё' : 'Развернуть всё'}
            </button>
          </div>
        )}

        {/* Секции блоков — свёрнуты в Collapsible */}
        {blocks.map(function (blockType) {
          const Renderer = BLOCK_RENDERERS[blockType]
          const titleInfo = BLOCK_TITLES[blockType] || { num: '?', title: blockType }
          const isPreview = blockType === 'structuring' || blockType === 'communication' || blockType === 'case-study' || blockType === 'prioritization' || blockType === 'commercial' || blockType === 'communication-cases'
          return (
            <Collapsible
              key={blockType}
              name={'Блок ' + titleInfo.num}
              title={titleInfo.title}
              meta={blockMeta(blockType, row)}
              metaPreview={isPreview}
              defaultOpen={false}
              forceOpen={forceOpen}
              forceKey={forceKey}
            >
              {Renderer ? (
                <Renderer
                  row={row}
                  rows={allRows}
                  cfg={cfg}
                  block={cfg.openBlocks ? cfg.openBlocks[blockType] : undefined}
                />
              ) : (
                <div style={{
                  padding: '16px',
                  background: B.light,
                  borderRadius: SHAPE.input,
                  color: B.muted, fontSize: 13,
                  textAlign: 'center',
                }}>
                  Отображение этого блока для роли «{cfg.label}» будет добавлено позже.
                </div>
              )}
            </Collapsible>
          )
        })}

        {/* AI-секции (сворачивание — на Шаге 4) */}
        {aiSections.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 14,
            }}>
              <h2 style={{
                fontSize: 17, fontWeight: 700, color: B.text,
                margin: 0,
              }}>
                AI-анализ и интервью
              </h2>
              <span style={{
                fontSize: 10, color: B.muted,
                background: B.white,
                border: '1px solid ' + B.border,
                padding: '2px 8px',
                borderRadius: 3, letterSpacing: '.04em',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                Каркас под Часть B
              </span>
            </div>
            <AISections row={row} cfg={cfg} />
          </div>
        )}

        {/* Footer с удалением */}
        <div style={{
          marginTop: 40, paddingTop: 20,
          borderTop: '1px solid ' + B.border,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 11, color: B.muted, fontFamily: 'monospace' }}>
            ID: {id}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '9px 18px',
              background: B.white,
              color: '#9B1818',
              border: '1px solid #C92020',
              borderRadius: SHAPE.input,
              fontSize: 13, fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: deleting ? 0.5 : 1,
            }}
          >
            {deleting ? 'Удаление…' : '🗑 Удалить запись'}
          </button>
        </div>
      </main>
    </div>
  )
}

const btnPrimary = {
  padding: '10px 20px',
  background: '#0F3876', color: '#FFFFFF',
  border: 'none', borderRadius: '12px 0 12px 0',
  fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
}

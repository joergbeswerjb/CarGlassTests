// CandidateCardPage - детальная карточка кандидата.
// Диспетчер: читает cfg из hr-config, маппит типы блоков на компоненты, рендерит.
// Блоки 1-5 свёрнуты в Collapsible (метрика/превью в заголовке); скоркард всегда открыт.
// Глобальный тумблер «Развернуть всё / Свернуть всё» синхронизирует все блоки.

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'
import { fetchAssessments, deleteAssessment } from '../utils/api.js'
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
import AISections from '../components/hr/AISections.jsx'

// Маппинг типа блока на компонент-рендерер
const BLOCK_RENDERERS = {
  'cognitive-extended': BlockCognitiveExtendedSummary,
  'disc-extended':      BlockDiscExtendedSummary,
  'visual-extended':    BlockVisualExtendedSummary,
  'structuring':        BlockStructuring,
  'communication':      BlockCommunication,
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
  'visual':             { num: '3', title: 'Визуальный стандарт' },
  'visual-extended':    { num: '3', title: 'Визуальный стандарт' },
  'structuring':        { num: '4', title: 'Структурирование идеи' },
  'communication':      { num: '5', title: 'Неудобный разговор' },
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
    const found = row['Визуал. найдено']
    const pct = row['Визуал. %']
    if (found) return String(found) + (pct !== '' && pct !== undefined && pct !== null ? ' · ' + pct + '%' : '')
    return 'не оценён'
  }
  if (blockType === 'structuring') {
    return truncate(row['Структ. вопросы'], 38)
  }
  if (blockType === 'communication') {
    return truncate(row['Комм. кейс 1'], 38)
  }
  return ''
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

  useEffect(function () {
    if (!cfg) {
      setError('role-not-configured')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchAssessments(cfg.sheetName)
      .then(function (rows) {
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
        setLoading(false)
      })
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
          const isPreview = blockType === 'structuring' || blockType === 'communication'
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
                <Renderer row={row} cfg={cfg} />
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

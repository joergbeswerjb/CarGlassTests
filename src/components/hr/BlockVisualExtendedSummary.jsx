// Блок 3 — Визуальный стандарт (HR-карточка OD), новая модель.
// Источник истины — колонка «AI оценка визуал» (результат generate_visual_eval):
// найдено/пропущено с уровнями + качество формулировки (1-5), бонус, шум, взвешенный pct, резюме.
// Три состояния:
//   1) ОЦЕНЕНО — полный разбор;
//   2) НЕ ОЦЕНЕНО (новый формат) — показываем сырые примечания кандидата + кнопку «Оценить визуал»;
//   3) LEGACY — старые координатные записи, мягкий фолбэк.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { parseScore } from '../../utils/hr-format.js'
import { generateVisualEval } from '../../utils/api.js'
import { ShowMore } from './Collapsible.jsx'

const LEVEL_RU = { easy: 'лёгкое', medium: 'среднее', hard: 'сложное' }
const FOUND_PREVIEW_N = 4

function pctColor(p) {
  if (p === null || p === undefined) return B.muted
  if (p >= 75) return '#1A7A3C'
  if (p >= 50) return '#BA7517'
  return '#9B1818'
}

function qualityColor(q) {
  if (typeof q !== 'number') return B.muted
  if (q >= 4) return '#1A7A3C'
  if (q >= 3) return '#BA7517'
  return '#9B1818'
}

function MetricCard({ title, value, hint, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 140,
      background: B.light,
      border: '1px solid ' + B.border,
      borderRadius: SHAPE.card,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 11, color: B.muted,
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        fontWeight: 600, marginBottom: 8,
      }}>{title}</div>
      <div style={{
        fontSize: 22, fontWeight: 700,
        color: color || B.text, lineHeight: 1,
      }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>{hint}</div>
      )}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: B.muted,
      textTransform: 'uppercase', letterSpacing: '.06em',
      fontWeight: 600, marginBottom: 8,
    }}>{children}</div>
  )
}

function LevelChip({ level }) {
  const label = LEVEL_RU[level]
  if (!label) return null
  return (
    <span style={{
      fontSize: 10, color: B.muted, background: B.light,
      padding: '1px 7px', borderRadius: 3, marginLeft: 8,
      flexShrink: 0,
    }}>{label}</span>
  )
}

function QualityBadge({ q }) {
  if (typeof q !== 'number') return null
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: B.white,
      background: qualityColor(q), borderRadius: 3,
      padding: '1px 6px', marginLeft: 8, flexShrink: 0,
    }}>{q}/5</span>
  )
}

// Парсинг колонки «AI оценка визуал»
function parseEval(row) {
  const raw = row['AI оценка визуал']
  if (!raw) return null
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (o && o.found_count !== undefined && Array.isArray(o.found_list)) return o
  } catch (e) { /* ignore */ }
  return null
}

// Парсинг «Сырые данные»
function parsePayload(row) {
  try {
    const raw = row['Сырые данные']
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (p && typeof p === 'object') return p
  } catch (e) { /* ignore */ }
  return null
}

export default function BlockVisualExtendedSummary({ row }) {
  const [evalResult, setEvalResult] = useState(parseEval(row))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMissed, setShowMissed] = useState(false)
  const [showAllFound, setShowAllFound] = useState(false)

  const id = row['ID']
  const role = row['Роль']

  function runEval() {
    setLoading(true)
    setError('')
    generateVisualEval(id, role).then(function (result) {
      if (result) setEvalResult(result)
      else setError('Пустой ответ оценки')
      setLoading(false)
    }).catch(function (e) {
      setError((e && e.message) || 'Не удалось оценить визуал')
      setLoading(false)
    })
  }

  // ── Состояние 1: ОЦЕНЕНО ──
  if (evalResult) {
    const ev = evalResult
    const pct = typeof ev.pct === 'number' ? ev.pct : null
    const foundList  = Array.isArray(ev.found_list)  ? ev.found_list  : []
    const missedList = Array.isArray(ev.missed_list) ? ev.missed_list : []
    const bonusList  = Array.isArray(ev.bonus_list)  ? ev.bonus_list  : []
    const missedShown = showMissed ? missedList : missedList.slice(0, 3)
    const hasQuality = typeof ev.avg_quality === 'number'

    return (
      <div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <MetricCard
            title="Нарушений найдено"
            value={ev.found_count + ' / ' + ev.total_count}
            color={B.text}
          />
          <MetricCard
            title="Взвешенный балл"
            value={pct !== null ? pct + '%' : '—'}
            color={pctColor(pct)}
          />
          <MetricCard
            title="Качество формулировок"
            value={hasQuality ? ev.avg_quality + ' / 5' : '—'}
            hint="средн. по найденным"
            color={hasQuality ? qualityColor(ev.avg_quality) : B.muted}
          />
        </div>

        {/* Бонус / шум — целыми числами */}
        <div style={{
          display: 'flex', gap: 18, flexWrap: 'wrap',
          padding: '10px 0',
          borderTop: '1px solid ' + B.border,
          borderBottom: '1px solid ' + B.border,
          marginBottom: 16, fontSize: 13, color: B.muted,
        }}>
          <span>Бонус (вне списка): <strong style={{ color: B.text, fontWeight: 700 }}>{ev.bonus_count || 0}</strong></span>
          <span>Шум: <strong style={{ color: B.text, fontWeight: 700 }}>{ev.noise_count || 0}</strong></span>
        </div>

        {/* Найдено: уровень + качество + примечание кандидата */}
        {foundList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Найдено</SectionLabel>
            {(showAllFound ? foundList : foundList.slice(0, FOUND_PREVIEW_N)).map(function (f, i, arr) {
              return (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + B.light : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: B.text }}>
                    <span style={{ color: '#1A7A3C', marginRight: 8, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ wordBreak: 'break-word', flex: 1 }}>{f.label}</span>
                    <LevelChip level={f.level} />
                    <QualityBadge q={f.quality} />
                  </div>
                  {f.note && (
                    <div style={{ fontSize: 12, color: B.muted, fontStyle: 'italic', marginLeft: 20, marginTop: 3, lineHeight: 1.5 }}>
                      «{f.note}»
                    </div>
                  )}
                </div>
              )
            })}
            <ShowMore
              count={foundList.length - FOUND_PREVIEW_N}
              expanded={showAllFound}
              onToggle={function () { setShowAllFound(!showAllFound) }}
              moreLabel={'Ещё ' + (foundList.length - FOUND_PREVIEW_N)}
              lessLabel="Свернуть"
            />
          </div>
        )}

        {/* Пропущено */}
        {missedList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Пропущено</SectionLabel>
            {missedShown.map(function (m, i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', fontSize: 13, color: B.muted }}>
                  <span style={{ marginRight: 8, flexShrink: 0 }}>–</span>
                  <span style={{ wordBreak: 'break-word' }}>{m.label}</span>
                  <LevelChip level={m.level} />
                </div>
              )
            })}
            {missedList.length > 3 && (
              <button
                onClick={function () { setShowMissed(!showMissed) }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 0', fontSize: 12, color: B.primary,
                  fontWeight: 600, fontFamily: 'inherit',
                }}
              >
                {showMissed ? 'Свернуть' : 'Ещё ' + (missedList.length - 3)}
              </button>
            )}
          </div>
        )}

        {/* Осмысленные наблюдения вне списка (бонус) */}
        {bonusList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel>Осмысленные наблюдения вне списка</SectionLabel>
            {bonusList.map(function (b, i) {
              const text = b.note || ''
              if (!text) return null
              return (
                <div key={i} style={{
                  background: '#FFF6E5',
                  borderLeft: '3px solid ' + B.amber,
                  borderRadius: SHAPE.input,
                  padding: '10px 14px', marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13, color: B.text, fontStyle: 'italic', lineHeight: 1.5 }}>«{text}»</div>
                  {b.why && <div style={{ fontSize: 12, color: B.muted, marginTop: 4 }}>{b.why}</div>}
                </div>
              )
            })}
          </div>
        )}

        {/* Резюме AI */}
        {ev.summary && (
          <div style={{
            background: B.light, borderRadius: SHAPE.card,
            padding: '12px 14px', fontSize: 13, color: B.text,
            lineHeight: 1.6, marginBottom: 12,
          }}>
            {ev.summary}
          </div>
        )}

        {/* Переоценить */}
        <button
          onClick={runEval}
          disabled={loading}
          style={{
            background: 'transparent', border: 'none',
            cursor: loading ? 'default' : 'pointer',
            padding: '4px 0', fontSize: 12,
            color: loading ? B.muted : B.primary,
            fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          {loading ? 'Переоцениваю…' : '↻ Переоценить'}
        </button>
        {error && <div style={{ fontSize: 12, color: '#9B1818', marginTop: 6 }}>{error}</div>}
      </div>
    )
  }

  // ── Состояние 2: НЕ ОЦЕНЕНО (новый формат) — примечания + кнопка ──
  const payload = parsePayload(row)
  if (payload && Array.isArray(payload.vis_observations)) {
    const observations = payload.vis_observations
    const obsCount = payload.vis_observation_count !== undefined ? payload.vis_observation_count : null
    const totalCount = payload.vis_total_count !== undefined ? payload.vis_total_count : null

    return (
      <div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <MetricCard
            title="Отмечено наблюдений"
            value={obsCount !== null ? String(obsCount) : '—'}
            hint={totalCount !== null ? 'нарушений в сценах: ' + totalCount : null}
            color={B.text}
          />
          <MetricCard title="AI-оценка" value="не запущена" color={B.muted} />
        </div>

        {/* Сырые примечания кандидата по сценам — первичны */}
        {observations.map(function (sc, si) {
          const notes = Array.isArray(sc.notes) ? sc.notes : []
          if (notes.length === 0) return null
          return (
            <div key={si} style={{ marginBottom: 14 }}>
              <SectionLabel>{sc.title || sc.sceneId}</SectionLabel>
              {notes.map(function (n, ni) {
                return (
                  <div key={ni} style={{
                    fontSize: 13, color: B.text, padding: '5px 0', lineHeight: 1.5,
                    borderBottom: ni < notes.length - 1 ? '1px solid ' + B.light : 'none',
                  }}>
                    {n.explanation}
                  </div>
                )
              })}
            </div>
          )
        })}

        <button
          onClick={runEval}
          disabled={loading}
          style={{
            marginTop: 8, padding: '10px 20px',
            background: loading ? B.light : B.primary,
            color: loading ? B.muted : B.white,
            border: 'none', borderRadius: SHAPE.asymmetric,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Оцениваю…' : 'Оценить визуал (AI)'}
        </button>
        {error && <div style={{ fontSize: 12, color: '#9B1818', marginTop: 8 }}>{error}</div>}
      </div>
    )
  }

  // ── Состояние 3: LEGACY (старые координатные записи) ──
  const foundScore = parseScore(row['Визуал. найдено'])
  const pctRaw = row['Визуал. %']
  const pctL = pctRaw !== undefined && pctRaw !== null && pctRaw !== '' ? Number(pctRaw) : null
  const bonus = row['Визуал. бонус']
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <MetricCard
        title="Найдено (взвеш.)"
        value={foundScore ? foundScore.score + ' / ' + foundScore.max : '—'}
        hint={pctL !== null ? pctL + '%' : null}
        color={pctColor(pctL)}
      />
      <MetricCard
        title="Бонусных отметок"
        value={bonus !== undefined && bonus !== null && bonus !== '' ? String(bonus) : '—'}
        hint="осмысленные клики вне списка"
      />
      <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: B.muted }}>
        Запись сделана до обновления визуального блока — детальный разбор доступен для новых прохождений.
      </div>
    </div>
  )
}

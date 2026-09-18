// Блок 3 — Визуальный стандарт (HR-карточка OD).
// ПРИНЦИП: сырой ответ кандидата первичен и виден ВСЕГДА, до всякой AI-оценки.
// Примечания кандидата по сценам рендерятся первыми в любом состоянии.
// AI-разбор (колонка «AI оценка визуал») — вторичен, показывается ниже, когда есть.
// Заглушка «нет данных» — только если у записи вообще нет ни примечаний, ни меток.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
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
      flex: 1, minWidth: 140, background: B.light,
      border: '1px solid ' + B.border, borderRadius: SHAPE.card, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || B.text, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>{hint}</div>}
    </div>
  )
}
function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>{children}</div>
}
function LevelChip({ level }) {
  const label = LEVEL_RU[level]
  if (!label) return null
  return <span style={{ fontSize: 10, color: B.muted, background: B.light, padding: '1px 7px', borderRadius: 3, marginLeft: 8, flexShrink: 0 }}>{label}</span>
}
function QualityBadge({ q }) {
  if (typeof q !== 'number') return null
  return <span style={{ fontSize: 10, fontWeight: 700, color: B.white, background: qualityColor(q), borderRadius: 3, padding: '1px 6px', marginLeft: 8, flexShrink: 0 }}>{q}/5</span>
}

// «AI оценка визуал» → объект разбора или null
function parseEval(row) {
  const raw = row['AI оценка визуал']
  if (!raw) return null
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (o && o.found_count !== undefined && Array.isArray(o.found_list)) return o
  } catch (e) { /* ignore */ }
  return null
}

// «Сырые данные» → payload или null
function parsePayload(row) {
  try {
    const raw = row['Сырые данные']
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (p && typeof p === 'object') return p
  } catch (e) { /* ignore */ }
  return null
}

// Достаём примечания кандидата по сценам из любого доступного источника.
// 1) payload.vis_observations (новый формат, сгруппировано по сценам)
// 2) payload.raw_vis_marks (плоский список меток) → группируем по sceneId
// Возвращает [{sceneId, title, notes:[{explanation, x, y}]}] или [].
function getObservations(payload) {
  if (!payload) return []
  if (Array.isArray(payload.vis_observations) && payload.vis_observations.length) {
    return payload.vis_observations.map(function (sc) {
      return { sceneId: sc.sceneId, title: sc.title || sc.sceneId, notes: Array.isArray(sc.notes) ? sc.notes : [] }
    })
  }
  if (Array.isArray(payload.raw_vis_marks) && payload.raw_vis_marks.length) {
    const order = []
    const map = {}
    payload.raw_vis_marks.forEach(function (m) {
      const key = m.sceneId || 'scene'
      if (!map[key]) { map[key] = { sceneId: key, title: key, notes: [] }; order.push(key) }
      map[key].notes.push({ explanation: m.explanation, x: m.x, y: m.y })
    })
    return order.map(function (k) { return map[k] })
  }
  return []
}

function totalViolations(payload) {
  if (!payload) return null
  if (typeof payload.vis_total_count === 'number') return payload.vis_total_count
  if (Array.isArray(payload.vis_ground_truth)) {
    return payload.vis_ground_truth.reduce(function (n, sc) {
      return n + (Array.isArray(sc.violations) ? sc.violations.length : 0)
    }, 0)
  }
  return null
}

// Сырые примечания кандидата — рендерятся ПЕРВЫМИ, всегда.
function RawNotes({ observations }) {
  if (!observations.length) return null
  return (
    <div style={{ marginBottom: 18 }}>
      <SectionLabel>Ответы кандидата по сценам (сырые)</SectionLabel>
      {observations.map(function (sc, si) {
        const notes = Array.isArray(sc.notes) ? sc.notes : []
        if (!notes.length) return null
        return (
          <div key={si} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: B.text, marginBottom: 4 }}>
              {sc.title} <span style={{ color: B.muted, fontWeight: 400 }}>· {notes.length}</span>
            </div>
            {notes.map(function (n, ni) {
              return (
                <div key={ni} style={{
                  fontSize: 13, color: B.text, padding: '5px 0', lineHeight: 1.5,
                  borderBottom: ni < notes.length - 1 ? '1px solid ' + B.light : 'none',
                }}>
                  <span style={{ color: B.muted, marginRight: 8 }}>•</span>{n.explanation}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function BlockVisualExtendedSummary({ row }) {
  const [evalResult, setEvalResult] = useState(parseEval(row))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMissed, setShowMissed] = useState(false)
  const [showAllFound, setShowAllFound] = useState(false)

  const id = row['ID']
  const role = row['Роль']
  const payload = parsePayload(row)
  const observations = getObservations(payload)
  const total = totalViolations(payload)
  const obsCount = observations.reduce(function (n, sc) { return n + (sc.notes ? sc.notes.length : 0) }, 0)

  function runEval() {
    setLoading(true); setError('')
    generateVisualEval(id, role).then(function (result) {
      if (result) setEvalResult(result); else setError('Пустой ответ оценки')
      setLoading(false)
    }).catch(function (e) {
      setError((e && e.message) || 'Не удалось оценить визуал'); setLoading(false)
    })
  }

  // Совсем нет данных — ни примечаний, ни разбора: только тогда мягкая заглушка.
  if (!observations.length && !evalResult) {
    const pctRaw = row['Визуал. %']
    const pctL = pctRaw !== undefined && pctRaw !== null && pctRaw !== '' ? Number(pctRaw) : null
    return (
      <div style={{ fontSize: 13, color: B.muted, lineHeight: 1.6 }}>
        {pctL !== null && (
          <div style={{ marginBottom: 6 }}>Старый счётчик отметок: <strong style={{ color: B.text }}>{pctL}%</strong> (не точность).</div>
        )}
        Текстовых примечаний кандидата в записи нет — вероятно, пройдена старая версия визуального блока (только клики по зонам, без описания словами).
      </div>
    )
  }

  return (
    <div>
      {/* 1) СЫРОЙ ОТВЕТ КАНДИДАТА — ВСЕГДА ПЕРВЫМ */}
      <RawNotes observations={observations} />

      {/* 2) AI-разбор — вторичен */}
      {evalResult ? (
        <AIBreakdown
          ev={evalResult}
          showMissed={showMissed} setShowMissed={setShowMissed}
          showAllFound={showAllFound} setShowAllFound={setShowAllFound}
          onRerun={runEval} loading={loading} error={error}
        />
      ) : (
        <div style={{ borderTop: '1px solid ' + B.border, paddingTop: 14 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <MetricCard title="Отмечено наблюдений" value={String(obsCount)} hint={total !== null ? 'нарушений в сценах: ' + total : null} color={B.text} />
            <MetricCard title="AI-оценка" value="не запущена" color={B.muted} />
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 10, lineHeight: 1.5 }}>
            Число отметок ≠ точность. Запустите оценку, чтобы увидеть, что из отмеченного — реальные нарушения, а что шум.
          </div>
          <button onClick={runEval} disabled={loading} style={{
            padding: '10px 20px', background: loading ? B.light : B.primary,
            color: loading ? B.muted : B.white, border: 'none', borderRadius: SHAPE.asymmetric,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
          }}>
            {loading ? 'Оцениваю…' : 'Оценить визуал (AI)'}
          </button>
          {error && <div style={{ fontSize: 12, color: '#9B1818', marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </div>
  )
}

function AIBreakdown({ ev, showMissed, setShowMissed, showAllFound, setShowAllFound, onRerun, loading, error }) {
  const pct = typeof ev.pct === 'number' ? ev.pct : null
  const foundList = Array.isArray(ev.found_list) ? ev.found_list : []
  const missedList = Array.isArray(ev.missed_list) ? ev.missed_list : []
  const bonusList = Array.isArray(ev.bonus_list) ? ev.bonus_list : []
  const missedShown = showMissed ? missedList : missedList.slice(0, 3)
  const hasQuality = typeof ev.avg_quality === 'number'

  return (
    <div style={{ borderTop: '1px solid ' + B.border, paddingTop: 14 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetricCard title="Нарушений найдено" value={ev.found_count + ' / ' + ev.total_count} color={B.text} />
        <MetricCard title="Взвешенный балл" value={pct !== null ? pct + '%' : '—'} color={pctColor(pct)} />
        <MetricCard title="Качество формулировок" value={hasQuality ? ev.avg_quality + ' / 5' : '—'} hint="средн. по найденным" color={hasQuality ? qualityColor(ev.avg_quality) : B.muted} />
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid ' + B.border, borderBottom: '1px solid ' + B.border, marginBottom: 16, fontSize: 13, color: B.muted }}>
        <span>Бонус (вне списка): <strong style={{ color: B.text, fontWeight: 700 }}>{ev.bonus_count || 0}</strong></span>
        <span>Шум: <strong style={{ color: B.text, fontWeight: 700 }}>{ev.noise_count || 0}</strong></span>
      </div>

      {foundList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Найдено (сверка с эталоном)</SectionLabel>
          {(showAllFound ? foundList : foundList.slice(0, FOUND_PREVIEW_N)).map(function (f, i, arr) {
            return (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + B.light : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: B.text }}>
                  <span style={{ color: '#1A7A3C', marginRight: 8, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span style={{ wordBreak: 'break-word', flex: 1 }}>{f.label}</span>
                  <LevelChip level={f.level} /><QualityBadge q={f.quality} />
                </div>
                {f.note && <div style={{ fontSize: 12, color: B.muted, fontStyle: 'italic', marginLeft: 20, marginTop: 3, lineHeight: 1.5 }}>«{f.note}»</div>}
              </div>
            )
          })}
          <ShowMore count={foundList.length - FOUND_PREVIEW_N} expanded={showAllFound}
            onToggle={function () { setShowAllFound(!showAllFound) }}
            moreLabel={'Ещё ' + (foundList.length - FOUND_PREVIEW_N)} lessLabel="Свернуть" />
        </div>
      )}

      {missedList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Пропущено</SectionLabel>
          {missedShown.map(function (m, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', fontSize: 13, color: B.muted }}>
                <span style={{ marginRight: 8, flexShrink: 0 }}>–</span>
                <span style={{ wordBreak: 'break-word' }}>{m.label}</span><LevelChip level={m.level} />
              </div>
            )
          })}
          {missedList.length > 3 && (
            <button onClick={function () { setShowMissed(!showMissed) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: 12, color: B.primary, fontWeight: 600, fontFamily: 'inherit' }}>
              {showMissed ? 'Свернуть' : 'Ещё ' + (missedList.length - 3)}
            </button>
          )}
        </div>
      )}

      {bonusList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Осмысленные наблюдения вне списка</SectionLabel>
          {bonusList.map(function (b, i) {
            const text = b.note || ''
            if (!text) return null
            return (
              <div key={i} style={{ background: '#FFF6E5', borderLeft: '3px solid ' + B.amber, borderRadius: SHAPE.input, padding: '10px 14px', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: B.text, fontStyle: 'italic', lineHeight: 1.5 }}>«{text}»</div>
                {b.why && <div style={{ fontSize: 12, color: B.muted, marginTop: 4 }}>{b.why}</div>}
              </div>
            )
          })}
        </div>
      )}

      {ev.summary && (
        <div style={{ background: B.light, borderRadius: SHAPE.card, padding: '12px 14px', fontSize: 13, color: B.text, lineHeight: 1.6, marginBottom: 12 }}>{ev.summary}</div>
      )}

      <button onClick={onRerun} disabled={loading} style={{ background: 'transparent', border: 'none', cursor: loading ? 'default' : 'pointer', padding: '4px 0', fontSize: 12, color: loading ? B.muted : B.primary, fontWeight: 600, fontFamily: 'inherit' }}>
        {loading ? 'Переоцениваю…' : '↻ Переоценить'}
      </button>
      {error && <div style={{ fontSize: 12, color: '#9B1818', marginTop: 6 }}>{error}</div>}
    </div>
  )
}

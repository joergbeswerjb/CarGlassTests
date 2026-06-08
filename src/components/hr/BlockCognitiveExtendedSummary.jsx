// Блок 1 — Когнитивный для OD-формата. Общий счёт + DATA-подсчёт + статус времени.

import { B, SHAPE } from '../../utils/brand.js'
import { parseScore, isTrue } from '../../utils/hr-format.js'

function StatCard({ title, score, color, hint }) {
  if (!score) {
    return (
      <div style={cardStyle}>
        <div style={cardTitle}>{title}</div>
        <div style={{ color: B.muted, fontSize: 24, fontWeight: 700 }}>—</div>
      </div>
    )
  }
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: B.text, lineHeight: 1 }}>
          {score.score}<span style={{ color: B.muted, fontSize: 18, fontWeight: 500 }}> / {score.max}</span>
        </div>
        {score.pct !== null && (
          <div style={{ fontSize: 16, fontWeight: 700, color: color }}>
            {score.pct}%
          </div>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

const cardStyle = {
  flex: 1, minWidth: 200,
  background: B.light,
  border: '1px solid ' + B.border,
  borderRadius: SHAPE.card,
  padding: '16px 18px',
}

const cardTitle = {
  fontSize: 11, color: B.muted,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  fontWeight: 600,
  marginBottom: 10,
}

export default function BlockCognitiveExtendedSummary({ row }) {
  const cogScore = parseScore(row['Когнитивный'])
  const dataScore = parseScore(row['Когн. DATA'])
  const timeOk = isTrue(row['Когн. время OK'])

  function colorByPct(pct) {
    if (pct === null || pct === undefined) return B.muted
    if (pct >= 75) return '#1A7A3C'
    if (pct >= 50) return '#BA7517'
    return '#9B1818'
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <StatCard
          title="Всего правильных"
          score={cogScore}
          color={colorByPct(cogScore && cogScore.pct)}
          hint="Общий когнитивный балл по всему блоку"
        />
        <StatCard
          title="DATA-задачи"
          score={dataScore}
          color={colorByPct(dataScore && dataScore.pct)}
          hint="Работа с данными — критично для OD"
        />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: timeOk ? '#E8F5EE' : '#FBE6E6',
        border: '1px solid ' + (timeOk ? '#1A7A3C' : '#C92020'),
        borderRadius: SHAPE.input,
        fontSize: 13,
      }}>
        <span style={{ fontSize: 16 }}>{timeOk ? '✓' : '⏱'}</span>
        <span style={{ color: timeOk ? '#1A7A3C' : '#9B1818', fontWeight: 600 }}>
          {timeOk ? 'Время блока уложился' : 'Время блока вышло (гейт)'}
        </span>
      </div>
    </div>
  )
}

// AI-флаги по ответам кандидата (Часть B.1).
// При открытии карточки: если флаги уже есть в строке - рисуем; если нет -
// дёргаем generate_flags, пока идёт вызов - индикатор, при ошибке - retry.
// Промпт OD-специфичный, поэтому генерация включена только для ролей из
// FLAGS_ROLES. При добавлении senior-ролей перенести в конфиг роли (cfg.ai.flags).
//
// Каждый флаг свёрнут до «severity + тип»; разбор (цитата + объяснение +
// привязка к роли) раскрывается по клику на заголовок флага.

import { useState, useEffect } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { generateFlags } from '../../utils/api.js'

const FLAGS_ROLES = {
  'Операционный директор': true,
}

// Цвета и подпись по уровню флага.
const SEV = {
  positive:     { label: 'сила',      fg: B.green, bg: B.greenBg, border: '#BFE3CC' },
  yellow:       { label: 'проверить', fg: B.amber, bg: '#FBF1E0', border: '#F0DFC0' },
  critical_red: { label: 'риск',      fg: B.red,   bg: B.redBg,   border: '#F3C9C9' },
}

function parseStored(raw) {
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr) && arr.length > 0) return arr
    return null
  } catch (e) {
    return null
  }
}

function Chevron({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      style={{
        flexShrink: 0,
        transition: 'transform .15s',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" fill="none" stroke={B.muted} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlagCard({ flag }) {
  const sev = SEV[flag.severity] || SEV.yellow
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, marginBottom: 12, overflow: 'hidden',
    }}>
      <button
        onClick={function () { setOpen(!open) }}
        onMouseEnter={function () { setHover(true) }}
        onMouseLeave={function () { setHover(false) }}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px',
          background: hover ? B.light : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit', transition: 'background .12s',
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 600, color: sev.fg, background: sev.bg,
          border: '1px solid ' + sev.border, padding: '3px 10px',
          borderRadius: 4, letterSpacing: '.03em', textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {sev.label}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: B.text }}>
          {flag.type}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{
            background: B.light, borderRadius: SHAPE.input, padding: '8px 12px',
            fontSize: 14, color: B.muted, fontStyle: 'italic', lineHeight: 1.6,
            marginBottom: 10,
          }}>
            {'\u00AB' + flag.quote + '\u00BB'}
          </div>

          <p style={{ fontSize: 14, color: B.text, lineHeight: 1.6, margin: '0 0 10px' }}>
            {flag.explanation}
          </p>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: B.muted, whiteSpace: 'nowrap' }}>Для роли:</span>
            <span style={{ color: sev.fg }}>{flag.role_implication}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIFlags({ row }) {
  const id = row['ID']
  const role = row['Роль']

  const [flags, setFlags] = useState(function () { return parseStored(row['AI флаги']) })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function run() {
    setLoading(true)
    setError(null)
    generateFlags(id, role)
      .then(function (result) {
        setFlags(result)
        setLoading(false)
      })
      .catch(function (err) {
        setError(String(err.message || err))
        setLoading(false)
      })
  }

  useEffect(function () {
    if (!FLAGS_ROLES[role]) return
    const stored = parseStored(row['AI флаги'])
    if (stored) { setFlags(stored); return }
    run()
    // eslint-disable-next-line
  }, [id])

  if (!FLAGS_ROLES[role]) {
    return (
      <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
        AI-флаги для этой роли пока не настроены.
      </p>
    )
  }

  if (loading) {
    return (
      <div style={{
        fontSize: 13, color: B.muted, padding: '10px 0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: B.primary, display: 'inline-block',
        }} />
        AI анализирует ответы кандидата, ~10 секунд...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: B.redBg, border: '1px solid #F3C9C9',
        borderRadius: SHAPE.card, padding: '12px 14px',
      }}>
        <p style={{ fontSize: 13, color: B.red, margin: '0 0 10px', lineHeight: 1.5 }}>
          Не удалось получить флаги: {error}
        </p>
        <button
          onClick={run}
          style={{
            padding: '8px 16px', background: B.primary, color: B.white,
            border: 'none', borderRadius: SHAPE.asymmetric,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (!flags || flags.length === 0) {
    return (
      <p style={{ fontSize: 13, color: B.muted, margin: 0 }}>
        Флагов нет.
      </p>
    )
  }

  return (
    <div>
      {flags.map(function (flag, i) {
        return <FlagCard key={i} flag={flag} />
      })}
    </div>
  )
}

// Универсальная сворачиваемая секция для HR-досье.
// Заголовок (всегда виден): имя блока + название + метрика/превью справа + шеврон.
// Тело раскрывается по клику. Поддерживает глобальный тумблер «Развернуть/Свернуть всё»
// через пару пропсов forceOpen + forceKey: когда родитель меняет forceKey,
// секция пересинхронизируется на forceOpen; локальные клики работают свободно между этим.

import { useState, useEffect } from 'react'
import { B, SHAPE } from '../../utils/brand.js'

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

export default function Collapsible({
  name,            // «Блок 3» / «AI» — маленькая метка слева
  title,           // «Визуальный стандарт»
  meta,            // строка справа: метрика или превью (node или строка)
  metaPreview,     // true → курсив + многоточие (для сырого текста)
  defaultOpen = false,
  forceOpen = null,   // глобальный тумблер: true/false; null = не навязывать
  forceKey = 0,       // меняется при каждом нажатии глобального тумблера
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [hover, setHover] = useState(false)

  useEffect(function () {
    if (forceOpen !== null) setOpen(forceOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceKey])

  return (
    <div style={{
      background: B.white,
      border: '1px solid ' + B.border,
      borderRadius: SHAPE.card,
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      <button
        onClick={function () { setOpen(!open) }}
        onMouseEnter={function () { setHover(true) }}
        onMouseLeave={function () { setHover(false) }}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          background: hover ? B.light : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background .12s',
        }}
      >
        {name && (
          <span style={{
            fontSize: 11, color: B.muted,
            textTransform: 'uppercase', letterSpacing: '.05em',
            fontWeight: 600, minWidth: 56, flexShrink: 0,
          }}>{name}</span>
        )}
        <span style={{ fontSize: 15, fontWeight: 700, color: B.text, flexShrink: 0 }}>
          {title}
        </span>
        {meta !== undefined && meta !== null && meta !== '' && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: B.muted,
            fontStyle: metaPreview ? 'italic' : 'normal',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 260,
          }}>{meta}</span>
        )}
        <span style={{ marginLeft: meta ? 10 : 'auto', display: 'flex', alignItems: 'center' }}>
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Кликабельный контрол «ещё N» / «свернуть» для списков внутри блока.
export function ShowMore({ count, expanded, onToggle, moreLabel, lessLabel }) {
  if (!count || count <= 0) return null
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: '6px 0', fontSize: 12, color: B.primary,
        fontWeight: 600, fontFamily: 'inherit',
      }}
    >
      {expanded ? (lessLabel || 'Свернуть') : (moreLabel || ('Ещё ' + count))}
    </button>
  )
}

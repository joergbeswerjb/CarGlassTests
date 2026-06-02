// ─── BrandedButton — главные CTA-кнопки с асимметричной плашкой «Go» ────────
// Используется для: Начать тест, Дальше, Завершить блок, Подтвердить и т.п.
// Для вторичных действий (Назад, Отмена) — обычный <button>, не этот компонент.

import { B, SHAPE } from '../utils/brand.js'

export default function BrandedButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',   // 'primary' | 'dark' | 'outline'
  size    = 'md',        // 'sm' | 'md' | 'lg'
  style   = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '6px 16px',  fontSize: 13, radius: SHAPE.asymmetricSm },
    md: { padding: '10px 28px', fontSize: 14, radius: SHAPE.asymmetric },
    lg: { padding: '14px 40px', fontSize: 16, radius: SHAPE.asymmetric },
  }[size]

  const variants = {
    primary: {
      background: disabled ? B.border : B.primary,
      color:      disabled ? B.muted  : B.white,
      border:     'none',
    },
    dark: {
      background: disabled ? B.border : B.dark,
      color:      disabled ? B.muted  : B.white,
      border:     'none',
    },
    outline: {
      background: 'transparent',
      color:      disabled ? B.muted : B.primary,
      border:     `1.5px solid ${disabled ? B.border : B.primary}`,
    },
  }[variant]

  const baseStyle = {
    padding: sizes.padding,
    fontSize: sizes.fontSize,
    fontWeight: 600,
    borderRadius: sizes.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    transition: 'all .15s',
    ...variants,
    ...style,
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseOver={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = B.primaryDark
        else if (variant === 'outline') e.currentTarget.style.background = B.light
      }}
      onMouseOut={e => {
        if (disabled) return
        e.currentTarget.style.background = variants.background
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

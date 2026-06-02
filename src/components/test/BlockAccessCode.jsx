// ─── Экран кода доступа ──────────────────────────────────────────────────────
// Простой пароль перед стартом теста (защита от случайных людей на URL)

import { useState } from 'react'
import { B } from '../../utils/brand.js'

export default function BlockAccessCode({ expectedCode, onSuccess }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (code.trim().toLowerCase() === expectedCode.toLowerCase()) {
      onSuccess()
    } else {
      setError('Неверный код. Попросите код у нанимающего.')
    }
  }

  return (
    <div style={{ padding: '4rem 1rem', maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: 22, marginBottom: 12, color: B.text }}>Тест для кандидатов</h2>
      <p style={{ fontSize: 14, color: B.muted, marginBottom: 28 }}>
        Введите код доступа, который вам выдали перед собеседованием.
      </p>

      <input
        type="text"
        value={code}
        onChange={e => { setCode(e.target.value); setError('') }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Код доступа"
        autoFocus
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: 15,
          border: `2px solid ${error ? B.red : B.border}`,
          borderRadius: 6,
          outline: 'none',
          textAlign: 'center',
          letterSpacing: 2,
          marginBottom: 12,
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <p style={{ fontSize: 13, color: B.red, marginBottom: 16 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: 15,
          fontWeight: 600,
          border: 'none',
          borderRadius: '12px 0 12px 0',
          background: B.primary,
          color: B.white,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Продолжить
      </button>
    </div>
  )
}

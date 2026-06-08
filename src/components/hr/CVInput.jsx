// Ввод текста резюме кандидата (B.2). Сохраняется в колонку "CV текст",
// учитывается при генерации сценария интервью и финального анализа.

import { useState } from 'react'
import { B, SHAPE } from '../../utils/brand.js'
import { saveCV } from '../../utils/api.js'

export default function CVInput({ row }) {
  const id = row['ID']
  const role = row['Роль']
  const [text, setText] = useState(row['CV текст'] || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setText(e.target.value)
    setSaved(false)
  }

  function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    saveCV(id, role, text)
      .then(function () {
        setSaving(false)
        setSaved(true)
      })
      .catch(function (err) {
        setSaving(false)
        setError(String(err.message || err))
      })
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Вставьте текст резюме кандидата. Учитывается при генерации сценария интервью и финального анализа."
        rows={6}
        style={{
          width: '100%', boxSizing: 'border-box',
          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
          color: B.text, background: B.white,
          border: '1px solid ' + B.border, borderRadius: SHAPE.input,
          padding: '10px 12px', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 16px',
            background: saving ? B.light : B.primary,
            color: saving ? B.muted : B.white,
            border: 'none', borderRadius: SHAPE.asymmetric,
            fontSize: 13, fontWeight: 600,
            cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {saving ? 'Сохранение...' : 'Сохранить CV'}
        </button>
        {saved && <span style={{ fontSize: 13, color: B.green }}>Сохранено</span>}
        {error && <span style={{ fontSize: 13, color: B.red }}>Ошибка: {error}</span>}
      </div>
    </div>
  )
}

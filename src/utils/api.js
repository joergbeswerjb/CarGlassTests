const SHEETS_URL = import.meta.env.VITE_SHEETS_URL

/**
 * Сохранить результат теста
 * @param {object} payload  из buildPayload()
 */
export async function saveAssessment(payload) {
  const res = await fetch(`${SHEETS_URL}?action=save`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  const json = await res.json()
  if (json.result !== 'success') throw new Error(json.message || 'Save failed')
  return json
}

/**
 * Получить все результаты по роли
 * @param {string} role  sheetName из roles.js
 */
export async function fetchAssessments(role) {
  const res  = await fetch(`${SHEETS_URL}?action=get&role=${encodeURIComponent(role)}`)
  const json = await res.json()
  if (json.result !== 'success') throw new Error(json.message || 'Fetch failed')
  return json.data || []
}

/**
 * Удалить запись по ID
 * @param {string} id    UUID из таблицы
 * @param {string} role  sheetName
 */
export async function deleteAssessment(id, role) {
  const res  = await fetch(
    `${SHEETS_URL}?action=delete&id=${encodeURIComponent(id)}&role=${encodeURIComponent(role)}`
  )
  const json = await res.json()
  if (json.result !== 'success') throw new Error(json.message || 'Delete failed')
  return json
}

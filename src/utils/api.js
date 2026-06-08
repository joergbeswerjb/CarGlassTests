// ─── API: Google Sheets через Apps Script (v4-od) ───────────────────────────
// Apps Script возвращает: { ok: true, ... } при успехе или { error: '...' } при ошибке.
// GET для чтения, POST с JSON body для записи и удаления.

const SHEETS_URL = import.meta.env.VITE_SHEETS_URL

/**
 * Сохранить результат теста.
 * @param {object} payload  результат из buildPayload() или buildPayloadOD()
 * @returns {Promise<{ok: true, id: string}>}
 */
export async function saveAssessment(payload) {
  const body = { action: 'save', ...payload }
  const res = await fetch(SHEETS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Save failed')
  return json
}

/**
 * Получить все результаты по роли.
 * @param {string} role  sheetName из roles.js
 * @returns {Promise<Array<object>>}  массив строк-объектов с ключами по заголовкам Sheets
 */
export async function fetchAssessments(role) {
  const url = SHEETS_URL + '?action=get&role=' + encodeURIComponent(role)
  const res  = await fetch(url)
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Fetch failed')
  return json.rows || []
}

/**
 * Удалить запись по ID.
 * @param {string} id    UUID из таблицы (поле "ID")
 * @param {string} role  sheetName
 */
export async function deleteAssessment(id, role) {
  const body = { action: 'delete', id: id, role: role }
  const res = await fetch(SHEETS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Delete failed')
  return json
}

/**
 * Сохранить сценарий интервью и ответы (для Точки 3, Часть C).
 * @param {object} params  { id, role, interview_script, interview_answers }
 */
export async function saveInterview(params) {
  const body = { action: 'save_interview', ...params }
  const res = await fetch(SHEETS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Save interview failed')
  return json
}

/**
 * Сохранить финальный анализ (для Точки 3, Часть B).
 * @param {object} params  { id, role, final_analysis, final_recommendation }
 */
export async function saveAnalysis(params) {
  const body = { action: 'save_analysis', ...params }
  const res = await fetch(SHEETS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Save analysis failed')
  return json
}

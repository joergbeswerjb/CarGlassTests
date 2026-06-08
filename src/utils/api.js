// ─── API: Google Sheets через Apps Script (v7-b3) ───────────────────────────
// Apps Script возвращает: { ok: true, ... } при успехе или { error: '...' } при ошибке.
// GET для чтения, POST с JSON body для записи, удаления и AI-генерации.
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL

async function postAction(body, failMsg) {
  const res = await fetch(SHEETS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || failMsg)
  return json
}

/**
 * Сохранить результат теста.
 * @param {object} payload  результат из buildPayload() или buildPayloadOD()
 */
export async function saveAssessment(payload) {
  return postAction({ action: 'save', ...payload }, 'Save failed')
}

/**
 * Получить все результаты по роли.
 * @param {string} role  sheetName из roles.js
 * @returns {Promise<Array<object>>}
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
 */
export async function deleteAssessment(id, role) {
  return postAction({ action: 'delete', id: id, role: role }, 'Delete failed')
}

/**
 * Сохранить сценарий интервью и ответы (legacy, Точка 3 / Часть C).
 */
export async function saveInterview(params) {
  return postAction({ action: 'save_interview', ...params }, 'Save interview failed')
}

/**
 * Сохранить финальный анализ (ручной путь).
 */
export async function saveAnalysis(params) {
  return postAction({ action: 'save_analysis', ...params }, 'Save analysis failed')
}

/**
 * Сохранить текст резюме кандидата (B.2).
 */
export async function saveCV(id, role, cvText) {
  return postAction({ action: 'save_cv', id: id, role: role, cv_text: cvText }, 'Save CV failed')
}

/**
 * Сохранить ответы кандидата с интервью (B.3).
 * @param {string} id        UUID кандидата
 * @param {string} role      sheetName
 * @param {Array}  answers   массив { question, answer }
 */
export async function saveAnswers(id, role, answers) {
  return postAction({
    action: 'save_answers', id: id, role: role,
    interview_answers: JSON.stringify(answers),
  }, 'Save answers failed')
}

/**
 * Сгенерировать AI-флаги (B.1). Возвращает массив флагов.
 */
export async function generateFlags(id, role) {
  const json = await postAction({ action: 'generate_flags', id: id, role: role }, 'Generate flags failed')
  return json.flags || []
}

/**
 * Сгенерировать сценарий интервью (B.2). Возвращает массив вопросов.
 */
export async function generateScript(id, role) {
  const json = await postAction({ action: 'generate_script', id: id, role: role }, 'Generate script failed')
  return json.script || []
}

/**
 * Сгенерировать финальный анализ (B.3). Возвращает объект-досье.
 * Apps Script читает тест + CV + сценарий + ответы, вызывает Opus, сохраняет.
 */
export async function generateAnalysis(id, role) {
  const json = await postAction({ action: 'generate_analysis', id: id, role: role }, 'Generate analysis failed')
  return json.analysis || null
}

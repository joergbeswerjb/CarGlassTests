// ─── API: Google Sheets через Apps Script (v10) ─────────────────────────────
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
  // light=1 — Apps Script не кладёт тяжёлую колонку «Сырые данные» в ответ.
  // Фронт её не читает (нужна только бэкенду для визуал-оценки), поэтому
  // облегчаем и список, и карточку — меньше трафика и парсинга.
  const url = SHEETS_URL + '?action=get&role=' + encodeURIComponent(role) + '&light=1'
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

/**
 * Оценить визуальный блок (без координат): AI сверяет примечания кандидата
 * со скрытым эталоном сцены, код считает веса. Возвращает объект-оценку
 * (found/missed/bonus/noise + pct + quality) и пишет её в строку.
 */
export async function generateVisualEval(id, role) {
  const json = await postAction({ action: 'generate_visual_eval', id: id, role: role }, 'Generate visual eval failed')
  return json.visual || null
}

/**
 * Оценить кейсы (Блок 4 — структурирование, Блок 5 — коммуникация) по рубрике.
 * AI ставит met=true/false по каждому критерию, КОД считает балл (сумма весов) —
 * длина ответа не влияет. На бэкенде (v20) этот же вызов СРАЗУ пересчитывает
 * Итог%/Ранг по реальным баллам (struct/comm из AI, а не из длины).
 *
 * @returns {Promise<{cases: object, overall: object|null}>}
 *   cases   — { struct_pct, struct_detail, comm_pct, comm_detail, red_flags, summary }
 *   overall — { ok, overall_pct, rank, gated, gate_reason, breakdown } или { ok:false, ... }
 */
export async function generateCaseEval(id, role) {
  const json = await postAction({ action: 'generate_case_eval', id: id, role: role }, 'Generate case eval failed')
  return { cases: json.cases || null, overall: json.overall || null }
}

/**
 * Пересчитать Итог%/Ранг БЕЗ повторной AI-оценки (для старых записей, где AI-оценка
 * кейсов уже есть). Если кейсы ещё не оценены — вернёт { ok:false, needCases:true }.
 *
 * @returns {Promise<object>}  { ok, overall_pct, rank, gated, gate_reason, breakdown }
 */
export async function recomputeOverall(id, role) {
  const json = await postAction({ action: 'recompute_overall', id: id, role: role }, 'Recompute failed')
  return json.overall || null
}

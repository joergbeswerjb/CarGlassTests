// ─── Реестр ролей ─────────────────────────────────────────────────────────────
// Чтобы добавить новую роль:
// 1. Создать src/data/questions/new-role.js
// 2. Импортировать и добавить запись ниже
// 3. Распечатать QR-код на URL /test/new-role
// Больше ничего менять не нужно.

import technicianQuestions        from './questions/technician.js'
import operationsDirectorContent  from './questions/operations-director.js'

export const ROLES = {
  // ── Техник филиала (без изменений) ──
  'technician': {
    slug:       'technician',
    sheetName:  'Техник филиала',
    label:      { ru: 'Техник филиала', kz: 'Филиал технигі' },
    questions:  technicianQuestions,
    // Языковая политика: билингвальный
    languages:  ['ru', 'kz'],
    // Тип теста — определяет какие блоки и компоненты использовать
    testType:   'classic',  // intro → cognitive → disc → visual → done
    accessCode: null,       // открытый доступ
    cogMax:     20,
    visMax:     22,
    ranks: { A: 75, B: 60, C: 45, D: 0 },
    weights:  { cog: 0.40, disc: 0.25, vis: 0.35 },
  },

  // ── Operations Director (CEO-1) — новая роль ──
  'operations-director': {
    slug:       'operations-director',
    sheetName:  'Операционный директор',
    label:      { ru: 'Операционный директор', kz: 'Операциялық директор' },
    questions:  operationsDirectorContent,
    // Языковая политика: только русский (пользователь не владеет казахским)
    languages:  ['ru'],
    // 5-блочный тест с открытыми ответами и AI-оценкой
    testType:   'extended',  // intro → cognitive → disc → visual_clickable → structuring → communication → done
    // Простой код доступа на старте (как пароль HR-панели)
    accessCode: 'od2026',
    // Скоринг приходит из questions/operations-director.js
    ranks:      operationsDirectorContent.SCORE_RANKS,
    weights:    operationsDirectorContent.SCORE_WEIGHTS,
    gates:      operationsDirectorContent.SCORE_GATES,
  },
}

// Получить роль по slug, вернуть null если не найдена
export function getRoleBySlug(slug) {
  return ROLES[slug] || null
}

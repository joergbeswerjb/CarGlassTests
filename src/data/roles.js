// ─── Реестр ролей ─────────────────────────────────────────────────────────────
// Чтобы добавить новую роль:
// 1. Создать src/data/questions/new-role.js
// 2. Импортировать и добавить запись ниже
// 3. Распечатать QR-код на URL /test/new-role
// Больше ничего менять не нужно.

import technicianQuestions from './questions/technician.js'
// import opsManagerQuestions from './questions/ops-manager.js'  // ← раскомментировать когда готово

export const ROLES = {
  'technician': {
    slug:       'technician',
    sheetName:  'Техник филиала',      // название листа в Google Sheets
    label:      { ru: 'Техник филиала', kz: 'Филиал технигі' },
    questions:  technicianQuestions,
    cogMax:     20,
    visMax:     22,                     // сумма правильных нарушений по 4 сценам
    // Пороги для ранга
    ranks: {
      A: 75,  // overall_pct >= 75
      B: 60,  // overall_pct >= 60
      C: 45,  // overall_pct >= 45
      D: 0,   // всё остальное
    },
    // Веса блоков для overall_pct
    weights: {
      cog:  0.40,
      disc: 0.25,
      vis:  0.35,
    },
  },

  // 'operations-manager': {
  //   slug:      'operations-manager',
  //   sheetName: 'Operations Manager',
  //   label:     { ru: 'Operations Manager', kz: 'Операциялар менеджері' },
  //   questions: opsManagerQuestions,
  //   cogMax:    20,
  //   visMax:    18,
  //   ranks:     { A: 80, B: 65, C: 50, D: 0 },
  //   weights:   { cog: 0.45, disc: 0.30, vis: 0.25 },
  // },
}

// Получить роль по slug, вернуть null если не найдена
export function getRoleBySlug(slug) {
  return ROLES[slug] || null
}

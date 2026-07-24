// ─── Подсчёт результатов ─────────────────────────────────────────────────────
// classic (techник) — без изменений из существующего файла.
// OD (extended) — новые функции с гейтами, целевыми зонами, AI-флагами.

// ═══════════════════════════════════════════════════════════════════════
// ── CLASSIC (техник) — оставлено в исходном виде ──
// ═══════════════════════════════════════════════════════════════════════

export function calcCognitive(answers) {
  const score = answers.filter(a => a.selected === a.correct).length
  const max   = answers.length
  const pct   = max > 0 ? Math.round((score / max) * 100) : 0
  return { score, max, pct }
}

export function calcDisc(answers) {
  const raw = { D: 0, I: 0, S: 0, C: 0 }
  answers.forEach(({ most, least, options }) => {
    if (most  != null) raw[options[most].d]  += 2
    if (least != null) raw[options[least].d] -= 1
  })

  const vals = Object.values(raw)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const rng  = max - min || 1
  const norm = {}
  Object.keys(raw).forEach(k => { norm[k] = Math.round(((raw[k] - min) / rng) * 100) })

  const sorted    = Object.entries(raw).sort((a, b) => b[1] - a[1])
  const primary   = sorted[0][0]
  const secondary = sorted[1][0]

  return {
    d: raw.D, i: raw.I, s: raw.S, c: raw.C,
    primary, secondary,
    normD: norm.D, normI: norm.I, normS: norm.S, normC: norm.C,
  }
}

export function calcVisual(answers, scenes) {
  let score = 0, max = 0
  scenes.forEach((scene, si) => {
    const correctIndices = scene.violations.map((v, i) => v.correct ? i : null).filter(i => i !== null)
    max += correctIndices.length
    const selected = answers[si]?.selected || []
    selected.forEach(idx => { if (scene.violations[idx]?.correct) score++ })
  })
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return { score, max, pct }
}

export function calcOverall(cog, disc, vis, role) {
  const { weights, ranks } = role
  const discPct = Math.round((disc.normS + disc.normC) / 2)
  const overall_pct = Math.round(cog.pct * weights.cog + discPct * weights.disc + vis.pct * weights.vis)
  let rank = 'D'
  if (overall_pct >= ranks.A) rank = 'A'
  else if (overall_pct >= ranks.B) rank = 'B'
  else if (overall_pct >= ranks.C) rank = 'C'
  return { overall_pct, rank }
}

export function buildPayload({ name, lang, role, cogResult, discResult, visResult, overallResult, rawCog, rawDisc, rawVis }) {
  return {
    candidate_name: name, lang, role: role.sheetName,
    consent: 'да',
    consent_at: new Date().toISOString(),
    cog_score: cogResult.score, cog_max: cogResult.max, cog_pct: cogResult.pct,
    disc_d: discResult.d, disc_i: discResult.i, disc_s: discResult.s, disc_c: discResult.c,
    disc_primary: discResult.primary, disc_secondary: discResult.secondary,
    vis_score: visResult.score, vis_max: visResult.max, vis_pct: visResult.pct,
    overall_pct: overallResult.overall_pct, rank: overallResult.rank,
    raw_cog: rawCog, raw_disc: rawDisc, raw_vis: rawVis,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ── EXTENDED (Operations Director и далее) ──
// ═══════════════════════════════════════════════════════════════════════

/**
 * Когнитивный блок OD.
 * @param {object} result { questions, answers, timeOk, totalTime }
 */
export function calcCognitiveOD(result) {
  const { answers, timeOk } = result
  const score = answers.filter(a => a.isCorrect).length
  const max   = answers.length
  const pct   = max > 0 ? Math.round((score / max) * 100) : 0

  // Дополнительно: % правильных по категории DATA (отдельный сигнал)
  const dataAnswers = answers.filter(a => a.cat === 'DATA')
  const dataScore   = dataAnswers.filter(a => a.isCorrect).length
  const dataMax     = dataAnswers.length
  const dataPct     = dataMax > 0 ? Math.round((dataScore / dataMax) * 100) : 0

  return { score, max, pct, timeOk, dataScore, dataMax, dataPct }
}

/**
 * DISC OD — нормализация от теоретического диапазона (НЕ от min/max кандидата).
 * Это лечит issue #3 техника.
 */
export function calcDiscOD(answers) {
  const raw = { D: 0, I: 0, S: 0, C: 0 }
  const flags = []

  answers.forEach(({ most, least, options, type }) => {
    if (most  != null) raw[options[most].d]  += 2
    if (least != null) raw[options[least].d] -= 1

    // Сбор флагов из ловушек
    if (type === 'trap') {
      if (most != null) {
        const flag = options[most].flag
        if (flag) flags.push(flag)
      }
    }
  })

  // Теоретический диапазон: minRaw = -8 (least выбрано во всех 8 группах для шкалы), maxRaw = +16
  const minTheoretical = -8
  const maxTheoretical = 16
  const range = maxTheoretical - minTheoretical

  const norm = {}
  Object.keys(raw).forEach(k => {
    norm[k] = Math.max(0, Math.min(100, Math.round(((raw[k] - minTheoretical) / range) * 100)))
  })

  // Определение профиля
  const sorted    = Object.entries(raw).sort((a, b) => b[1] - a[1])
  const primary   = sorted[0][0]
  const secondary = sorted[1][0]

  // Целевые зоны (D 60+, C 60+, S 30-60)
  const targetMatch = {
    D: norm.D >= 60,
    C: norm.C >= 60,
    S: norm.S >= 30 && norm.S <= 60,
  }
  const inTargetZone = targetMatch.D && targetMatch.C && targetMatch.S

  return {
    d: raw.D, i: raw.I, s: raw.S, c: raw.C,
    normD: norm.D, normI: norm.I, normS: norm.S, normC: norm.C,
    primary, secondary,
    flags,
    targetMatch,
    inTargetZone,
  }
}

/**
 * Визуальный OD (новая модель) — БЕЗ привязки к координатам.
 * Собирает примечания кандидата по сценам + скрытый эталон сцены
 * (нарушения с уровнем сложности). Реального «найдено/пропущено» здесь нет —
 * сверку примечаний с эталоном делает AI-слой (Apps Script), результат
 * пишется в строку позже. Здесь — только сырьё + эвристический placeholder.
 */
export function calcVisualOD(answers, scenes) {
  const observations = []   // [{ sceneId, title, notes: [{x,y,explanation}] }]
  const groundTruth  = []   // [{ sceneId, title, violations: [{label, level}] }] — скрытый эталон
  const allMarks     = []
  let observationCount = 0
  let totalViolations  = 0

  scenes.forEach((scene, si) => {
    const marks = answers[si] || []
    const notes = []
    marks.forEach(mark => {
      const exp = (mark.explanation || '').trim()
      allMarks.push({ sceneId: scene.id, x: mark.x, y: mark.y, explanation: exp })
      if (exp.length > 0) {
        notes.push({ x: mark.x, y: mark.y, explanation: exp })
        observationCount++
      }
    })
    observations.push({ sceneId: scene.id, title: scene.title, notes })

    const violations = (scene.violations || []).map(v => ({ label: v.label, level: v.level }))
    totalViolations += violations.length
    groundTruth.push({ sceneId: scene.id, title: scene.title, violations })
  })

  // Эвристический placeholder по охвату (до AI-оценки): сколько примечаний vs нарушений.
  const pct = totalViolations > 0
    ? Math.min(100, Math.round((observationCount / totalViolations) * 100))
    : 0

  return {
    pct,                 // placeholder, AI может переписать
    observationCount,
    totalViolations,
    observations,        // сырые примечания — первичны
    groundTruth,         // скрытый эталон для AI
    rawMarks: allMarks,
  }
}

/**
 * Финальный расчёт OD: веса блоков, гейты, ранги.
 * @param {object} structuring — 4 поля свободного текста (без AI-оценки на точке 2)
 * @param {Array}  communication — 3 кейса свободного текста
 */
export function calcOverallOD({ cog, disc, vis, structuring, communication, role }) {
  const { weights, ranks, gates } = role
  const flags = [...disc.flags]   // флаги из DISC

  // === ГЕЙТЫ ===
  let gated = false
  let gateReason = null

  if (cog.pct < gates.cog_min_pct) {
    gated = true
    gateReason = `cog_score < ${gates.cog_min_pct}% (получено ${cog.pct}%)`
  }
  if (!cog.timeOk) {
    gated = true
    gateReason = gateReason || 'Не уложился во время по когнитивному блоку'
  }
  // На точке 2 critical_red флаги от AI ещё не работают (заглушка),
  // на точке 3 здесь будет проверка флагов из communication

  // === DISC contribution для overall ===
  // Близость к целевому профилю D↑↑ C↑↑ S–mid:
  // Считаем как среднее достижение целевых зон
  const discTargetScore =
    (Math.min(disc.normD, 100) +
     Math.min(disc.normC, 100) +
     (disc.normS >= 30 && disc.normS <= 60 ? 80 : 40)) / 3

  // === Структурирование — на точке 2 без AI-оценки ===
  // Простая эвристика: оценка по длине ответов (заглушка до AI)
  const structPct = structuring ? estimateOpenAnswerPct(Object.values(structuring)) : 0

  // === Коммуникация — на точке 2 без AI-оценки ===
  const commPct = communication ? estimateOpenAnswerPct(communication.map(c => c.answer)) : 0

  const overall_pct = gated ? 0 : Math.round(
    cog.pct          * weights.cognitive +
    discTargetScore  * weights.disc +
    vis.pct          * weights.visual +
    structPct        * weights.structuring +
    commPct          * weights.communication
  )

  let rank = 'D'
  if (gated) {
    rank = 'D'
  } else if (overall_pct >= ranks.A) rank = 'A'
  else if (overall_pct >= ranks.B) rank = 'B'
  else if (overall_pct >= ranks.C) rank = 'C'

  return {
    overall_pct, rank,
    gated, gateReason,
    flags,
    breakdown: {
      cognitive: cog.pct,
      disc: Math.round(discTargetScore),
      visual: vis.pct,
      structuring: structPct,
      communication: commPct,
    },
  }
}

/**
 * Эвристика-заглушка для оценки открытых ответов до подключения AI.
 * Просто оценивает по длине и наличию ответа.
 * НА ТОЧКЕ 3 БУДЕТ ЗАМЕНЕНО реальной AI-оценкой.
 */
function estimateOpenAnswerPct(answers) {
  if (!answers || answers.length === 0) return 0
  const scores = answers.map(a => {
    const text = (a || '').trim()
    if (text.length === 0) return 0
    if (text.length < 50)  return 30
    if (text.length < 150) return 60
    if (text.length < 300) return 75
    return 85   // на точке 2 максимум 85% — реальная AI-оценка может выйти выше
  })
  return Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)
}

/**
 * Сборка payload для отправки в Google Sheets.
 * Содержит и сырые ответы, и метрики, согласно принципу:
 * "сырой ответ всегда первичен".
 */
export function buildPayloadOD({
  name, role,
  cogResult, discResult, visResult,
  structuringAnswers, communicationAnswers,
  overallResult,
}) {
  return {
    candidate_name: name,
    lang: 'ru',
    role: role.sheetName,
    consent: 'да',
    consent_at: new Date().toISOString(),

    // Когнитивный
    cog_score:    cogResult.score,
    cog_max:      cogResult.max,
    cog_pct:      cogResult.pct,
    cog_time_ok:  cogResult.timeOk,
    cog_data_pct: cogResult.dataPct,
    raw_cog:      cogResult,

    // DISC
    disc_d: discResult.d, disc_i: discResult.i, disc_s: discResult.s, disc_c: discResult.c,
    disc_normD: discResult.normD, disc_normI: discResult.normI,
    disc_normS: discResult.normS, disc_normC: discResult.normC,
    disc_primary: discResult.primary, disc_secondary: discResult.secondary,
    disc_target_match: discResult.inTargetZone,
    disc_flags: discResult.flags.join(','),

    // Визуальный (новая модель: примечания + скрытый эталон для AI-сверки)
    vis_pct:               visResult.pct,             // эвристический placeholder до AI
    vis_observation_count: visResult.observationCount,
    vis_total_count:       visResult.totalViolations,
    vis_observations:      visResult.observations,     // примечания по сценам (сырое — первично)
    vis_ground_truth:      visResult.groundTruth,      // скрытый эталон сцен для AI
    vis_ai_eval:           'PENDING',                  // AI-оценка визуала ещё не запущена
    raw_vis_marks:         visResult.rawMarks,

    // Структурирование (4 поля) — сырые ответы первичны
    struct_questions:     structuringAnswers.questions     || '',
    struct_decomposition: structuringAnswers.decomposition || '',
    struct_first_step:    structuringAnswers.first_step    || '',
    struct_enhancement:   structuringAnswers.enhancement   || '',
    struct_pct:           overallResult.breakdown.structuring,
    struct_ai_eval:       'PENDING',   // заполнится на точке 3

    // Коммуникация (3 кейса) — сырые ответы первичны
    comm_case1: (communicationAnswers[0] && communicationAnswers[0].answer) || '',
    comm_case2: (communicationAnswers[1] && communicationAnswers[1].answer) || '',
    comm_case3: (communicationAnswers[2] && communicationAnswers[2].answer) || '',
    comm_pct:   overallResult.breakdown.communication,
    comm_ai_eval: 'PENDING',           // заполнится на точке 3

    // Итог
    overall_pct: overallResult.overall_pct,
    rank:        overallResult.rank,
    gated:       overallResult.gated,
    gate_reason: overallResult.gateReason || '',
    flags:       overallResult.flags.join(','),
    breakdown:   overallResult.breakdown,
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ── BASIC (office-universal: когнитивка по тирам + описательный DISC) ──
// ═══════════════════════════════════════════════════════════════════════

/**
 * Когнитивный блок с тирами.
 * Итог — не одно число, а раскладка «докуда дошёл»: сколько взято в каждом тире.
 * Гейт — только базовый тир (низкий пол, общий для всех вакансий).
 */
export function calcCognitiveTiered(result, config) {
  const answers = result.answers || []
  const questions = result.questions || []

  const tiers = {}
  config.tierOrder.forEach(function (tier) {
    const total = questions.filter(function (q) { return q.tier === tier }).length
    const given = answers.filter(function (a) { return a.tier === tier })
    const score = given.filter(function (a) { return a.isCorrect }).length
    tiers[tier] = {
      score: score,
      max: total,
      pct: total > 0 ? Math.round((score / total) * 100) : 0,
      label: config.tierLabels[tier] || tier,
    }
  })

  const score = answers.filter(function (a) { return a.isCorrect }).length
  const max = questions.length
  const pct = max > 0 ? Math.round((score / max) * 100) : 0

  // Потолок — самый высокий тир, взятый не ниже порога
  let ceiling = '—'
  config.tierOrder.forEach(function (tier) {
    if (tiers[tier].pct >= config.ceilingThresholdPct) ceiling = tiers[tier].label
  })

  // Гейт по базовому тиру
  const gateTier = tiers[config.gate.tier]
  const gatePassed = gateTier ? gateTier.score >= config.gate.minCorrect : false

  return {
    score: score,
    max: max,
    pct: pct,
    tiers: tiers,
    ceiling: ceiling,
    unanswered: result.unanswered !== undefined ? result.unanswered : (max - answers.length),
    timeSec: result.totalTime || 0,
    timeOk: result.timeOk !== false,
    gatePassed: gatePassed,
    gateReason: gatePassed ? '' : 'Базовый тир ниже минимума (' +
      (gateTier ? gateTier.score : 0) + '/' + (gateTier ? gateTier.max : 0) +
      ', нужно ' + config.gate.minCorrect + ')',
  }
}

/**
 * DISC описательный (office-universal).
 * Отличия от calcDiscOD: в баллы идут только зачётные группы (ловушки исключены),
 * границы теоретического диапазона берутся из конфига роли, а не хардкодятся.
 * Целевого профиля нет — вердикт «подходит/не подходит» не выводится.
 */
export function calcDiscBasic(answers, discConfig) {
  const raw = { D: 0, I: 0, S: 0, C: 0 }
  const scoredTypes = discConfig.scoredTypes || ['profile']

  answers.forEach(function (ans) {
    if (scoredTypes.indexOf(ans.type) < 0) return
    if (ans.most != null) raw[ans.options[ans.most].d] += 2
    if (ans.least != null) raw[ans.options[ans.least].d] -= 1
  })

  const minT = discConfig.minTheoretical
  const maxT = discConfig.maxTheoretical
  const range = maxT - minT

  const norm = {}
  Object.keys(raw).forEach(function (k) {
    norm[k] = Math.max(0, Math.min(100, Math.round(((raw[k] - minT) / range) * 100)))
  })

  const sorted = Object.entries(raw).sort(function (a, b) { return b[1] - a[1] })
  const primary = sorted[0][0]
  const secondary = sorted[1][0]

  // Ловушки: сверяем букву «Больше всего» в ловушке и в её зеркале
  const mostLetterById = {}
  answers.forEach(function (ans) {
    if (ans.most != null) mostLetterById[ans.groupId] = ans.options[ans.most].d
  })
  const mismatches = []
  answers.forEach(function (ans) {
    if (ans.type !== 'trap' || !ans.mirrorOf) return
    const mirror = mostLetterById[ans.mirrorOf]
    const own = mostLetterById[ans.groupId]
    if (mirror && own && mirror !== own) {
      mismatches.push(ans.mirrorOf + '/' + ans.groupId)
    }
  })

  return {
    d: raw.D, i: raw.I, s: raw.S, c: raw.C,
    normD: norm.D, normI: norm.I, normS: norm.S, normC: norm.C,
    primary: primary,
    secondary: secondary,
    trapMismatches: mismatches,
    trapsConsistent: mismatches.length === 0,
  }
}

/**
 * Payload для office-universal.
 * Композитного балла нет намеренно: DISC описательный, сворачивать его
 * в единое число значило бы превратить характер в приговор.
 */
export function buildPayloadBasic({ name, vacancy, role, cogResult, discResult }) {
  return {
    candidate_name: name,
    lang: 'ru',
    role: role.sheetName,
    vacancy: vacancy || '',
    consent: 'да',
    consent_at: new Date().toISOString(),

    // Когнитивный — общий счёт + раскладка по тирам
    cog_score: cogResult.score,
    cog_max: cogResult.max,
    cog_pct: cogResult.pct,
    cog_t1: cogResult.tiers.t1.score, cog_t1_max: cogResult.tiers.t1.max,
    cog_t2: cogResult.tiers.t2.score, cog_t2_max: cogResult.tiers.t2.max,
    cog_t3: cogResult.tiers.t3.score, cog_t3_max: cogResult.tiers.t3.max,
    cog_ceiling: cogResult.ceiling,
    cog_unanswered: cogResult.unanswered,
    cog_time_sec: cogResult.timeSec,
    raw_cog: cogResult,

    // Гейт — только базовый тир
    gated: !cogResult.gatePassed,
    gate_reason: cogResult.gateReason,

    // DISC — описательный
    disc_d: discResult.d, disc_i: discResult.i, disc_s: discResult.s, disc_c: discResult.c,
    disc_normD: discResult.normD, disc_normI: discResult.normI,
    disc_normS: discResult.normS, disc_normC: discResult.normC,
    disc_primary: discResult.primary,
    disc_secondary: discResult.secondary,
    disc_flags: discResult.trapsConsistent ? '' : 'расхождение: ' + discResult.trapMismatches.join(', '),
  }
}

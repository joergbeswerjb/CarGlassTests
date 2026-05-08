// ─── Подсчёт результатов ─────────────────────────────────────────────────────

/**
 * Подсчёт когнитивного блока
 * @param {Array} answers  [{selected, correct}]
 * @returns {{ score, max, pct }}
 */
export function calcCognitive(answers) {
  const score = answers.filter(a => a.selected === a.correct).length
  const max   = answers.length
  const pct   = max > 0 ? Math.round((score / max) * 100) : 0
  return { score, max, pct }
}

/**
 * Подсчёт DISC блока
 * @param {Array} answers  [{most, least, options}]
 * @returns {{ d, i, s, c, primary, secondary, normD, normI, normS, normC }}
 */
export function calcDisc(answers) {
  const raw = { D: 0, I: 0, S: 0, C: 0 }

  answers.forEach(({ most, least, options }) => {
    if (most  != null) raw[options[most].d]  += 2
    if (least != null) raw[options[least].d] -= 1
  })

  // Нормализация 0–100
  const vals = Object.values(raw)
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const rng  = max - min || 1

  const norm = {}
  Object.keys(raw).forEach(k => {
    norm[k] = Math.round(((raw[k] - min) / rng) * 100)
  })

  // Primary / Secondary — топ 2 по сырым значениям
  const sorted = Object.entries(raw).sort((a, b) => b[1] - a[1])
  const primary   = sorted[0][0]
  const secondary = sorted[1][0]

  return {
    d: raw.D, i: raw.I, s: raw.S, c: raw.C,
    primary,
    secondary,
    normD: norm.D, normI: norm.I, normS: norm.S, normC: norm.C,
  }
}

/**
 * Подсчёт визуального блока
 * @param {Array} answers     [{selected: [idx]}]
 * @param {Array} scenes      из questions/technician.js
 * @returns {{ score, max, pct }}
 */
export function calcVisual(answers, scenes) {
  let score = 0
  let max   = 0

  scenes.forEach((scene, si) => {
    const correctIndices = scene.violations
      .map((v, i) => v.correct ? i : null)
      .filter(i => i !== null)

    max += correctIndices.length

    const selected = answers[si]?.selected || []
    selected.forEach(idx => {
      if (scene.violations[idx]?.correct) score++
    })
  })

  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return { score, max, pct }
}

/**
 * Итоговый балл и ранг
 * @param {object} cog    { pct }
 * @param {object} disc   { normS, normC } — для техника целевой S+C
 * @param {object} vis    { pct }
 * @param {object} role   из roles.js { weights, ranks }
 * @returns {{ overall_pct, rank }}
 */
export function calcOverall(cog, disc, vis, role) {
  const { weights, ranks } = role

  // DISC contribution — среднее нормализованных S и C для техника
  const discPct = Math.round((disc.normS + disc.normC) / 2)

  const overall_pct = Math.round(
    cog.pct  * weights.cog  +
    discPct  * weights.disc +
    vis.pct  * weights.vis
  )

  // Ранг
  let rank = 'D'
  if (overall_pct >= ranks.A) rank = 'A'
  else if (overall_pct >= ranks.B) rank = 'B'
  else if (overall_pct >= ranks.C) rank = 'C'

  return { overall_pct, rank }
}

/**
 * Собрать финальный payload для отправки в Google Sheets
 */
export function buildPayload({ name, lang, role, cogResult, discResult, visResult, overallResult, rawCog, rawDisc, rawVis }) {
  return {
    candidate_name: name,
    lang,
    role:           role.sheetName,

    cog_score:      cogResult.score,
    cog_max:        cogResult.max,
    cog_pct:        cogResult.pct,

    disc_d:         discResult.d,
    disc_i:         discResult.i,
    disc_s:         discResult.s,
    disc_c:         discResult.c,
    disc_primary:   discResult.primary,
    disc_secondary: discResult.secondary,

    vis_score:      visResult.score,
    vis_max:        visResult.max,
    vis_pct:        visResult.pct,

    overall_pct:    overallResult.overall_pct,
    rank:           overallResult.rank,

    raw_cog:        rawCog,
    raw_disc:       rawDisc,
    raw_vis:        rawVis,
  }
}

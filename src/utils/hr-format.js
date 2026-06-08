// HR форматтеры - преобразование сырых значений из Sheets в визуальные элементы.
// Используется в HRPage (список) и CandidateCardPage (детальная карточка).

import { B } from './brand.js'

// Цвета рангов (GlassGo палитра)
export const RANK_STYLES = {
  'A': { bg: '#E8F5EE', color: '#1A7A3C', border: '#1A7A3C', label: 'A' },
  'B': { bg: '#FFF6E5', color: '#7A4D0F', border: '#BA7517', label: 'B' },
  'C': { bg: '#FCEEDA', color: '#7A4D0F', border: '#BA7517', label: 'C' },
  'D': { bg: '#FBE6E6', color: '#9B1818', border: '#C92020', label: 'D' },
}

// Цвета DISC по основной букве
export const DISC_COLOR = {
  'D': '#C92020',
  'I': '#BA7517',
  'S': '#1A7A3C',
  'C': '#0F3876',
}

// Полные названия DISC шкал
export const DISC_LABELS = {
  'D': 'Доминирование',
  'I': 'Влияние',
  'S': 'Стабильность',
  'C': 'Соответствие',
}

// Описание гейтов кратко
export const GATE_DESCRIPTIONS = {
  'cog_min': 'Когнитивный балл ниже минимума',
  'time_out': 'Время блока 1 вышло',
  'critical_red': 'Критический красный флаг от AI',
}

// ============================================================
// Форматирование одиночного значения по типу
// ============================================================
export function formatValue(value, format) {
  if (value === undefined || value === null || value === '') {
    return { kind: 'empty', display: '—' }
  }

  if (!format) return { kind: 'text', display: String(value) }

  if (format === 'pct') {
    const n = Number(value)
    if (isNaN(n)) return { kind: 'text', display: String(value) }
    return { kind: 'pct', display: n + '%', value: n }
  }

  if (format === 'date') {
    return { kind: 'date', display: formatDate(value) }
  }

  if (format === 'rank-badge') {
    const r = String(value).trim()
    const style = RANK_STYLES[r] || { bg: B.light, color: B.muted, border: B.border, label: r }
    return { kind: 'rank-badge', value: r, style }
  }

  if (format === 'gate-status') {
    return formatGate(value)
  }

  return { kind: 'text', display: String(value) }
}

// ============================================================
// Парсинг "5/25" -> { score: 5, max: 25, pct: 20 }
// ============================================================
export function parseScore(value) {
  if (!value) return null
  const s = String(value).trim()
  if (!s.includes('/')) {
    const n = Number(s)
    if (isNaN(n)) return null
    return { score: n, max: null, pct: null }
  }
  const parts = s.split('/')
  if (parts.length !== 2) return null
  const score = Number(parts[0].trim())
  const max = Number(parts[1].trim())
  if (isNaN(score) || isNaN(max) || max === 0) return null
  return { score: score, max: max, pct: Math.round((score / max) * 100) }
}

// ============================================================
// Парсинг через запятую (для ловушек DISC и т.п.)
// ============================================================
export function parseList(value) {
  if (!value) return []
  return String(value).split(',').map(function (s) { return s.trim() }).filter(function (s) { return s.length > 0 })
}

// ============================================================
// Дата: "2026-06-05T11:01:05.441Z" -> "05.06.26 11:01"
// ============================================================
function formatDate(raw) {
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return String(raw)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(2)
    const hh = String(d.getHours()).padStart(2, '0')
    const mn = String(d.getMinutes()).padStart(2, '0')
    return dd + '.' + mm + '.' + yy + ' ' + hh + ':' + mn
  } catch (e) {
    return String(raw)
  }
}

// Полный формат даты для карточки кандидата
export function formatDateLong(raw) {
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return String(raw)
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const dd = d.getDate()
    const mm = months[d.getMonth()]
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mn = String(d.getMinutes()).padStart(2, '0')
    return dd + ' ' + mm + ' ' + yyyy + ', ' + hh + ':' + mn
  } catch (e) {
    return String(raw)
  }
}

// ============================================================
// Гейт: значение из колонки 'Гейт' (TRUE/FALSE)
// ============================================================
function formatGate(value) {
  const v = String(value).toLowerCase().trim()
  if (v === 'true' || v === 'yes' || v === 'да') {
    return {
      kind: 'gate-status',
      triggered: true,
      display: 'Сработал',
      style: { bg: '#FBE6E6', color: '#9B1818', border: '#C92020' },
    }
  }
  return {
    kind: 'gate-status',
    triggered: false,
    display: '—',
    style: { bg: 'transparent', color: B.muted, border: 'transparent' },
  }
}

// ============================================================
// Хелпер: получить цвет DISC по основной букве
// ============================================================
export function discColorByValue(discPrimary) {
  if (!discPrimary) return B.muted
  const letter = String(discPrimary).trim().toUpperCase().charAt(0)
  return DISC_COLOR[letter] || B.muted
}

// ============================================================
// Хелпер: проверка булева значения из Sheets ("TRUE" / "FALSE" / boolean)
// ============================================================
export function isTrue(value) {
  if (value === true) return true
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim()
    return v === 'true' || v === 'yes' || v === 'да'
  }
  return false
}

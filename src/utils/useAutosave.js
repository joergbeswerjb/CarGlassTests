// ─── useAutosave — сохранение прогресса теста в localStorage ────────────────
// Решает: связь отлетела, страница перезагрузилась — кандидат продолжает с места.
// При завершении теста (отправка успешна) — состояние очищается.

import { useEffect, useRef } from 'react'

/**
 * Сохраняет состояние теста с дебаунсом 500мс.
 * @param {string} key — уникальный ключ (например, 'od-test-progress-{roleSlug}')
 * @param {object} state — состояние теста для сохранения
 * @param {boolean} enabled — выключаем когда тест завершён
 */
export function useAutosave(key, state, enabled = true) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({
          state,
          savedAt: Date.now(),
        }))
      } catch (e) {
        // localStorage недоступен / переполнен — молча игнорируем
        console.warn('Autosave failed:', e)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [key, state, enabled])
}

/**
 * Загружает сохранённое состояние. Возвращает null если ничего нет.
 * @param {string} key
 * @returns {{state, savedAt} | null}
 */
export function loadAutosave(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

/**
 * Очищает сохранённое состояние (после успешной отправки / ручного сброса).
 */
export function clearAutosave(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    // молча
  }
}

/**
 * Проверка — есть ли сохранённый прогресс. Используется на стартовом экране.
 */
export function hasAutosave(key) {
  try {
    return localStorage.getItem(key) !== null
  } catch (e) {
    return false
  }
}

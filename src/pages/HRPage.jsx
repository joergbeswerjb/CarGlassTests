// HRPage - главная страница HR-панели.
// Логин -> список кандидатов с переключателем ролей.
// Чтение конфига из hr-config.js: добавление новой роли не требует правок этого файла.

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { B, SHAPE } from '../utils/brand.js'
import { fetchAssessments, deleteAssessment } from '../utils/api.js'
import { HR_CONFIG, HR_ROLES_ORDER } from '../data/hr-config.js'
import { formatValue, discColorByValue } from '../utils/hr-format.js'

const HR_PASSWORD = import.meta.env.VITE_HR_PASSWORD || 'carglass2025'

// ============================================================
// Login Screen
// ============================================================
function LoginScreen({ onSuccess }) {
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')

  function handleSubmit() {
    if (pwd === HR_PASSWORD) {
      try { sessionStorage.setItem('glassgo_hr_logged', '1') } catch (e) {}
      onSuccess()
    } else {
      setErr('Неверный пароль')
      setPwd('')
    }
  }

  return (
    <div style={{ background: B.light, minHeight: '100vh' }}>
      <header style={{
        background: B.white, padding: '14px 20px',
        borderBottom: '1px solid ' + B.border,
      }}>
        <img src={B.LOGO_PATH} style={{ height: 28, width: 'auto' }} alt="GlassGo" />
      </header>

      <main style={{ maxWidth: 420, margin: '80px auto', padding: '0 1.5rem' }}>
        <div style={{
          background: B.white, border: '1px solid ' + B.border,
          borderRadius: SHAPE.card, padding: '2rem 1.5rem',
        }}>
          <div style={{
            fontSize: 11, color: B.muted, letterSpacing: '.12em',
            textTransform: 'uppercase', marginBottom: 14, fontWeight: 600,
          }}>
            GlassGo · Оценка кандидатов
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: B.text, margin: '0 0 8px' }}>
            HR-панель
          </h1>
          <p style={{ fontSize: 13, color: B.muted, marginBottom: 20 }}>
            Введите пароль для доступа
          </p>

          <input
            type="password"
            value={pwd}
            onChange={function (e) { setPwd(e.target.value); setErr('') }}
            onKeyDown={function (e) { if (e.key === 'Enter') handleSubmit() }}
            placeholder="Пароль"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', fontSize: 14, color: B.text,
              border: '1px solid ' + (err ? B.red : B.border),
              borderRadius: SHAPE.input, outline: 'none',
              fontFamily: 'inherit', marginBottom: 12,
            }}
            autoFocus
          />

          {err && (
            <div style={{ fontSize: 12, color: B.red, marginBottom: 12 }}>{err}</div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '12px',
              background: B.primary, color: B.white,
              border: 'none', borderRadius: SHAPE.asymmetric,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Войти
          </button>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Role Switcher
// ============================================================
function RoleSwitcher({ roleSlug, onChange, counts }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      {HR_ROLES_ORDER.map(function (slug) {
        const cfg = HR_CONFIG[slug]
        if (!cfg) return null
        const isActive = slug === roleSlug
        const count = counts[slug]
        return (
          <button
            key={slug}
            onClick={function () { onChange(slug) }}
            style={{
              padding: '14px 20px',
              background: isActive ? B.primary : B.white,
              color: isActive ? B.white : B.text,
              border: '1px solid ' + (isActive ? B.primary : B.border),
              borderRadius: isActive ? SHAPE.asymmetric : SHAPE.card,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left', minWidth: 200,
              transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cfg.label}</div>
            <div style={{
              fontSize: 11,
              color: isActive ? 'rgba(255,255,255,.7)' : B.muted,
            }}>
              {count === undefined ? 'загрузка…' : count + ' ' + plural(count, ['запись', 'записи', 'записей'])}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function plural(n, forms) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}

// ============================================================
// Filters
// ============================================================
function Filters({ search, onSearchChange, rank, onRankChange, disc, onDiscChange, gate, onGateChange, showGate, onRefresh }) {
  const selStyle = {
    padding: '8px 12px', fontSize: 13, color: B.text,
    border: '1px solid ' + B.border, background: B.white,
    borderRadius: SHAPE.input, outline: 'none',
    fontFamily: 'inherit', cursor: 'pointer',
  }

  return (
    <div style={{
      display: 'flex', gap: 10, flexWrap: 'wrap',
      alignItems: 'center', marginBottom: 16,
    }}>
      <input
        value={search}
        onChange={function (e) { onSearchChange(e.target.value) }}
        placeholder="Поиск по имени..."
        style={{
          padding: '8px 12px', fontSize: 13, color: B.text,
          border: '1px solid ' + B.border, background: B.white,
          borderRadius: SHAPE.input, outline: 'none',
          fontFamily: 'inherit', minWidth: 200, flex: 1,
        }}
      />
      <select value={rank} onChange={function (e) { onRankChange(e.target.value) }} style={selStyle}>
        <option value="">Все ранги</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      <select value={disc} onChange={function (e) { onDiscChange(e.target.value) }} style={selStyle}>
        <option value="">Все DISC</option>
        <option value="D">D</option>
        <option value="I">I</option>
        <option value="S">S</option>
        <option value="C">C</option>
      </select>
      {showGate && (
        <select value={gate} onChange={function (e) { onGateChange(e.target.value) }} style={selStyle}>
          <option value="">Все</option>
          <option value="passed">Без гейта</option>
          <option value="triggered">Только с гейтом</option>
        </select>
      )}
      <button
        onClick={onRefresh}
        style={{
          padding: '8px 14px', fontSize: 13, color: B.text,
          background: B.white, border: '1px solid ' + B.border,
          borderRadius: SHAPE.input, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ↻ Обновить
      </button>
    </div>
  )
}

// ============================================================
// Cell Renderer - выводит ячейку таблицы по типу формата
// ============================================================
function Cell({ value, format }) {
  const f = formatValue(value, format)

  if (f.kind === 'rank-badge') {
    const s = f.style
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px',
        background: s.bg, color: s.color,
        border: '1px solid ' + s.border,
        borderRadius: 4, fontSize: 12, fontWeight: 700,
        minWidth: 24, textAlign: 'center',
      }}>{f.value}</span>
    )
  }

  if (f.kind === 'gate-status') {
    if (!f.triggered) {
      return <span style={{ color: B.muted, fontSize: 13 }}>—</span>
    }
    const s = f.style
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px',
        background: s.bg, color: s.color,
        border: '1px solid ' + s.border,
        borderRadius: 4, fontSize: 11, fontWeight: 600,
      }}>{f.display}</span>
    )
  }

  if (f.kind === 'pct') {
    return <span style={{ color: B.text, fontSize: 13 }}>{f.display}</span>
  }

  if (f.kind === 'date') {
    return <span style={{ color: B.muted, fontSize: 12 }}>{f.display}</span>
  }

  if (f.kind === 'empty') {
    return <span style={{ color: B.muted, fontSize: 13 }}>—</span>
  }

  return <span style={{ color: B.text, fontSize: 13, fontWeight: 600 }}>{f.display}</span>
}

// ============================================================
// Candidates Table
// ============================================================
function CandidatesTable({ rows, columns, onRowClick, loading, error }) {
  if (loading) {
    return (
      <div style={{
        padding: '40px', textAlign: 'center', color: B.muted,
        background: B.white, border: '1px solid ' + B.border,
        borderRadius: SHAPE.card,
      }}>
        Загрузка…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '20px', background: '#FBE6E6',
        border: '1px solid #C92020', borderRadius: SHAPE.card,
        color: '#9B1818', fontSize: 13,
      }}>
        Ошибка загрузки: {error}
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div style={{
        padding: '40px', textAlign: 'center', color: B.muted,
        background: B.white, border: '1px solid ' + B.border,
        borderRadius: SHAPE.card,
      }}>
        Нет кандидатов по выбранным фильтрам
      </div>
    )
  }

  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: B.light, borderBottom: '1px solid ' + B.border }}>
            {columns.map(function (col) {
              return (
                <th key={col.key} style={{
                  padding: '10px 14px',
                  width: col.width || 'auto',
                  textAlign: 'left',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: B.muted,
                  fontWeight: 600,
                }}>{col.label}</th>
              )
            })}
            <th style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(function (row) {
            return (
              <tr
                key={row['ID']}
                onClick={function () { onRowClick(row) }}
                style={{
                  borderBottom: '1px solid ' + B.border,
                  cursor: 'pointer',
                  transition: 'background .1s',
                }}
                onMouseOver={function (e) { e.currentTarget.style.background = B.light }}
                onMouseOut={function (e) { e.currentTarget.style.background = 'transparent' }}
              >
                {columns.map(function (col) {
                  return (
                    <td key={col.key} style={{
                      padding: '12px 14px',
                      fontSize: 13, color: B.text,
                      verticalAlign: 'middle',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      <Cell value={row[col.key]} format={col.format} />
                    </td>
                  )
                })}
                <td style={{ padding: '12px 14px', color: B.muted, fontSize: 16, textAlign: 'right' }}>
                  ›
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
// Main HR Page
// ============================================================
export default function HRPage() {
  const [loggedIn, setLoggedIn] = useState(function () {
    try { return sessionStorage.getItem('glassgo_hr_logged') === '1' } catch (e) { return false }
  })
  const [roleSlug, setRoleSlug] = useState(HR_ROLES_ORDER[0])
  const [allRows, setAllRows] = useState({})
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [rankFilter, setRankFilter] = useState('')
  const [discFilter, setDiscFilter] = useState('')
  const [gateFilter, setGateFilter] = useState('')

  const navigate = useNavigate()

  function loadRole(slug) {
    const cfg = HR_CONFIG[slug]
    if (!cfg) return
    setLoading(function (prev) { return Object.assign({}, prev, { [slug]: true }) })
    setErrors(function (prev) { return Object.assign({}, prev, { [slug]: null }) })
    fetchAssessments(cfg.sheetName)
      .then(function (rows) {
        setAllRows(function (prev) { return Object.assign({}, prev, { [slug]: rows }) })
        setCounts(function (prev) { return Object.assign({}, prev, { [slug]: rows.length }) })
      })
      .catch(function (e) {
        setErrors(function (prev) { return Object.assign({}, prev, { [slug]: e.message || 'Fetch failed' }) })
        setCounts(function (prev) { return Object.assign({}, prev, { [slug]: 0 }) })
      })
      .finally(function () {
        setLoading(function (prev) { return Object.assign({}, prev, { [slug]: false }) })
      })
  }

  useEffect(function () {
    if (!loggedIn) return
    HR_ROLES_ORDER.forEach(function (slug) { loadRole(slug) })
  }, [loggedIn])

  const filteredRows = useMemo(function () {
    const rows = allRows[roleSlug] || []
    return rows.filter(function (row) {
      if (search) {
        const name = String(row['Имя'] || '').toLowerCase()
        if (!name.includes(search.toLowerCase())) return false
      }
      if (rankFilter && row['Ранг'] !== rankFilter) return false
      if (discFilter) {
        const disc = String(row['DISC осн.'] || '').toUpperCase().charAt(0)
        if (disc !== discFilter) return false
      }
      if (gateFilter) {
        const gateTriggered = String(row['Гейт']).toLowerCase() === 'true'
        if (gateFilter === 'triggered' && !gateTriggered) return false
        if (gateFilter === 'passed' && gateTriggered) return false
      }
      return true
    })
  }, [allRows, roleSlug, search, rankFilter, discFilter, gateFilter])

  if (!loggedIn) {
    return <LoginScreen onSuccess={function () { setLoggedIn(true) }} />
  }

  const cfg = HR_CONFIG[roleSlug]
  const hasGate = (cfg.listColumns || []).some(function (c) { return c.key === 'Гейт' })

  function handleRowClick(row) {
    navigate('/hr/' + roleSlug + '/' + row['ID'])
  }

  function handleSwitchRole(slug) {
    setRoleSlug(slug)
    setSearch(''); setRankFilter(''); setDiscFilter(''); setGateFilter('')
  }

  function handleRefresh() {
    loadRole(roleSlug)
  }

  return (
    <div style={{ background: B.light, minHeight: '100vh' }}>
      <header style={{
        background: B.white, padding: '14px 20px',
        borderBottom: '1px solid ' + B.border,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <img src={B.LOGO_PATH} style={{ height: 28, width: 'auto' }} alt="GlassGo" />
        <div style={{
          fontSize: 11, color: B.muted,
          letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          HR-панель · Оценка кандидатов
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <RoleSwitcher roleSlug={roleSlug} onChange={handleSwitchRole} counts={counts} />

        <h2 style={{
          fontSize: 20, fontWeight: 700, color: B.text,
          margin: '0 0 16px',
        }}>
          Кандидаты на роль: {cfg.label}
        </h2>

        <Filters
          search={search} onSearchChange={setSearch}
          rank={rankFilter} onRankChange={setRankFilter}
          disc={discFilter} onDiscChange={setDiscFilter}
          gate={gateFilter} onGateChange={setGateFilter}
          showGate={hasGate}
          onRefresh={handleRefresh}
        />

        <CandidatesTable
          rows={filteredRows}
          columns={cfg.listColumns}
          onRowClick={handleRowClick}
          loading={loading[roleSlug]}
          error={errors[roleSlug]}
        />

        <div style={{
          marginTop: 12, fontSize: 12, color: B.muted, textAlign: 'right',
        }}>
          Найдено: {filteredRows.length} из {(allRows[roleSlug] || []).length}
        </div>
      </main>
    </div>
  )
}

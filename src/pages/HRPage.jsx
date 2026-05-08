import { useState, useMemo } from 'react'
import { B } from '../utils/brand.js'
import { fetchAssessments, deleteAssessment } from '../utils/api.js'
import { ROLES } from '../data/roles.js'
import { DISC_DATA, DISC_COLOR, DISC_LABEL, RANK_COLOR, RANK_BG, RANK_LABEL, RANK_DESC } from '../utils/disc.js'

const HR_PASSWORD = import.meta.env.VITE_HR_PASSWORD || 'carglass2025'

const LOGO_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAARCABmAOEDASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAcBAgQGCAUD/8QATBAAAQMDAgMEBgUHCAgHAAAAAQACAwQFEQYhBxIxE0FRYQgVInGR0RQygZOhFiNCVZSx0hckUlNUYnOyMzQ1NkRGY5VWcnSDhOLw/9oADAMBAAIRAxEAPwDr5ERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERerererer'

// ─── Small reusable components ────────────────────────────────────────────────

function Tag({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, padding: '2px 8px',
      borderRadius: 20, background: (color || '#666') + '22',
      color: color || '#666', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function Bar({ val, max, color, height = 6 }) {
  const pct = Math.min(100, Math.round((val / max) * 100))
  const c   = color || (pct >= 75 ? B.green : pct >= 50 ? '#e67e22' : B.red)
  return (
    <div style={{ height, background: B.border, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: pct + '%', background: c, transition: 'width .4s' }} />
    </div>
  )
}

function RiskBlock({ title, items, color, icon }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{icon} {title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            fontSize: 12, padding: '4px 10px', borderRadius: 4,
            background: color + '11', color: B.text,
            border: `1px solid ${color}33`,
          }}>{item}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HRPage() {
  const [authed,      setAuthed]      = useState(false)
  const [pass,        setPass]        = useState('')
  const [passErr,     setPassErr]     = useState(false)
  const [candidates,  setCandidates]  = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [selected,    setSelected]    = useState(null)
  const [view,        setView]        = useState('list')
  const [activeRole,  setActiveRole]  = useState(Object.keys(ROLES)[0])
  const [search,      setSearch]      = useState('')
  const [filterRank,  setFilterRank]  = useState('all')
  const [filterDisc,  setFilterDisc]  = useState('all')

  const card = { background: B.white, border: `1px solid ${B.border}`, padding: '1rem 1.25rem', marginBottom: 12 }
  const secTitle = { fontSize: 15, fontWeight: 700, color: B.dark, marginBottom: 12, paddingBottom: 6, borderBottom: `2px solid ${B.yellow}` }
  const btn = (active, danger) => ({
    padding: '6px 14px', borderRadius: 2,
    border: danger ? `1px solid ${B.red}` : `1px solid ${B.border}`,
    background: active ? B.dark : B.white,
    color: active ? '#fff' : danger ? B.red : B.text,
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400,
    fontFamily: 'Arial, sans-serif',
  })

  function login() {
    if (pass === HR_PASSWORD) { setAuthed(true); loadData(activeRole) }
    else setPassErr(true)
  }

  async function loadData(role) {
    setLoading(true); setError(''); setSelected(null)
    try {
      const data = await fetchAssessments(ROLES[role].sheetName)
      setCandidates(data)
    } catch (e) {
      setError('Не удалось загрузить данные: ' + e.message)
    }
    setLoading(false)
  }

  async function handleDelete(c) {
    if (!window.confirm(`Удалить запись ${c['Имя']}?`)) return
    try {
      await deleteAssessment(c['ID'], ROLES[activeRole].sheetName)
      setCandidates(prev => prev.filter(x => x['ID'] !== c['ID']))
      if (selected?.['ID'] === c['ID']) setSelected(null)
    } catch { alert('Ошибка удаления') }
  }

  function switchRole(slug) {
    setActiveRole(slug)
    setSelected(null)
    setSearch('')
    setFilterRank('all')
    setFilterDisc('all')
    loadData(slug)
  }

  // Parsing helpers
  const getScore    = c => Number(c['Итог %'])  || 0
  const getCog      = c => Number(c['Когн. %']) || 0
  const getVis      = c => Number(c['Визуал. %']) || 0
  const getRank     = c => (c['Ранг'] || '').trim()
  const getDiscPrim = c => (c['DISC осн.'] || '').trim()

  const filtered = useMemo(() => candidates.filter(c => {
    if (search      && !c['Имя']?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterRank !== 'all' && getRank(c) !== filterRank)         return false
    if (filterDisc !== 'all' && getDiscPrim(c) !== filterDisc)     return false
    return true
  }), [candidates, search, filterRank, filterDisc])

  const ranks    = [...new Set(candidates.map(getRank).filter(Boolean))]
  const discs    = [...new Set(candidates.map(getDiscPrim).filter(Boolean))]
  const avgScore = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + getScore(c), 0) / candidates.length)
    : 0

  // ─── Header ────────────────────────────────────────────────────────────────
  const Header = ({ subtitle }) => (
    <div style={{
      background: B.dark, padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `3px solid ${B.red}`,
    }}>
      <img src={`data:image/jpeg;base64,${LOGO_B64}`} style={{ width: 160, height: 'auto' }} alt="CarGlass" />
      {subtitle && <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>{subtitle}</span>}
    </div>
  )

  // ─── Login ─────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
      <Header subtitle="HR-панель · CarGlass Kazakhstan" />
      <div style={{ maxWidth: 360, margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={card}>
          <h2 style={{ ...secTitle, textAlign: 'center', borderBottom: 'none', marginBottom: 4 }}>HR-панель</h2>
          <p style={{ fontSize: 13, color: B.muted, textAlign: 'center', marginBottom: 20 }}>Введите пароль для доступа</p>
          <input
            type="password" value={pass}
            onChange={e => { setPass(e.target.value); setPassErr(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Пароль..."
            style={{
              width: '100%', boxSizing: 'border-box', marginBottom: 8,
              padding: '10px 14px', fontSize: 15,
              border: `1px solid ${passErr ? B.red : B.border}`,
              background: B.light, fontFamily: 'Arial, sans-serif',
            }}
          />
          {passErr && <div style={{ color: B.red, fontSize: 12, marginBottom: 8 }}>Неверный пароль</div>}
          <button onClick={login} style={{ ...btn(true), width: '100%', padding: 10, fontSize: 15 }}>Войти</button>
        </div>
      </div>
    </div>
  )

  // ─── Main ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: B.light, minHeight: '100vh' }}>
      <Header subtitle="HR-панель · CarGlass Kazakhstan" />

      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '1.5rem' }}>

        {/* Role switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.values(ROLES).map(role => (
            <button key={role.slug} onClick={() => switchRole(role.slug)}
              style={{
                ...btn(activeRole === role.slug),
                borderTop: activeRole === role.slug ? `3px solid ${B.red}` : `3px solid transparent`,
              }}>
              {role.label.ru}
            </button>
          ))}
        </div>

        {/* Panel header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: B.dark }}>Кандидаты</div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{candidates.length} записей загружено</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['list','Список'],['card','Карточки'],['stats','Статистика']].map(([v, label]) => (
              <button key={v} style={btn(view === v && !selected)} onClick={() => { setView(v); setSelected(null) }}>{label}</button>
            ))}
            <button style={{ ...btn(false), background: B.light }} onClick={() => loadData(activeRole)}>↻ Обновить</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...card, padding: '.75rem 1.25rem', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="Поиск по имени..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '6px 12px', border: `1px solid ${B.border}`, fontSize: 13, background: B.light, width: 180, fontFamily: 'Arial, sans-serif' }}
            />
            <select value={filterRank} onChange={e => setFilterRank(e.target.value)}
              style={{ padding: '6px 10px', border: `1px solid ${B.border}`, fontSize: 13, background: B.light }}>
              <option value="all">Все ранги</option>
              {['A','B','C','D'].map(r => <option key={r} value={r}>Ранг {r} — {RANK_LABEL[r]}</option>)}
            </select>
            <select value={filterDisc} onChange={e => setFilterDisc(e.target.value)}
              style={{ padding: '6px 10px', border: `1px solid ${B.border}`, fontSize: 13, background: B.light }}>
              <option value="all">Все DISC</option>
              {['D','I','S','C'].map(d => <option key={d} value={d}>{DISC_LABEL[d]}</option>)}
            </select>
            {(filterRank !== 'all' || filterDisc !== 'all' || search) && (
              <button style={btn(false)} onClick={() => { setFilterRank('all'); setFilterDisc('all'); setSearch('') }}>Сбросить</button>
            )}
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: B.muted }}>Загрузка...</div>}
        {error   && <div style={{ color: B.red, padding: '1rem', textAlign: 'center' }}>{error}</div>}

        {/* ── STATS ──────────────────────────────────────────────────────── */}
        {view === 'stats' && !selected && !loading && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              {[
                { val: candidates.length, label: 'Всего', color: B.dark },
                { val: avgScore + '%', label: 'Средний балл', color: '#2980b9' },
                ...[['A', B.green],['B','#2980b9'],['C','#e67e22'],['D', B.red]].map(([r, c]) => ({
                  val: candidates.filter(x => getRank(x) === r).length,
                  label: `Ранг ${r}`, color: c,
                })),
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px 20px',
                  background: B.light, border: `1px solid ${B.border}`,
                  flex: 1, minWidth: 90,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 12, color: B.muted }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* DISC distribution */}
              <div style={{ ...card, flex: 1, minWidth: 260 }}>
                <div style={secTitle}>DISC — распределение</div>
                {['D','I','S','C'].map(d => {
                  const cnt = candidates.filter(c => getDiscPrim(c) === d).length
                  return (
                    <div key={d} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{DISC_LABEL[d]}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt}</span>
                      </div>
                      <Bar val={cnt} max={Math.max(1, candidates.length)} color={DISC_COLOR[d]} />
                    </div>
                  )
                })}
              </div>
              {/* Score distribution */}
              <div style={{ ...card, flex: 1, minWidth: 260 }}>
                <div style={secTitle}>Ранги — распределение</div>
                {['A','B','C','D'].map(r => {
                  const cnt = candidates.filter(c => getRank(c) === r).length
                  return (
                    <div key={r} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{r} — {RANK_LABEL[r]}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{cnt}</span>
                      </div>
                      <Bar val={cnt} max={Math.max(1, candidates.length)} color={RANK_COLOR[r]} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── LIST ───────────────────────────────────────────────────────── */}
        {view === 'list' && !selected && !loading && (
          <div>
            <div style={{ fontSize: 12, color: B.muted, marginBottom: 8 }}>Найдено: {filtered.length}</div>
            <div style={{ background: B.white, border: `1px solid ${B.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: B.light, borderBottom: `2px solid ${B.yellow}` }}>
                    {['Имя','Дата','Итог %','Ранг','DISC','Когн. %','Визуал. %',''].map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: B.dark, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const score = getScore(c)
                    const rank  = getRank(c)
                    const rc    = RANK_COLOR[rank] || B.muted
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${B.border}`, background: i % 2 === 0 ? B.white : B.light }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: B.dark }}>{c['Имя']}</td>
                        <td style={{ padding: '8px 12px', color: B.muted, fontSize: 12 }}>{String(c['Дата']).slice(0,10)}</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontWeight: 700, color: rc }}>{score}%</span></td>
                        <td style={{ padding: '8px 12px' }}><Tag label={rank} color={rc} /></td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{getDiscPrim(c) || '—'}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{getCog(c)}%</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{getVis(c)}%</td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ ...btn(false), padding: '4px 10px', fontSize: 12 }} onClick={() => setSelected(c)}>Открыть</button>
                            <button style={{ ...btn(false, true), padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(c)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: B.muted }}>Нет кандидатов</div>}
            </div>
          </div>
        )}

        {/* ── CARDS ──────────────────────────────────────────────────────── */}
        {view === 'card' && !selected && !loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {filtered.map((c, i) => {
              const score = getScore(c)
              const rank  = getRank(c)
              const rc    = RANK_COLOR[rank] || B.muted
              return (
                <div key={i} onClick={() => setSelected(c)}
                  style={{ ...card, width: 220, cursor: 'pointer', borderTop: `3px solid ${rc}`, marginBottom: 0 }}>
                  <div style={{ fontWeight: 700, color: B.dark, marginBottom: 4 }}>{c['Имя']}</div>
                  <div style={{ fontSize: 12, color: B.muted, marginBottom: 10 }}>{String(c['Дата']).slice(0,10)}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: rc }}>{score}%</span>
                    <Tag label={rank} color={rc} />
                  </div>
                  <Bar val={score} max={100} color={rc} height={4} />
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Tag label={getDiscPrim(c) || '—'} color={DISC_COLOR[getDiscPrim(c)] || B.muted} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CANDIDATE DETAIL ───────────────────────────────────────────── */}
        {selected && (
          <CandidateDetail
            c={selected}
            onBack={() => setSelected(null)}
            onDelete={() => { handleDelete(selected); setSelected(null) }}
            btn={btn} card={card} secTitle={secTitle}
          />
        )}

      </div>
    </div>
  )
}

// ─── Candidate detail ─────────────────────────────────────────────────────────

function CandidateDetail({ c, onBack, onDelete, btn, card, secTitle }) {
  const score    = Number(c['Итог %'])    || 0
  const cogPct   = Number(c['Когн. %'])   || 0
  const visPct   = Number(c['Визуал. %']) || 0
  const rank     = (c['Ранг'] || '').trim()
  const discPrim = (c['DISC осн.'] || '').trim()
  const discSec  = (c['DISC втор.'] || '').trim()
  const rc       = RANK_COLOR[rank] || B.muted
  const discInfo = DISC_DATA[discPrim]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <button style={btn(false)} onClick={onBack}>← Назад</button>
        <button style={btn(false, true)} onClick={onDelete}>🗑 Удалить запись</button>
      </div>

      {/* Score warning */}
      {score < 45 && (
        <div style={{
          background: '#fdf2f2', border: `1px solid ${B.red}`, borderLeft: `4px solid ${B.red}`,
          padding: '14px 18px', marginBottom: 12, borderRadius: 2,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: B.red, marginBottom: 4 }}>⛔ Результат ниже минимального порога</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            Балл ниже 45%. Рекомендуется отказ или дополнительное собеседование для уточнения причин.
          </div>
        </div>
      )}

      {/* Header card */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: B.dark }}>{c['Имя']}</div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>{String(c['Дата']).slice(0,16)}</div>
            <div style={{ fontSize: 12, color: B.muted }}>{c['Роль']} · {c['Язык'] === 'kz' ? 'Казахский' : 'Русский'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: rc }}>{score}%</div>
            <Tag label={`${rank} — ${RANK_LABEL[rank] || ''}`} color={rc} />
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#555', background: B.light, borderLeft: `4px solid ${B.yellow}`, padding: '10px 14px' }}>
          {RANK_DESC[rank] || '—'}
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Когнитивный', val: cogPct, hint: `${c['Когнитивный'] || '—'} · порог 18+` },
          { label: 'Визуальный', val: visPct, hint: c['Визуальный'] || '—' },
        ].map((item, i) => (
          <div key={i} style={{ ...card, flex: 1, minWidth: 200, marginBottom: 0 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: B.muted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: item.val >= 75 ? B.green : item.val >= 50 ? '#e67e22' : B.red }}>{item.val}%</div>
            <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>{item.hint}</div>
            <div style={{ marginTop: 8 }}><Bar val={item.val} max={100} height={4} /></div>
          </div>
        ))}
      </div>

      {/* DISC */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ ...card, flex: 1, minWidth: 260 }}>
          <div style={secTitle}>DISC-профиль</div>
          <div style={{ marginBottom: 8 }}>
            <Tag label={DISC_LABEL[discPrim] || discPrim || '—'} color={DISC_COLOR[discPrim] || B.muted} />
            <span style={{ fontSize: 12, color: B.muted, marginLeft: 8 }}>основной</span>
          </div>
          {discSec && (
            <div style={{ marginBottom: 14 }}>
              <Tag label={DISC_LABEL[discSec] || discSec} color={DISC_COLOR[discSec] || B.muted} />
              <span style={{ fontSize: 12, color: B.muted, marginLeft: 8 }}>вторичный</span>
            </div>
          )}
          {discInfo && (
            <>
              <RiskBlock title="Сильные стороны" items={discInfo.strengths} color={B.green}   icon="✓" />
              <RiskBlock title="Зоны риска"      items={discInfo.risks}     color="#e67e22"   icon="⚠" />
              <RiskBlock title="Не подходит для" items={discInfo.not_for}   color={B.red}     icon="✕" />
            </>
          )}
        </div>

        {/* Raw data if needed */}
        <div style={{ ...card, flex: 1, minWidth: 260 }}>
          <div style={secTitle}>DISC — сырые баллы</div>
          {['D','I','S','C'].map(k => {
            const val = Number(c[`DISC ${k}`]) || 0
            return (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{DISC_LABEL[k]}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DISC_COLOR[k] }}>{val}</span>
                </div>
                <Bar val={val + 10} max={30} color={DISC_COLOR[k]} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

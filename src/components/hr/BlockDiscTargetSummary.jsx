// Блок DISC с ОЦЕНОЧНОЙ целью роли (логист-координатор).
// Шкалы D/I/S/C и маркеры — общий рендерер BlockDiscExtendedSummary;
// сверху — сверка с целевыми зонами роли и мягкая проверка порядка доминант.
// Целевые зоны берутся из roles.js (discTargets), не хардкодятся.

import { B, SHAPE } from '../../utils/brand.js'
import { getRoleBySlug } from '../../data/roles.js'
import { isTrue } from '../../utils/hr-format.js'
import BlockDiscExtendedSummary from './BlockDiscExtendedSummary.jsx'

export default function BlockDiscTargetSummary({ row, cfg }) {
  const role = getRoleBySlug(cfg.slug)
  const targets = (role && role.discTargets) || null
  const order = (role && role.discOrder) || null
  const primary = String(row['DISC осн.'] || '').trim().toUpperCase().charAt(0)
  const orderOk = row['DISC порядок'] !== undefined && row['DISC порядок'] !== ''
    ? isTrue(row['DISC порядок'])
    : (order ? primary === order.primary : null)

  return (
    <div>
      {targets && (
        <div style={{
          background: B.light, border: '1px solid ' + B.border, borderRadius: SHAPE.input,
          padding: '12px 14px', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: B.muted, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>
              Цель роли {order ? '· ведущая ' + order.primary : ''}
            </span>
            {orderOk !== null && (
              <span style={{ fontSize: 12, fontWeight: 700, color: orderOk ? '#1A7A3C' : '#BA7517' }}>
                {orderOk ? 'порядок доминант совпадает' : 'профиль смещён от идеала роли (−25%)'}
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {['C', 'D', 'S', 'I'].map(function (k) {
              const t = targets[k]
              const v = Number(row['DISC ' + k + ' %'])
              const hit = !isNaN(v) && v >= t.min && v <= t.max
              return (
                <div key={k} style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                  <strong style={{ color: B.text }}>{k}</strong>{' '}
                  <span style={{ color: B.muted }}>{t.min}–{t.max}</span>{' '}
                  <span style={{ fontWeight: 700, color: isNaN(v) ? B.muted : (hit ? '#1A7A3C' : '#9B1818') }}>
                    {isNaN(v) ? '—' : v + (hit ? ' ✓' : ' ✗')}
                  </span>
                  <div style={{ color: B.muted, fontSize: 11.5 }}>{t.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <BlockDiscExtendedSummary row={row} />
    </div>
  )
}

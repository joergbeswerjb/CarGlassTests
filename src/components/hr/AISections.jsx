// AI-секции: флаги, сценарий интервью, финальный анализ.
// Флаги (B.1) - живые, через <AIFlags>. Сценарий и анализ - заглушки до B.2/B.3.

import { B, SHAPE } from '../../utils/brand.js'
import AIFlags from './AIFlags.jsx'

function Section({ icon, title, description, buttonText, onAction, isReady, badge, children }) {
  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, padding: '20px',
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <h3 style={{
            fontSize: 15, fontWeight: 700, color: B.text, margin: 0,
          }}>
            {title}
          </h3>
        </div>
        {badge && (
          <span style={{
            fontSize: 10, color: B.muted,
            background: B.light, padding: '3px 8px',
            borderRadius: 3, letterSpacing: '.04em',
            textTransform: 'uppercase', fontWeight: 600,
          }}>
            {badge}
          </span>
        )}
      </div>

      {description && (
        <p style={{
          fontSize: 13, color: B.muted, lineHeight: 1.6,
          margin: '0 0 14px',
        }}>
          {description}
        </p>
      )}

      {children}

      {buttonText && (
        <button
          onClick={onAction}
          disabled={!isReady}
          style={{
            padding: '9px 18px',
            background: isReady ? B.primary : B.light,
            color: isReady ? B.white : B.muted,
            border: 'none',
            borderRadius: SHAPE.asymmetric,
            fontSize: 13, fontWeight: 600,
            cursor: isReady ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}

export default function AISections({ row, cfg }) {
  // Сценарий и финальный анализ - заглушки, реализуем в B.2 и B.3.
  function handleGenerateScript() {
    alert('Будет реализовано в Части B.2:\n\n1. AI читает все ответы кандидата\n2. Анализирует слабые/неясные зоны\n3. Генерирует 5-7 STAR-вопросов прицельно туда, где тест показал слабину\n4. Возвращает структурированный сценарий интервью')
  }

  function handleGenerateAnalysis() {
    alert('Будет реализовано в Части B.3:\n\n1. AI читает тест + ответы с интервью\n2. Делает сводную оценку\n3. Выдаёт финальную рекомендацию + риски + вопросы для референса')
  }

  return (
    <div>
      <Section
        icon="🚩"
        title="AI-флаги по ответам"
        description="Автоматический анализ свободных ответов и DISC-сигналов кандидата. Красные риски, жёлтые предупреждения и позитивные маркеры - каждый с привязкой к профилю основателя."
      >
        <AIFlags row={row} />
      </Section>

      <Section
        icon="🎯"
        title="Сценарий интервью"
        description="AI генерирует 5-7 прицельных STAR-вопросов под результаты теста этого кандидата. Закрывает зоны, которые тест не измеряет напрямую: Builder-способность, готовность отпускать, hands-on диспозиция."
        buttonText="Сгенерировать сценарий"
        onAction={handleGenerateScript}
        isReady={true}
        badge="Demo: alert"
      />

      <Section
        icon="📋"
        title="Финальный анализ"
        description="Сводный отчёт после проведённого интервью: оценка по категориям, рекомендация (рекомендуется / условно / не рекомендуется), что компенсировать в команде, риски для onboarding, вопросы для звонка референсу."
        buttonText="Создать финальный анализ"
        onAction={handleGenerateAnalysis}
        isReady={true}
        badge="Demo: alert"
      />
    </div>
  )
}

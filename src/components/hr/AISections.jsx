// AI-секции: CV, флаги, сценарий интервью, финальный анализ.
// CV (B.2), флаги (B.1), сценарий (B.2) - живые. Финальный анализ - заглушка до B.3.

import { B, SHAPE } from '../../utils/brand.js'
import CVInput from './CVInput.jsx'
import AIFlags from './AIFlags.jsx'
import InterviewScript from './InterviewScript.jsx'

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
  // Финальный анализ - заглушка, реализуем в B.3.
  function handleGenerateAnalysis() {
    alert('Будет реализовано в Части B.3:\n\n1. AI читает тест + CV + ответы с интервью\n2. Сводная оценка\n3. Финальная рекомендация + риски + вопросы для референса')
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
        icon="📄"
        title="CV кандидата"
        description="Текст резюме. Учитывается при генерации сценария интервью и финального анализа: вопросы цепляются к реальным местам работы и проверяют расхождения с сигналами теста."
      >
        <CVInput row={row} />
      </Section>

      <Section
        icon="🎯"
        title="Сценарий интервью"
        description="5-7 прицельных STAR-вопросов под результаты этого кандидата плюс стандартная вводная и закрытие. Закрывает зоны, которые тест не измеряет: builder-способность, готовность отпускать, hands-on диспозиция."
      >
        <InterviewScript row={row} />
      </Section>

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

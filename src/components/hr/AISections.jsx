// AI-секции: флаги, CV, сценарий + ответы, финальный анализ. Все живые (B.1-B.3).

import { B, SHAPE } from '../../utils/brand.js'
import CVInput from './CVInput.jsx'
import AIFlags from './AIFlags.jsx'
import InterviewScript from './InterviewScript.jsx'
import FinalAnalysis from './FinalAnalysis.jsx'

function Section({ icon, title, description, children }) {
  return (
    <div style={{
      background: B.white, border: '1px solid ' + B.border,
      borderRadius: SHAPE.card, padding: '20px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: B.text, margin: 0 }}>{title}</h3>
      </div>
      {description && (
        <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.6, margin: '0 0 14px' }}>{description}</p>
      )}
      {children}
    </div>
  )
}

export default function AISections({ row, cfg }) {
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
        description="5-7 прицельных STAR-вопросов под результаты этого кандидата плюс стандартная вводная и закрытие. Под каждым вопросом - поле для ответа кандидата; сохрани ответы перед финальным анализом."
      >
        <InterviewScript row={row} />
      </Section>

      <Section
        icon="📋"
        title="Финальный анализ"
        description="Сводное досье на Opus: синтез теста, CV, сценария и ответов с интервью. Рекомендация, тест против интервью, силы, риски с действиями, что компенсировать в команде, вопросы для референса."
      >
        <FinalAnalysis row={row} />
      </Section>
    </div>
  )
}

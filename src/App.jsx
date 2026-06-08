import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TestPage from './pages/TestPage.jsx'
import DonePage from './pages/DonePage.jsx'
import HRPage  from './pages/HRPage.jsx'
import CandidateCardPage from './pages/CandidateCardPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Тест - роль берётся из URL параметра */}
        <Route path="/test/:roleSlug" element={<TestPage />} />

        {/* Экран завершения - кандидат не видит результатов */}
        <Route path="/done" element={<DonePage />} />

        {/* HR панель - список кандидатов */}
        <Route path="/hr" element={<HRPage />} />

        {/* HR панель - детальная карточка кандидата */}
        <Route path="/hr/:roleSlug/:id" element={<CandidateCardPage />} />

        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to="/hr" replace />} />

        {/* 404 - на HR */}
        <Route path="*" element={<Navigate to="/hr" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StartPage from './pages/StartPage.jsx'
import TestPage from './pages/TestPage.jsx'
import DonePage from './pages/DonePage.jsx'
import HRPage  from './pages/HRPage.jsx'
import CandidateCardPage from './pages/CandidateCardPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Стартовая страница - выбор роли */}
        <Route path="/" element={<StartPage />} />
        {/* Тест - роль берётся из URL параметра */}
        <Route path="/test/:roleSlug" element={<TestPage />} />
        {/* Экран завершения - кандидат не видит результатов */}
        <Route path="/done" element={<DonePage />} />
        {/* HR панель - список кандидатов */}
        <Route path="/hr" element={<HRPage />} />
        {/* HR панель - детальная карточка кандидата */}
        <Route path="/hr/:roleSlug/:id" element={<CandidateCardPage />} />
        {/* 404 - на стартовую (а не в HR) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

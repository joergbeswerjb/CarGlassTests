import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TestPage from './pages/TestPage.jsx'
import DonePage from './pages/DonePage.jsx'
import HRPage  from './pages/HRPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Тест — роль берётся из URL параметра */}
        <Route path="/test/:roleSlug" element={<TestPage />} />

        {/* Экран завершения — кандидат не видит результатов */}
        <Route path="/done" element={<DonePage />} />

        {/* HR панель */}
        <Route path="/hr" element={<HRPage />} />

        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to="/hr" replace />} />

        {/* 404 → HR */}
        <Route path="*" element={<Navigate to="/hr" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

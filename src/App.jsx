import { Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './lib/useSession.js'
import LoginPage from './pages/LoginPage.jsx'
import SprintBoardPage from './pages/SprintBoardPage.jsx'

export default function App() {
  const session = useSession()

  if (session.loading) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Routes>
        <Route
          path="/login"
          element={
            session.isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={session.refresh} />
          }
        />
        <Route
          path="/"
          element={
            session.isLoggedIn ? (
              <SprintBoardPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }                  from './hooks/useAuth.ts'

import AppShell                     from './components/layout/AppShell.tsx'
import LoginPage                    from './pages/auth/LoginPage.tsx'
import RegisterPage                 from './pages/auth/RegisterPage.tsx'
import DashboardPage                from './pages/DashboardPage.tsx'
import ProjectsPage                 from './pages/ProjectsPage.tsx'
import NewProjectPage               from './pages/NewProjectPage.tsx'
import ProjectDetailPage            from './pages/ProjectDetailPage.tsx'
import TasksPage                    from './pages/TasksPage.tsx'
import AnalyticsPage                from './pages/AnalyticsPage.tsx'
import NotificationsPage            from './pages/NotificationsPage.tsx'
import SettingsPage                 from './pages/SettingsPage.tsx'

// ─── Protected Route ──────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth } = useAuth()
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

// ─── Public Route ─────────────────────────────────────
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth } = useAuth()
  return !isAuth ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>

      {/* ── Public Routes ──────────────────────────── */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ── Protected Routes ───────────────────────── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index                element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="projects"      element={<ProjectsPage />} />
        <Route path="projects/new"  element={<NewProjectPage />} />  {/* ← BEFORE :id */}
        <Route path="projects/:id"  element={<ProjectDetailPage />} />
        <Route path="tasks"         element={<TasksPage />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      {/* ── Fallback ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  )
}
import { Outlet }   from 'react-router-dom'
import Sidebar      from './Sidebar.tsx'
import Header       from './Header.tsx'

export default function AppShell() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Sidebar ──────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ─────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* ── Header ────────────────────────────── */}
        <Header />

        {/* ── Page Content ──────────────────────── */}
        <main className="flex-1 p-8 overflow-y-auto fade-in">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
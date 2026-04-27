import { NavLink, Link }      from 'react-router-dom'
import { useAuth }            from '../../hooks/useAuth.ts'
import { useNotifications }   from '../../hooks/useNotifications.ts'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Dot,
}                             from 'lucide-react'

// ─── Nav Items ────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/projects',      icon: FolderKanban,    label: 'Projects'      },
  { to: '/tasks',         icon: CheckSquare,     label: 'Tasks'         },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics'     },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/settings',      icon: Settings,        label: 'Settings'      },
]

export default function Sidebar() {
  const { user, logout }  = useAuth()
  const { unreadCount }   = useNotifications()

  return (
    <aside
      style={{
        width:           220,
        background:      'var(--surface)',
        borderRight:     '1px solid var(--border)',
        display:         'flex',
        flexDirection:   'column',
        height:          '100vh',
        position:        'sticky',
        top:             0,
        flexShrink:      0,
        transition:      'background 0.3s ease',
      }}
    >

      {/* ── Logo ─────────────────────────────────────── */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div
          style={{
            padding:    '28px 24px 32px',
            display:    'flex',
            alignItems: 'center',
            gap:        12,
          }}
        >
          <div
            style={{
              width:          32,
              height:         32,
              background:     'var(--gold-dim)',
              border:         '1px solid var(--border)',
              borderRadius:   8,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       16,
              color:          'var(--gold)',
              flexShrink:     0,
              transition:     'background 0.3s ease',
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontFamily:    "'Cormorant Garamond', serif",
              fontSize:      20,
              fontWeight:    600,
              color:         'var(--gold)',
              letterSpacing: '-0.01em',
            }}
          >
            Aurum
          </span>
        </div>
      </Link>

      {/* ── Navigation ───────────────────────────────── */}
      <nav
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          gap:            2,
          padding:        '0 12px',
          overflowY:      'auto',
        }}
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display:        'flex',
              alignItems:     'center',
              gap:            12,
              padding:        '9px 12px',
              borderRadius:   8,
              borderLeft:     isActive
                ? '2px solid var(--gold)'
                : '2px solid transparent',
              background:     isActive ? 'var(--gold-dim)' : 'transparent',
              color:          isActive ? 'var(--gold)'     : 'var(--muted)',
              fontSize:       12,
              letterSpacing:  '0.04em',
              textDecoration: 'none',
              transition:     'all 0.2s ease',
              position:       'relative',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  color={isActive ? 'var(--gold)' : 'var(--muted)'}
                />
                <span style={{ flex: 1 }}>{label}</span>

                {/* Unread badge on Notifications */}
                {label === 'Notifications' && unreadCount > 0 && (
                  <span
                    style={{
                      background:     'var(--danger)',
                      color:          '#fff',
                      borderRadius:   '50%',
                      fontSize:       9,
                      fontWeight:     700,
                      width:          16,
                      height:         16,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      flexShrink:     0,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}

                {/* Active dot */}
                {isActive && (
                  <Dot size={16} color="var(--gold)" style={{ flexShrink: 0 }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Footer ──────────────────────────────── */}
      {user && (
        <div
          style={{
            padding:       '16px',
            borderTop:     '1px solid var(--border)',
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
          }}
        >
          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={user.name} size={32} avatarUrl={user.avatar} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  color:        'var(--text)',
                  fontSize:     12,
                  fontWeight:   500,
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 10 }}>
                {user.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              padding:      '7px 12px',
              background:   'transparent',
              border:       '1px solid var(--border)',
              borderRadius: 8,
              color:        'var(--muted)',
              fontSize:     11,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
              width:        '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--danger)'
              e.currentTarget.style.color       = 'var(--danger)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color       = 'var(--muted)'
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}

// ─── Avatar ───────────────────────────────────────────
function Avatar({
  name,
  size = 32,
  avatarUrl,
}: {
  name:       string
  size?:      number
  avatarUrl?: string
}) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hue = name.charCodeAt(0) * 7 % 360

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width:        size,
          height:       size,
          borderRadius: '50%',
          objectFit:    'cover',
          border:       '1.5px solid var(--border)',
          flexShrink:   0,
        }}
        onError={e => {
          (e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        background:     `hsl(${hue}, 40%, 30%)`,
        border:         `1.5px solid hsl(${hue}, 40%, 45%)`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       size * 0.35,
        color:          `hsl(${hue}, 60%, 75%)`,
        fontWeight:     500,
        flexShrink:     0,
      }}
    >
      {initials}
    </div>
  )
}
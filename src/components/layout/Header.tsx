import { useState, useRef, useEffect }  from 'react'
import { Link, useNavigate }            from 'react-router-dom'
import { useAuth }                      from '../../hooks/useAuth.ts'
import { useNotifications }             from '../../hooks/useNotifications.ts'
import { useTheme }                     from '../../hooks/useTheme.ts'
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
  Sun,
  Moon,
}                                       from 'lucide-react'
import type { INotification }           from '../../types/index.ts'

export default function Header() {
  const navigate                        = useNavigate()
  const { user, logout }                = useAuth()
  const { isDark, toggleTheme }         = useTheme()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }                                     = useNotifications()

  const [showNotifications,
         setShowNotifications]          = useState(false)
  const [showUserMenu,
         setShowUserMenu]               = useState(false)
  const [search, setSearch]             = useState('')

  const notifRef                        = useRef<HTMLDivElement>(null)
  const userRef                         = useRef<HTMLDivElement>(null)

  // ── Close dropdowns on outside click ──────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current &&
          !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (userRef.current &&
          !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Search submit ──────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/projects?search=${encodeURIComponent(search.trim())}`)
    setSearch('')
  }

  // ── Logout ─────────────────────────────────────────
  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    navigate('/login')
  }

  // ── Shared icon button style ───────────────────────
  const iconBtn: React.CSSProperties = {
    position:       'relative',
    background:     'transparent',
    border:         '1px solid var(--border)',
    borderRadius:   8,
    padding:        '7px 8px',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          'var(--muted)',
    transition:     'all 0.2s ease',
  }

  const onIconEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'var(--gold)'
    e.currentTarget.style.color       = 'var(--gold)'
  }

  const onIconLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.color       = 'var(--muted)'
  }

  return (
    <header
      style={{
        padding:      '14px 32px',
        borderBottom: '1px solid var(--border)',
        display:      'flex',
        alignItems:   'center',
        gap:          16,
        background:   'var(--surface)',
        position:     'sticky',
        top:          0,
        zIndex:       30,
        transition:   'background 0.3s ease',
      }}
    >

      {/* ── Search ───────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        style={{ flex: 1, maxWidth: 400, position: 'relative' }}
      >
        <Search
          size={14}
          style={{
            position:  'absolute',
            left:      12,
            top:       '50%',
            transform: 'translateY(-50%)',
            color:     'var(--muted)',
          }}
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          style={{ paddingLeft: 36, paddingRight: 14, height: 36, fontSize: 12 }}
        />
      </form>

      {/* ── Right Actions ────────────────────────────── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        8,
          marginLeft: 'auto',
        }}
      >

        {/* ── Theme Toggle ───────────────────────────── */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={iconBtn}
          onMouseEnter={onIconEnter}
          onMouseLeave={onIconLeave}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* ── Notification Bell ──────────────────────── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(p => !p)
              setShowUserMenu(false)
            }}
            style={iconBtn}
            onMouseEnter={onIconEnter}
            onMouseLeave={onIconLeave}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position:       'absolute',
                  top:            -4,
                  right:          -4,
                  background:     'var(--danger)',
                  color:          '#fff',
                  borderRadius:   '50%',
                  fontSize:       8,
                  fontWeight:     700,
                  width:          14,
                  height:         14,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div
              style={{
                position:     'absolute',
                top:          'calc(100% + 8px)',
                right:        0,
                width:        340,
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                borderRadius: 12,
                boxShadow:    '0 12px 40px rgba(0,0,0,0.3)',
                zIndex:       60,
                overflow:     'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding:        '14px 16px',
                  borderBottom:   '1px solid var(--border)',
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize:   16,
                    fontWeight: 600,
                    color:      'var(--text)',
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border:     'none',
                      color:      'var(--gold)',
                      fontSize:   11,
                      cursor:     'pointer',
                      display:    'flex',
                      alignItems: 'center',
                      gap:        4,
                    }}
                  >
                    <Check size={11} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding:   '32px 16px',
                      textAlign: 'center',
                      color:     'var(--muted)',
                      fontSize:  12,
                    }}
                  >
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onRead={() => markAsRead(n._id)}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div
                  style={{
                    padding:   '10px 16px',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center',
                  }}
                >
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    style={{ color: 'var(--gold)', fontSize: 11 }}
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Menu ──────────────────────────────── */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowUserMenu(p => !p)
              setShowNotifications(false)
            }}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              padding:      '6px 10px',
              background:   'transparent',
              border:       '1px solid var(--border)',
              borderRadius: 8,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <UserAvatar name={user?.name ?? 'U'} size={24} avatarUrl={user?.avatar} />
            <span style={{ color: 'var(--text)', fontSize: 12 }}>
              {user?.name.split(' ')[0]}
            </span>
            <ChevronDown size={12} color="var(--muted)" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position:     'absolute',
                top:          'calc(100% + 8px)',
                right:        0,
                width:        180,
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                borderRadius: 10,
                boxShadow:    '0 12px 40px rgba(0,0,0,0.3)',
                zIndex:       60,
                overflow:     'hidden',
                padding:      '4px',
              }}
            >
              {/* User info */}
              <div
                style={{
                  padding:      '10px 12px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 4,
                }}
              >
                <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>
                  {user?.name}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 10 }}>
                  {user?.email}
                </div>
              </div>

              {/* Links */}
              {[
                { icon: User,     label: 'Profile',  to: '/settings' },
                { icon: Settings, label: 'Settings', to: '/settings' },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            8,
                    padding:        '8px 12px',
                    color:          'var(--muted)',
                    fontSize:       12,
                    borderRadius:   6,
                    transition:     'all 0.15s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--gold-dim)'
                    e.currentTarget.style.color      = 'var(--text)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color      = 'var(--muted)'
                  }}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                  padding:      '8px 12px',
                  background:   'transparent',
                  border:       'none',
                  color:        'var(--muted)',
                  fontSize:     12,
                  borderRadius: 6,
                  cursor:       'pointer',
                  width:        '100%',
                  textAlign:    'left',
                  marginTop:    4,
                  transition:   'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,108,108,0.1)'
                  e.currentTarget.style.color      = 'var(--danger)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color      = 'var(--muted)'
                }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Notification Item ────────────────────────────────
function NotificationItem({
  notification,
  onRead,
}: {
  notification: INotification
  onRead:       () => void
}) {
  const timeAgo = (date: string) => {
    const diff    = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours   = Math.floor(diff / 3600000)
    const days    = Math.floor(diff / 86400000)

    if (minutes < 1)  return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours   < 24) return `${hours}h ago`
    return               `${days}d ago`
  }

  return (
    <div
      onClick={onRead}
      style={{
        padding:      '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor:       'pointer',
        background:   notification.read ? 'transparent' : 'var(--gold-glow)',
        transition:   'background 0.2s ease',
        display:      'flex',
        gap:          10,
        alignItems:   'flex-start',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--gold-dim)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background =
          notification.read ? 'transparent' : 'var(--gold-glow)'
      }}
    >
      {/* Unread dot */}
      {!notification.read && (
        <div
          style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   'var(--gold)',
            flexShrink:   0,
            marginTop:    5,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color:        'var(--text)',
            fontSize:     12,
            fontWeight:   notification.read ? 400 : 500,
            marginBottom: 2,
          }}
        >
          {notification.title}
        </div>
        <div
          style={{
            color:        'var(--muted)',
            fontSize:     11,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}
        >
          {notification.message}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4 }}>
          {timeAgo(notification.createdAt)}
        </div>
      </div>
    </div>
  )
}

// ─── User Avatar ──────────────────────────────────────
function UserAvatar({
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
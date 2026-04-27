import { useState }                from 'react'
import { useNotifications }        from '../hooks/useNotifications.ts'
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Filter,
}                                  from 'lucide-react'
import type {
  INotification,
  // NotificationType,
}                                  from '../types/index.ts'


const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  TASK_ASSIGNED:         { label: 'Task Assigned',    color: 'var(--gold)',    icon: '📋' },
  TASK_UPDATED:          { label: 'Task Updated',     color: 'var(--info)',    icon: '✏️' },
  TASK_COMMENT:          { label: 'Comment',          color: 'var(--purple)',  icon: '💬' },
  TASK_DELETED:          { label: 'Task Deleted',     color: 'var(--danger)',  icon: '🗑️' },
  PROJECT_CREATED:       { label: 'Project Created',  color: 'var(--success)', icon: '🚀' },
  PROJECT_DELETED:       { label: 'Project Deleted',  color: 'var(--danger)',  icon: '🗑️' },
  PROJECT_UPDATED:       { label: 'Project Updated',  color: 'var(--warn)',    icon: '📁' },
  PROJECT_MEMBER_ADDED:  { label: 'Member Added',     color: 'var(--success)', icon: '👤' },
  PROJECT_MEMBER_REMOVED:{ label: 'Member Removed',   color: 'var(--danger)',  icon: '👤' },
}

const DEFAULT_CONFIG = { label: 'Notification', color: 'var(--muted)', icon: '🔔' }

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }                                       = useNotifications()

  const [filter, setFilter]               = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter,
         setTypeFilter]                   = useState<string>('all')
  const [showTypeFilter,
         setShowTypeFilter]               = useState(false)

  // ── Filtered notifications ─────────────────────────
  const filtered = notifications.filter(n => {
    const readMatch =
      filter === 'all'    ? true :
      filter === 'unread' ? !n.isRead :   // ← isRead
                             n.isRead      // ← isRead

    const typeMatch =
      typeFilter === 'all' ? true : n.type === typeFilter

    return readMatch && typeMatch
  })

  const timeAgo = (date: string): string => {
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
    <div className="fade-in">

      {/* ── Page Header ──────────────────────────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-end',
          marginBottom:   32,
        }}
      >
        <div>
          <div className="gold-line" />
          <h1
            style={{
              fontFamily:    "'Cormorant Garamond', serif",
              fontSize:      32,
              fontWeight:    600,
              color:         'var(--text)',
              letterSpacing: '-0.02em',
            }}
          >
            Notifications
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              padding:      '9px 18px',
              background:   'var(--gold-dim)',
              border:       '1px solid var(--gold)',
              borderRadius: 8,
              color:        'var(--gold)',
              fontSize:     12,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gold)'
              e.currentTarget.style.color      = 'var(--bg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--gold-dim)'
              e.currentTarget.style.color      = 'var(--gold)'
            }}
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Filter Bar ───────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          gap:          8,
          marginBottom: 24,
          flexWrap:     'wrap',
          alignItems:   'center',
        }}
      >
        {(
          [
            { value: 'all',    label: 'All'    },
            { value: 'unread', label: 'Unread' },
            { value: 'read',   label: 'Read'   },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding:      '5px 16px',
              borderRadius: 20,
              border:       `1px solid ${filter === value ? 'var(--gold)' : 'var(--border)'}`,
              background:   filter === value ? 'var(--gold-dim)' : 'transparent',
              color:        filter === value ? 'var(--gold)'     : 'var(--muted)',
              fontSize:     11,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
          >
            {label}
            {value === 'unread' && unreadCount > 0 && (
              <span
                style={{
                  background:   'var(--danger)',
                  color:        '#fff',
                  borderRadius: '50%',
                  fontSize:     9,
                  fontWeight:   700,
                  padding:      '1px 5px',
                  marginLeft:   6,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}

        {/* Type filter toggle */}
        <button
          onClick={() => setShowTypeFilter(prev => !prev)}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            padding:      '5px 14px',
            borderRadius: 20,
            border:       `1px solid ${showTypeFilter ? 'var(--gold)' : 'var(--border)'}`,
            background:   showTypeFilter ? 'var(--gold-dim)' : 'transparent',
            color:        showTypeFilter ? 'var(--gold)'     : 'var(--muted)',
            fontSize:     11,
            cursor:       'pointer',
            transition:   'all 0.2s ease',
          }}
        >
          <Filter size={11} />
          Type
        </button>

        {/* Type pills */}
        {showTypeFilter && (
          <>
            <button
              onClick={() => setTypeFilter('all')}
              style={{
                padding:      '5px 14px',
                borderRadius: 20,
                border:       `1px solid ${typeFilter === 'all' ? 'var(--gold)' : 'var(--border)'}`,
                background:   typeFilter === 'all' ? 'var(--gold-dim)' : 'transparent',
                color:        typeFilter === 'all' ? 'var(--gold)'     : 'var(--muted)',
                fontSize:     11,
                cursor:       'pointer',
                transition:   'all 0.2s ease',
              }}
            >
              All types
            </button>
            {Object.keys(typeConfig).map(type => {
              const cfg = typeConfig[type]
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding:      '5px 14px',
                    borderRadius: 20,
                    border:       `1px solid ${typeFilter === type
                      ? cfg.color
                      : 'var(--border)'}`,
                    background:   typeFilter === type
                      ? `${cfg.color}15`
                      : 'transparent',
                    color:        typeFilter === type
                      ? cfg.color
                      : 'var(--muted)',
                    fontSize:     11,
                    cursor:       'pointer',
                    transition:   'all 0.2s ease',
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              )
            })}
          </>
        )}
      </div>

      {/* ── Notifications List ───────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding:   '80px 24px',
            color:     'var(--muted)',
          }}
        >
          <Bell
            size={40}
            color="var(--border)"
            style={{ margin: '0 auto 16px' }}
          />
          <p>
            {filter !== 'all' || typeFilter !== 'all'
              ? 'No notifications match your filters'
              : 'No notifications yet'
            }
          </p>
        </div>
      ) : (
        <div
          style={{
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            borderRadius: 14,
            overflow:     'hidden',
          }}
        >
          {filtered.map((notification, index) => (
            <NotificationRow
              key={notification._id}
              notification={notification}
              isLast={index === filtered.length - 1}
              onRead={() => markAsRead(notification._id)}
              onDelete={() => deleteNotification(notification._id)}
              timeAgo={timeAgo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Notification Row ─────────────────────────────────
function NotificationRow({
  notification,
  isLast,
  onRead,
  onDelete,
  timeAgo,
}: {
  notification: INotification
  isLast:       boolean
  onRead:       () => void
  onDelete:     () => void
  timeAgo:      (date: string) => string
}) {
  const [hovered, setHovered]  = useState(false)
  const config                 = typeConfig[notification.type] ?? DEFAULT_CONFIG

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'flex',
        alignItems:   'flex-start',
        gap:          14,
        padding:      '16px 20px',
        background:   hovered
          ? 'var(--gold-dim)'
          : notification.isRead                  // ← isRead
          ? 'transparent'
          : 'var(--gold-glow)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        transition:   'background 0.2s ease',
      }}
    >
      {/* Type icon */}
      <div
        style={{
          width:          36,
          height:         36,
          borderRadius:   '50%',
          background:     `${config.color}15`,
          border:         `1px solid ${config.color}30`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       16,
          flexShrink:     0,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              color:      'var(--text)',
              fontSize:   12,
              fontWeight: notification.isRead ? 400 : 600,   // ← isRead
            }}
          >
            {notification.message}
          </span>

          {/* Unread dot */}
          {!notification.isRead && (                         // ← isRead
            <div
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   'var(--gold)',
                flexShrink:   0,
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span
            style={{
              background:    `${config.color}15`,
              color:         config.color,
              borderRadius:  4,
              fontSize:      9,
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding:       '2px 7px',
            }}
          >
            {config.label}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 10 }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display:    'flex',
          gap:        6,
          flexShrink: 0,
          opacity:    hovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* Mark as read */}
        {!notification.isRead && (                           // ← isRead
          <button
            onClick={e => { e.stopPropagation(); onRead() }}
            title="Mark as read"
            style={{
              background:   'var(--panel)',
              border:       '1px solid var(--border)',
              borderRadius: 6,
              padding:      '5px 6px',
              cursor:       'pointer',
              display:      'flex',
              color:        'var(--muted)',
              transition:   'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--success)'
              e.currentTarget.style.color       = 'var(--success)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color       = 'var(--muted)'
            }}
          >
            <Check size={12} />
          </button>
        )}

        {/* Delete */}
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Delete"
          style={{
            background:   'var(--panel)',
            border:       '1px solid var(--border)',
            borderRadius: 6,
            padding:      '5px 6px',
            cursor:       'pointer',
            display:      'flex',
            color:        'var(--muted)',
            transition:   'all 0.15s ease',
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
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
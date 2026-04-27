import { useState }               from 'react'
import { useAuth }                from '../hooks/useAuth.ts'
import { useTheme }               from '../hooks/useTheme.ts'
import api, { getErrorMessage }   from '../services/api.ts'
import {
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
}                                 from 'lucide-react'

// ─── Tab Config ───────────────────────────────────────
const TABS = [
  { id: 'profile',        label: 'Profile',        icon: User  },
  { id: 'security',       label: 'Security',       icon: Lock  },
  { id: 'notifications',  label: 'Notifications',  icon: Bell  },
  { id: 'appearance',     label: 'Appearance',     icon: Sun   },
] as const

type Tab = typeof TABS[number]['id']

export default function SettingsPage() {
  const { user, updateUser }      = useAuth()
  const { isDark, toggleTheme }   = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div className="fade-in">

      {/* ── Page Header ──────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
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
          Settings
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
          Manage your account and preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>

        {/* ── Sidebar Tabs ─────────────────────────── */}
        <div
          style={{
            background:    'var(--surface)',
            border:        '1px solid var(--border)',
            borderRadius:  14,
            padding:       8,
            height:        'fit-content',
          }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                padding:      '9px 12px',
                width:        '100%',
                background:   activeTab === id ? 'var(--gold-dim)' : 'transparent',
                border:       `1px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`,
                borderRadius: 8,
                color:        activeTab === id ? 'var(--gold)' : 'var(--muted)',
                fontSize:     12,
                cursor:       'pointer',
                marginBottom: 2,
                transition:   'all 0.2s ease',
                textAlign:    'left',
              }}
              onMouseEnter={e => {
                if (activeTab !== id) {
                  e.currentTarget.style.background = 'var(--panel)'
                  e.currentTarget.style.color      = 'var(--text)'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color      = 'var(--muted)'
                }
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────── */}
        <div>
          {activeTab === 'profile'       && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'appearance'    && <AppearanceTab isDark={isDark} toggleTheme={toggleTheme} />}
        </div>
      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────
function ProfileTab({
  user,
  updateUser,
}: {
  user:       ReturnType<typeof useAuth>['user']
  updateUser: ReturnType<typeof useAuth>['updateUser']
}) {
  const [form, setForm]         = useState({
    name:   user?.name   ?? '',
    avatar: user?.avatar ?? '',
  })
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await api.patch<{
        status: string
        data:   { user: NonNullable<typeof user> }
      }>('/auth/me', {
        name:   form.name.trim(),
        avatar: form.avatar.trim() || undefined,
      })

      updateUser(response.data.data.user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 14,
        padding:      28,
      }}
    >
      <div className="gold-line" />
      <h3
        style={{
          fontFamily:   "'Cormorant Garamond', serif",
          fontSize:     20,
          color:        'var(--text)',
          marginBottom: 24,
        }}
      >
        Profile Information
      </h3>

      {/* Avatar preview */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          16,
          marginBottom: 28,
          padding:      '16px 20px',
          background:   'var(--panel)',
          border:       '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        <Avatar name={user?.name ?? 'U'} size={52} avatarUrl={user?.avatar} />
        <div>
          <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
            {user?.name}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
            {user?.email}
          </div>
          <span
            style={{
              background:    'var(--gold-dim)',
              color:         'var(--gold)',
              borderRadius:  4,
              fontSize:      9,
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding:       '2px 7px',
              marginTop:     6,
              display:       'inline-block',
            }}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* Success / Error */}
      {success && (
        <div
          style={{
            background:   'rgba(108,201,151,0.1)',
            border:       '1px solid rgba(108,201,151,0.3)',
            borderRadius: 8,
            padding:      '10px 14px',
            marginBottom: 20,
            color:        'var(--success)',
            fontSize:     12,
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}
          className="fade-in"
        >
          <Check size={13} /> Profile updated successfully
        </div>
      )}

      {error && (
        <div
          style={{
            background:   'rgba(201,108,108,0.1)',
            border:       '1px solid rgba(201,108,108,0.3)',
            borderRadius: 8,
            padding:      '10px 14px',
            marginBottom: 20,
            color:        'var(--danger)',
            fontSize:     12,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Name */}
        <div>
          <label>Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>

        {/* Email — read only */}
        <div>
          <label>Email Address</label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          />
          <span style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4, display: 'block' }}>
            Email cannot be changed
          </span>
        </div>

        {/* Avatar URL */}
        <div>
          <label>Avatar URL</label>
          <input
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
          <span style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4, display: 'block' }}>
            Enter a URL for your profile photo
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            padding:        '11px 24px',
            background:     'var(--gold)',
            color:          'var(--bg)',
            border:         'none',
            borderRadius:   8,
            fontSize:       12,
            fontWeight:     500,
            cursor:         saving ? 'not-allowed' : 'pointer',
            opacity:        saving ? 0.7 : 1,
            width:          'fit-content',
            transition:     'opacity 0.2s',
          }}
        >
          {saving
            ? <><Loader2 size={13} className="spin" /> Saving…</>
            : <><Save size={13} /> Save Changes</>
          }
        </button>
      </form>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────
function SecurityTab() {
  const [form, setForm]         = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [showCurrent,
         setShowCurrent]        = useState(false)
  const [showNew,
         setShowNew]            = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await api.patch('/auth/me/password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })

      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 14,
        padding:      28,
      }}
    >
      <div className="gold-line" />
      <h3
        style={{
          fontFamily:   "'Cormorant Garamond', serif",
          fontSize:     20,
          color:        'var(--text)',
          marginBottom: 24,
        }}
      >
        Change Password
      </h3>

      {success && (
        <div
          style={{
            background:   'rgba(108,201,151,0.1)',
            border:       '1px solid rgba(108,201,151,0.3)',
            borderRadius: 8,
            padding:      '10px 14px',
            marginBottom: 20,
            color:        'var(--success)',
            fontSize:     12,
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}
          className="fade-in"
        >
          <Check size={13} /> Password updated successfully
        </div>
      )}

      {error && (
        <div
          style={{
            background:   'rgba(201,108,108,0.1)',
            border:       '1px solid rgba(201,108,108,0.3)',
            borderRadius: 8,
            padding:      '10px 14px',
            marginBottom: 20,
            color:        'var(--danger)',
            fontSize:     12,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Current Password */}
        <div>
          <label>Current Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              style={{ paddingRight: 40 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(p => !p)}
              style={{
                position:   'absolute',
                right:      12,
                top:        '50%',
                transform:  'translateY(-50%)',
                background: 'none',
                border:     'none',
                color:      'var(--muted)',
                cursor:     'pointer',
                display:    'flex',
                padding:    0,
              }}
            >
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label>New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              style={{ paddingRight: 40 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(p => !p)}
              style={{
                position:   'absolute',
                right:      12,
                top:        '50%',
                transform:  'translateY(-50%)',
                background: 'none',
                border:     'none',
                color:      'var(--muted)',
                cursor:     'pointer',
                display:    'flex',
                padding:    0,
              }}
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat new password"
            style={{
              borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword
                ? 'var(--danger)'
                : form.confirmPassword && form.confirmPassword === form.newPassword
                ? 'var(--success)'
                : undefined,
            }}
            required
          />
          {form.confirmPassword && form.confirmPassword === form.newPassword && (
            <span style={{ color: 'var(--success)', fontSize: 11, marginTop: 4, display: 'block' }}>
              ✓ Passwords match
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            padding:        '11px 24px',
            background:     'var(--gold)',
            color:          'var(--bg)',
            border:         'none',
            borderRadius:   8,
            fontSize:       12,
            fontWeight:     500,
            cursor:         saving ? 'not-allowed' : 'pointer',
            opacity:        saving ? 0.7 : 1,
            width:          'fit-content',
            transition:     'opacity 0.2s',
          }}
        >
          {saving
            ? <><Loader2 size={13} className="spin" /> Updating…</>
            : <><Lock size={13} /> Update Password</>
          }
        </button>
      </form>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    task_assigned:     true,
    task_commented:    true,
    project_invite:    true,
    deadline_reminder: true,
    task_updated:      false,
    project_updated:   false,
    member_added:      true,
    member_removed:    true,
  })

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const prefItems = [
    { key: 'task_assigned',     label: 'Task assigned to me',     description: 'When someone assigns you a task'         },
    { key: 'task_commented',    label: 'New comments',            description: 'When someone comments on your task'      },
    { key: 'project_invite',    label: 'Project invitations',     description: 'When you are added to a project'         },
    { key: 'deadline_reminder', label: 'Deadline reminders',      description: 'Reminders for upcoming task deadlines'   },
    { key: 'task_updated',      label: 'Task status updates',     description: 'When task status changes'                },
    { key: 'project_updated',   label: 'Project updates',         description: 'When a project is updated'               },
    { key: 'member_added',      label: 'Member added',            description: 'When a member joins your project'        },
    { key: 'member_removed',    label: 'Member removed',          description: 'When a member leaves your project'       },
  ] as const

  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 14,
        padding:      28,
      }}
    >
      <div className="gold-line" />
      <h3
        style={{
          fontFamily:   "'Cormorant Garamond', serif",
          fontSize:     20,
          color:        'var(--text)',
          marginBottom: 8,
        }}
      >
        Notification Preferences
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 24 }}>
        Choose which notifications you want to receive
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {prefItems.map(({ key, label, description }) => (
          <div
            key={key}
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              padding:        '14px 16px',
              background:     'var(--panel)',
              border:         '1px solid var(--border)',
              borderRadius:   8,
            }}
          >
            <div>
              <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>
                {label}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                {description}
              </div>
            </div>

            {/* Toggle switch */}
            <div
              onClick={() => toggle(key)}
              style={{
                width:        44,
                height:       24,
                borderRadius: 12,
                background:   prefs[key] ? 'var(--gold)' : 'var(--border)',
                position:     'relative',
                cursor:       'pointer',
                transition:   'background 0.25s ease',
                flexShrink:   0,
              }}
            >
              <div
                style={{
                  position:   'absolute',
                  top:        3,
                  left:       prefs[key] ? 23 : 3,
                  width:      18,
                  height:     18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.25s ease',
                  boxShadow:  '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          padding:        '11px 24px',
          background:     'var(--gold)',
          color:          'var(--bg)',
          border:         'none',
          borderRadius:   8,
          fontSize:       12,
          fontWeight:     500,
          cursor:         'pointer',
          marginTop:      20,
          transition:     'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <Save size={13} />
        Save Preferences
      </button>
    </div>
  )
}

// ─── Appearance Tab ───────────────────────────────────
function AppearanceTab({
  isDark,
  toggleTheme,
}: {
  isDark:       boolean
  toggleTheme:  () => void
}) {
  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 14,
        padding:      28,
      }}
    >
      <div className="gold-line" />
      <h3
        style={{
          fontFamily:   "'Cormorant Garamond', serif",
          fontSize:     20,
          color:        'var(--text)',
          marginBottom: 8,
        }}
      >
        Appearance
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 24 }}>
        Customise how Aurum looks for you
      </p>

      {/* Theme Selection */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ marginBottom: 12, display: 'block' }}>Theme</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            {
              id:    'dark',
              label: 'Dark',
              icon:  Moon,
              desc:  'Easy on the eyes',
            },
            {
              id:    'light',
              label: 'Light',
              icon:  Sun,
              desc:  'Clean and bright',
            },
          ].map(({ id, label, icon: Icon, desc }) => {
            const active = isDark ? id === 'dark' : id === 'light'
            return (
              <button
                key={id}
                onClick={() => {
                  if ((id === 'dark') !== isDark) toggleTheme()
                }}
                style={{
                  flex:         1,
                  padding:      '20px 16px',
                  background:   active ? 'var(--gold-dim)' : 'var(--panel)',
                  border:       `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor:       'pointer',
                  textAlign:    'center',
                  transition:   'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width:          36,
                    height:         36,
                    background:     active ? 'var(--gold-dim)' : 'var(--surface)',
                    border:         `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius:   '50%',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    margin:         '0 auto 10px',
                  }}
                >
                  <Icon size={16} color={active ? 'var(--gold)' : 'var(--muted)'} />
                </div>
                <div
                  style={{
                    color:      active ? 'var(--gold)' : 'var(--text)',
                    fontSize:   13,
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 10 }}>
                  {desc}
                </div>
                {active && (
                  <div
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      gap:          4,
                      marginTop:    8,
                      color:        'var(--gold)',
                      fontSize:     10,
                    }}
                  >
                    <Check size={10} /> Active
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Font preview */}
      <div
        style={{
          padding:      20,
          background:   'var(--panel)',
          border:       '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            color:         'var(--muted)',
            fontSize:      10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom:  12,
          }}
        >
          Font Preview
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize:   24,
            color:      'var(--text)',
            marginBottom: 4,
          }}
        >
          Cormorant Garamond
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12 }}>
          DM Mono — body text and code
        </div>
      </div>
    </div>
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
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const hue      = name.charCodeAt(0) * 7 % 360

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
          border:       '2px solid var(--border)',
          flexShrink:   0,
        }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
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
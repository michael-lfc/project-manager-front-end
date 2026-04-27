import { useEffect }              from 'react'
import { Link }                   from 'react-router-dom'
import { useAuth }                from '../hooks/useAuth.ts'
import { useProjects }            from '../hooks/useProjects.ts'
import {
  FolderKanban,
  CheckSquare,
  TrendingUp,
  ChevronRight,
  AlertCircle,
}                                 from 'lucide-react'
import type { IProject}   from '../types/index.ts'

export default function DashboardPage() {
  const { user }                    = useAuth()
  const { projects, fetchProjects, loading } = useProjects()

  // ── Fetch projects on mount ────────────────────────
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // ── Derived stats ──────────────────────────────────
  const activeProjects    = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

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
          {greeting()}, {user?.name.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
          Here's what's happening across your projects today.
        </p>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                 16,
          marginBottom:        32,
        }}
      >
        {[
          {
            label: 'Total Projects',
            value: projects.length,
            delta: `${activeProjects.length} active`,
            icon:  FolderKanban,
            color: 'var(--gold)',
          },
          {
            label: 'Active Projects',
            value: activeProjects.length,
            delta: 'In progress',
            icon:  TrendingUp,
            color: 'var(--info)',
          },
          {
            label: 'Completed',
            value: completedProjects.length,
            delta: 'All time',
            icon:  CheckSquare,
            color: 'var(--success)',
          },
          {
            label: 'Overdue',
            value: projects.filter(p => p.isOverdue).length,
            delta: 'Need attention',
            icon:  AlertCircle,
            color: 'var(--danger)',
          },
        ].map(({ label, value, delta, icon: Icon, color }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            delta={delta}
            icon={Icon}
            color={color}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Active Projects ───────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
      >
        {/* Projects List */}
        <div
          style={{
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            borderRadius: 14,
            padding:      24,
          }}
        >
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   20,
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize:   18,
                color:      'var(--text)',
              }}
            >
              Active Projects
            </h3>
            <Link
              to="/projects"
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        4,
                color:      'var(--muted)',
                fontSize:   11,
              }}
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : activeProjects.length === 0 ? (
            <EmptyState
              message="No active projects"
              action={{ label: 'Create one', to: '/projects' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeProjects.slice(0, 5).map(project => (
                <ProjectRow key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity / Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Project Status Breakdown */}
          <div
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 14,
              padding:      24,
            }}
          >
            <h3
              style={{
                fontFamily:   "'Cormorant Garamond', serif",
                fontSize:     18,
                color:        'var(--text)',
                marginBottom: 16,
              }}
            >
              Project Status
            </h3>

            {loading ? (
              <SkeletonList count={4} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(
                  [
                    { status: 'active',    color: 'var(--success)', label: 'Active' },
                    { status: 'planning',  color: 'var(--info)',    label: 'Planning' },
                    { status: 'on-hold',   color: 'var(--warn)',    label: 'On Hold' },
                    { status: 'completed', color: 'var(--muted)',   label: 'Completed' },
                  ] as const
                ).map(({ status, color, label }) => {
                  const count   = projects.filter(p => p.status === status).length
                  const percent = projects.length > 0
                    ? Math.round((count / projects.length) * 100)
                    : 0

                  return (
                    <div key={status}>
                      <div
                        style={{
                          display:        'flex',
                          justifyContent: 'space-between',
                          marginBottom:   4,
                        }}
                      >
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                          {label}
                        </span>
                        <span style={{ color, fontSize: 11 }}>
                          {count}
                        </span>
                      </div>
                      <ProgressBar value={percent} color={color} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 14,
              padding:      24,
            }}
          >
            <h3
              style={{
                fontFamily:   "'Cormorant Garamond', serif",
                fontSize:     18,
                color:        'var(--text)',
                marginBottom: 16,
              }}
            >
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'View all projects',  to: '/projects',  icon: FolderKanban },
                { label: 'Open task board',    to: '/tasks',     icon: CheckSquare  },
                { label: 'View analytics',     to: '/analytics', icon: TrendingUp   },
              ].map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          10,
                    padding:      '10px 12px',
                    background:   'var(--panel)',
                    border:       '1px solid var(--border)',
                    borderRadius: 8,
                    color:        'var(--muted)',
                    fontSize:     12,
                    transition:   'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--gold)'
                    e.currentTarget.style.color       = 'var(--text)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color       = 'var(--muted)'
                  }}
                >
                  <Icon size={14} color="var(--gold)" />
                  {label}
                  <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────
function StatCard({
  label, value, delta, icon: Icon, color, loading,
}: {
  label:   string
  value:   number
  delta:   string
  icon:    React.ElementType
  color:   string
  loading: boolean
}) {
  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 14,
        padding:      24,
        transition:   'border-color 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
        ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(0)'
      }}
    >
      <div
        style={{
          background:   `${color}15`,
          border:       `1px solid ${color}30`,
          borderRadius: 8,
          padding:      8,
          display:      'inline-flex',
          marginBottom: 16,
        }}
      >
        <Icon size={16} color={color} />
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 8 }} />
      ) : (
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize:   36,
            fontWeight: 600,
            lineHeight: 1,
            color:      'var(--text)',
          }}
        >
          {value}
        </div>
      )}

      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 10, marginTop: 8, letterSpacing: '0.06em' }}>
        {delta}
      </div>
    </div>
  )
}

// ─── Project Row ──────────────────────────────────────
function ProjectRow({ project }: { project: IProject }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
          padding:    '10px 12px',
          background: 'var(--panel)',
          border:     '1px solid var(--border)',
          borderRadius: 8,
          transition: 'all 0.2s ease',
          cursor:     'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
          ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateX(2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateX(0)'
        }}
      >
        {/* Color dot */}
        <div
          style={{
            width:        10,
            height:       10,
            borderRadius: '50%',
            background:   project.color,
            flexShrink:   0,
          }}
        />

        {/* Title + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color:        'var(--text)',
              fontSize:     12,
              fontWeight:   500,
              marginBottom: 4,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {project.title}
          </div>
          <ProgressBar value={project.progress} color={project.color} />
        </div>

        {/* Progress % */}
        <div
          style={{
            color:     'var(--gold)',
            fontSize:  11,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {project.progress}%
        </div>

        {/* Priority badge */}
        <PriorityBadge priority={project.priority} />
      </div>
    </Link>
  )
}

// ─── Progress Bar ─────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        background:   'var(--panel)',
        borderRadius: 4,
        height:       4,
        overflow:     'hidden',
        width:        '100%',
      }}
    >
      <div
        style={{
          width:        `${value}%`,
          height:       '100%',
          background:   color,
          borderRadius: 4,
          transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  )
}

// ─── Priority Badge ───────────────────────────────────
const priorityColors: Record<string, string> = {
  low:      'var(--success)',
  medium:   'var(--warn)',
  high:     'var(--gold)',
  critical: 'var(--danger)',
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityColors[priority] ?? 'var(--muted)'
  return (
    <span
      style={{
        background:    `${color}20`,
        color,
        borderRadius:  4,
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding:       '2px 8px',
        whiteSpace:    'nowrap',
      }}
    >
      {priority}
    </span>
  )
}

// ─── Skeleton List ────────────────────────────────────
function SkeletonList({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 44, borderRadius: 8 }}
        />
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────
function EmptyState({
  message,
  action,
}: {
  message: string
  action?: { label: string; to: string }
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding:   '32px 16px',
        color:     'var(--muted)',
        fontSize:  12,
      }}
    >
      <div style={{ marginBottom: 8 }}>{message}</div>
      {action && (
        <Link
          to={action.to}
          style={{
            color:    'var(--gold)',
            fontSize: 11,
          }}
        >
          {action.label} →
        </Link>
      )}
    </div>
  )
}
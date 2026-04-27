import { useEffect, useState }    from 'react'
import api, { getErrorMessage }   from '../services/api.ts'
import {
  TrendingUp,
  Users,
  CheckSquare,
  Clock,
  AlertCircle,
}                                 from 'lucide-react'
import type { IProject }          from '../types/index.ts'

// ─── Types ────────────────────────────────────────────
interface StatusCount {
  _id:   string
  count: number
}

interface TeamMember {
  user: {
    _id:    string
    name:   string
    avatar?: string
    email:  string
    role:   string
  }
  totalTasks:          number
  completedTasks:      number
  inProgressTasks:     number
  overdueTasks:        number
  totalLoggedHours:    number
  totalEstimatedHours: number
  completionRate:      number
}

interface WeeklyData {
  week:      number
  completed: number
}

interface DashboardData {
  summary:           { totalProjects: number; totalTasks: number }
  projectsByStatus:  StatusCount[]
  tasksByStatus:     (StatusCount & { totalLogged: number })[]
  weeklyCompletion:  WeeklyData[]
  upcomingDeadlines: {
    _id:     string
    title:   string
    dueDate: string
    project: { title: string; color: string }
  }[]
}

interface ProjectAnalytics extends IProject {
  totalTasks:       number
  doneTasks:        number
  overdueTasks:     number
  totalLoggedHours: number
}

export default function AnalyticsPage() {
  const [dashboard,
         setDashboard]            = useState<DashboardData | null>(null)
  const [projects,
         setProjects]             = useState<ProjectAnalytics[]>([])
  const [team,
         setTeam]                 = useState<TeamMember[]>([])
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'team'>('overview')

  // ── Fetch all analytics ────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)

      try {
        const [dashRes, projRes, teamRes] = await Promise.all([
          api.get<{ status: string; data: DashboardData }>('/analytics/dashboard'),
          api.get<{ status: string; data: { projects: ProjectAnalytics[] } }>('/analytics/projects'),
          api.get<{ status: string; data: { teamPerformance: TeamMember[] } }>('/analytics/team'),
        ])

        setDashboard(dashRes.data.data)
        setProjects(projRes.data.data.projects)
        setTeam(teamRes.data.data.teamPerformance)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) return <AnalyticsSkeleton />

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <AlertCircle size={40} color="var(--border)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted)' }}>{error}</p>
      </div>
    )
  }

  const maxWeekly = Math.max(...(dashboard?.weeklyCompletion.map(w => w.completed) ?? [1]))

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
          Analytics
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
          Performance overview across all your projects
        </p>
      </div>

      {/* ── Summary Cards ─────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap:                 16,
          marginBottom:        32,
        }}
      >
        {[
          {
            label: 'Total Projects',
            value: dashboard?.summary.totalProjects ?? 0,
            icon:  TrendingUp,
            color: 'var(--gold)',
          },
          {
            label: 'Total Tasks',
            value: dashboard?.summary.totalTasks ?? 0,
            icon:  CheckSquare,
            color: 'var(--info)',
          },
          {
            label: 'Completed Tasks',
            value: dashboard?.tasksByStatus.find(t => t._id === 'done')?.count ?? 0,
            icon:  CheckSquare,
            color: 'var(--success)',
          },
          {
            label: 'Hours Logged',
            value: dashboard?.tasksByStatus.reduce((acc, t) => acc + (t.totalLogged ?? 0), 0) ?? 0,
            icon:  Clock,
            color: 'var(--purple)',
          },
          {
            label: 'Team Members',
            value: team.length,
            icon:  Users,
            color: 'var(--warn)',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 14,
              padding:      20,
            }}
          >
            <div
              style={{
                background:   `${color}15`,
                border:       `1px solid ${color}30`,
                borderRadius: 8,
                padding:      7,
                display:      'inline-flex',
                marginBottom: 12,
              }}
            >
              <Icon size={15} color={color} />
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize:   32,
                fontWeight: 600,
                lineHeight: 1,
                color:      'var(--text)',
              }}
            >
              {value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────── */}
      <div
        style={{
          display:      'flex',
          gap:          4,
          marginBottom: 24,
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 10,
          padding:      4,
          width:        'fit-content',
        }}
      >
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Projects'  },
            { id: 'team',     label: 'Team'      },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding:      '7px 20px',
              background:   activeTab === tab.id ? 'var(--gold-dim)' : 'transparent',
              border:       `1px solid ${activeTab === tab.id ? 'var(--gold)' : 'transparent'}`,
              borderRadius: 7,
              color:        activeTab === tab.id ? 'var(--gold)' : 'var(--muted)',
              fontSize:     12,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Weekly Completion Chart */}
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
                marginBottom: 4,
              }}
            >
              Weekly Completion
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 24 }}>
              Tasks completed per week — last 8 weeks
            </p>

            <div
              style={{
                display:    'flex',
                alignItems: 'flex-end',
                gap:        8,
                height:     120,
              }}
            >
              {dashboard?.weeklyCompletion.map((w, i) => (
                <div
                  key={i}
                  style={{
                    flex:          1,
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           4,
                    height:        '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ color: 'var(--gold)', fontSize: 9 }}>
                    {w.completed}
                  </span>
                  <div
                    style={{
                      width:        '100%',
                      height:       `${(w.completed / maxWeekly) * 100}%`,
                      background:   'var(--gold-dim)',
                      borderRadius: '4px 4px 0 0',
                      minHeight:    4,
                      transition:   'background 0.2s ease',
                      border:       '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.4)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'var(--gold-dim)'
                    }}
                  />
                  <span style={{ color: 'var(--muted)', fontSize: 9 }}>
                    W{w.week}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Status Breakdown */}
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
                marginBottom: 4,
              }}
            >
              Task Pipeline
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 24 }}>
              Current task distribution
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(
                [
                  { status: 'todo',        label: 'To Do',       color: 'var(--info)'    },
                  { status: 'in-progress', label: 'In Progress', color: 'var(--gold)'    },
                  { status: 'in-review',   label: 'In Review',   color: 'var(--purple)'  },
                  { status: 'done',        label: 'Done',        color: 'var(--success)' },
                ] as const
              ).map(({ status, label, color }) => {
                const count = dashboard?.tasksByStatus.find(
                  t => t._id === status
                )?.count ?? 0
                const total = dashboard?.summary.totalTasks ?? 1
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={status}>
                    <div
                      style={{
                        display:        'flex',
                        justifyContent: 'space-between',
                        marginBottom:   6,
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                        {label}
                      </span>
                      <span style={{ color, fontSize: 11 }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        background:   'var(--panel)',
                        borderRadius: 4,
                        height:       6,
                        overflow:     'hidden',
                      }}
                    >
                      <div
                        style={{
                          width:        `${pct}%`,
                          height:       '100%',
                          background:   color,
                          borderRadius: 4,
                          transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 14,
              padding:      24,
              gridColumn:   '1 / -1',
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
              Upcoming Deadlines
            </h3>

            {(dashboard?.upcomingDeadlines.length ?? 0) === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                No tasks due in the next 7 days
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dashboard?.upcomingDeadlines.map(task => (
                  <div
                    key={task._id}
                    style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        12,
                      padding:    '10px 14px',
                      background: 'var(--panel)',
                      border:     '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width:        8,
                        height:       8,
                        borderRadius: '50%',
                        background:   task.project.color,
                        flexShrink:   0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color:        'var(--text)',
                          fontSize:     12,
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace:   'nowrap',
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 10 }}>
                        {task.project.title}
                      </div>
                    </div>
                    <div
                      style={{
                        color:     'var(--warn)',
                        fontSize:  11,
                        flexShrink: 0,
                      }}
                    >
                      {new Date(task.dueDate).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Projects Tab ─────────────────────────────── */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
              No project data available
            </p>
          ) : (
            projects.map(project => (
              <div
                key={project._id}
                style={{
                  background:   'var(--surface)',
                  border:       '1px solid var(--border)',
                  borderRadius: 12,
                  padding:      '16px 20px',
                }}
              >
                <div
                  style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    marginBottom:   12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width:        10,
                        height:       10,
                        borderRadius: 2,
                        background:   project.color,
                      }}
                    />
                    <span
                      style={{
                        color:     'var(--text)',
                        fontSize:  13,
                        fontWeight: 500,
                      }}
                    >
                      {project.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { label: 'Tasks',    value: project.totalTasks       },
                      { label: 'Done',     value: project.doneTasks        },
                      { label: 'Overdue',  value: project.overdueTasks     },
                      { label: 'Hrs',      value: project.totalLoggedHours },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            color:      'var(--text)',
                            fontSize:   14,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                          }}
                        >
                          {value}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: 9 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div
                  style={{
                    background:   'var(--panel)',
                    borderRadius: 4,
                    height:       4,
                    overflow:     'hidden',
                  }}
                >
                  <div
                    style={{
                      width:        `${project.progress}%`,
                      height:       '100%',
                      background:   project.color,
                      borderRadius: 4,
                      transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                </div>
                <div
                  style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    marginTop:      4,
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontSize: 10 }}>
                    {project.status}
                  </span>
                  <span style={{ color: project.color, fontSize: 10, fontWeight: 500 }}>
                    {project.progress}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Team Tab ─────────────────────────────────── */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {team.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
              No team data available
            </p>
          ) : (
            team.map((member, i) => {
              const rate  = member.completionRate
              const color = rate >= 80
                ? 'var(--success)'
                : rate >= 60
                ? 'var(--gold)'
                : 'var(--danger)'

              return (
                <div
                  key={member.user._id}
                  style={{
                    background:   'var(--surface)',
                    border:       '1px solid var(--border)',
                    borderRadius: 12,
                    padding:      '16px 20px',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          16,
                  }}
                >
                  {/* Rank */}
                  <span style={{ color: 'var(--muted)', fontSize: 12, width: 20 }}>
                    #{i + 1}
                  </span>

                  {/* Avatar */}
                  <Avatar name={member.user.name} size={36} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>
                      {member.user.name}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div
                        style={{
                          background:   'var(--panel)',
                          borderRadius: 4,
                          height:       4,
                          overflow:     'hidden',
                        }}
                      >
                        <div
                          style={{
                            width:        `${rate}%`,
                            height:       '100%',
                            background:   color,
                            borderRadius: 4,
                            transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    {[
                      { label: 'Rate',    value: `${rate}%`,                 color },
                      { label: 'Done',    value: member.completedTasks,      color: 'var(--text)' },
                      { label: 'Total',   value: member.totalTasks,          color: 'var(--text)' },
                      { label: 'Hrs',     value: member.totalLoggedHours,    color: 'var(--text)' },
                      { label: 'Overdue', value: member.overdueTasks,
                        color: member.overdueTasks > 0 ? 'var(--danger)' : 'var(--muted)' },
                    ].map(({ label, value, color: c }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            color:      c,
                            fontSize:   14,
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                          }}
                        >
                          {value}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: 9 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <div className="skeleton" style={{ height: 32, width: 160, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 280 }} />
      </div>
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap:                 16,
          marginBottom:        32,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      </div>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const hue      = name.charCodeAt(0) * 7 % 360

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
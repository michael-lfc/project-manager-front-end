import { useEffect, useState }          from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProjects }                  from '../hooks/useProjects.ts'
import { useSocket }                    from '../hooks/useSocket.ts'
import { useAuth }                      from '../hooks/useAuth.ts'
import {
  ArrowLeft,
  Users,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  CheckSquare,
  TrendingUp,
  Clock,
  AlertCircle,
  UserMinus,
  Loader2,
}                                       from 'lucide-react'
import type { ProjectStatus, Priority } from '../types/index.ts'

// ─── Config ───────────────────────────────────────────
const statusColors: Record<ProjectStatus, string> = {
  planning:  'var(--info)',
  active:    'var(--success)',
  'on-hold': 'var(--warn)',
  completed: 'var(--muted)',
  archived:  'var(--muted)',
}

const priorityColors: Record<Priority, string> = {
  low:      'var(--success)',
  medium:   'var(--warn)',
  high:     'var(--gold)',
  critical: 'var(--danger)',
}

export default function ProjectDetailPage() {
  const { id }                              = useParams<{ id: string }>()
  const navigate                            = useNavigate()
  const { user }                            = useAuth()
  const {
    activeProject,
    fetchProject,
    deleteProject,
    addMember,
    removeMember,
    loading,
  }                                         = useProjects()
  const { joinProject, leaveProject }       = useSocket()

  const [showDeleteConfirm,
         setShowDeleteConfirm]              = useState(false)
  const [deleting,   setDeleting]           = useState(false)

  const [showAddMember,
         setShowAddMember]                  = useState(false)
  const [memberEmail, setMemberEmail]       = useState('')
  const [addingMember,
         setAddingMember]                   = useState(false)
  const [memberError, setMemberError]       = useState<string | null>(null)
  const [memberSuccess,
         setMemberSuccess]                  = useState<string | null>(null)

  const [removingId,  setRemovingId]        = useState<string | null>(null)

  // ── Fetch project on mount ─────────────────────────
  useEffect(() => {
    if (!id) return
    fetchProject(id)
  }, [id, fetchProject])

  // ── Join / leave socket room ───────────────────────
  useEffect(() => {
    if (!id) return
    joinProject(id)
    return () => leaveProject(id)
  }, [id, joinProject, leaveProject])

  // ── Handle delete ──────────────────────────────────
  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // ── Handle add member ──────────────────────────────
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !memberEmail.trim()) return

    setAddingMember(true)
    setMemberError(null)
    setMemberSuccess(null)

    try {
      await addMember(id, memberEmail.trim().toLowerCase())
      setMemberSuccess(`${memberEmail} added successfully`)
      setMemberEmail('')
      setTimeout(() => setMemberSuccess(null), 3000)
    } catch (err: unknown) {
      setMemberError(
        err instanceof Error ? err.message : 'Failed to add member'
      )
    } finally {
      setAddingMember(false)
    }
  }

  // ── Handle remove member ───────────────────────────
  const handleRemoveMember = async (memberId: string) => {
    if (!id) return
    setRemovingId(memberId)
    try {
      await removeMember(id, memberId)
    } catch {
      // error handled in context
    } finally {
      setRemovingId(null)
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  // ── Loading ────────────────────────────────────────
  if (loading && !activeProject) {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="skeleton" style={{ height: 32, width: 200 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
        </div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────
  if (!activeProject) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--muted)' }}>
        <AlertCircle size={40} color="var(--border)" style={{ margin: '0 auto 16px' }} />
        <p>Project not found</p>
        <Link
          to="/projects"
          style={{ color: 'var(--gold)', fontSize: 12, marginTop: 8, display: 'block' }}
        >
          ← Back to projects
        </Link>
      </div>
    )
  }

  const project       = activeProject
  const statusColor   = statusColors[project.status]
  const priorityColor = priorityColors[project.priority]
  const isOwner       = user?._id === (
    typeof project.owner === 'object'
      ? (project.owner as { _id: string })._id
      : project.owner
  )

  return (
    <div className="fade-in">

      {/* ── Back + Actions ───────────────────────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   24,
        }}
      >
        <button
          onClick={() => navigate('/projects')}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            background: 'transparent',
            border:     'none',
            color:      'var(--muted)',
            fontSize:   12,
            cursor:     'pointer',
            padding:    0,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <ArrowLeft size={14} />
          Back to projects
        </button>

        {isOwner && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/projects/${id}/edit`}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            6,
                padding:        '7px 14px',
                background:     'transparent',
                border:         '1px solid var(--border)',
                borderRadius:   8,
                color:          'var(--muted)',
                fontSize:       11,
                textDecoration: 'none',
                transition:     'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color       = 'var(--gold)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color       = 'var(--muted)'
              }}
            >
              <Edit2 size={12} />
              Edit
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '7px 14px',
                background:   'transparent',
                border:       '1px solid var(--border)',
                borderRadius: 8,
                color:        'var(--muted)',
                fontSize:     11,
                cursor:       'pointer',
                transition:   'all 0.2s ease',
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
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Project Header ───────────────────────────── */}
      <div
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 14,
          padding:      28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-start',
            marginBottom:   20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width:        16,
                height:       16,
                borderRadius: 4,
                background:   project.color,
                flexShrink:   0,
              }}
            />
            <h1
              style={{
                fontFamily:    "'Cormorant Garamond', serif",
                fontSize:      28,
                fontWeight:    600,
                color:         'var(--text)',
                letterSpacing: '-0.01em',
              }}
            >
              {project.title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Badge label={project.status}   color={statusColor}   />
            <Badge label={project.priority} color={priorityColor} />
          </div>
        </div>

        {project.description && (
          <p
            style={{
              color:        'var(--muted)',
              fontSize:     12,
              lineHeight:   1.6,
              marginBottom: 20,
              maxWidth:     600,
            }}
          >
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              marginBottom:   8,
            }}
          >
            <span
              style={{
                color:         'var(--muted)',
                fontSize:      11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Overall Progress
            </span>
            <span style={{ color: project.color, fontSize: 13, fontWeight: 600 }}>
              {project.progress}%
            </span>
          </div>
          <div
            style={{
              background:   'var(--panel)',
              borderRadius: 6,
              height:       8,
              overflow:     'hidden',
            }}
          >
            <div
              style={{
                width:        `${project.progress}%`,
                height:       '100%',
                background:   project.color,
                borderRadius: 6,
                transition:   'width 1s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <MetaItem
            icon={Calendar}
            label="Due Date"
            value={formatDate(project.dueDate)}
            valueColor={project.isOverdue ? 'var(--danger)' : 'var(--text)'}
          />
          <MetaItem
            icon={Users}
            label="Members"
            value={`${project.members.length} member${project.members.length !== 1 ? 's' : ''}`}
          />
          {project.budget && (
            <MetaItem
              icon={TrendingUp}
              label="Budget"
              value={`$${project.budget.toLocaleString()}`}
            />
          )}
          {project.budget && (
            <MetaItem
              icon={Clock}
              label="Spent"
              value={`$${(project.spent ?? 0).toLocaleString()}`}
              valueColor={
                (project.budgetUtilization ?? 0) > 90
                  ? 'var(--danger)'
                  : 'var(--text)'
              }
            />
          )}
        </div>
      </div>

      {/* ── Two Column ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>

        {/* Tasks Section */}
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
              Tasks
            </h3>
            <Link
              to={`/tasks?project=${id}`}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            6,
                padding:        '7px 14px',
                background:     'var(--gold)',
                color:          'var(--bg)',
                borderRadius:   8,
                fontSize:       11,
                fontWeight:     500,
                textDecoration: 'none',
              }}
            >
              <Plus size={12} />
              Open Board
            </Link>
          </div>

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap:                 12,
              marginBottom:        20,
            }}
          >
            {[
              { label: 'To Do',       color: 'var(--info)',    icon: CheckSquare },
              { label: 'In Progress', color: 'var(--gold)',    icon: Clock       },
              { label: 'In Review',   color: 'var(--purple)',  icon: TrendingUp  },
              { label: 'Done',        color: 'var(--success)', icon: CheckSquare },
            ].map(({ label, color, icon: Icon }) => (
              <div
                key={label}
                style={{
                  background:   'var(--panel)',
                  border:       '1px solid var(--border)',
                  borderRadius: 10,
                  padding:      '12px 16px',
                  textAlign:    'center',
                }}
              >
                <Icon size={16} color={color} style={{ margin: '0 auto 8px' }} />
                <div
                  style={{
                    color:      'var(--text)',
                    fontSize:   18,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                  }}
                >
                  —
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <Link
            to={`/tasks?project=${id}`}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
              padding:        '12px',
              background:     'var(--panel)',
              border:         '1px solid var(--border)',
              borderRadius:   8,
              color:          'var(--muted)',
              fontSize:       12,
              textDecoration: 'none',
              transition:     'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gold)'
              e.currentTarget.style.color       = 'var(--gold)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color       = 'var(--muted)'
            }}
          >
            <CheckSquare size={13} />
            View full Kanban board
          </Link>
        </div>

        {/* Members Section */}
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
              marginBottom:   16,
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize:   18,
                color:      'var(--text)',
              }}
            >
              Members
            </h3>

            {isOwner && (
              <button
                onClick={() => setShowAddMember(p => !p)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          4,
                  padding:      '5px 10px',
                  background:   showAddMember ? 'var(--gold-dim)' : 'transparent',
                  border:       `1px solid ${showAddMember ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 6,
                  color:        showAddMember ? 'var(--gold)' : 'var(--muted)',
                  fontSize:     11,
                  cursor:       'pointer',
                  transition:   'all 0.2s ease',
                }}
              >
                <Plus size={11} />
                Add
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {showAddMember && isOwner && (
            <form
              onSubmit={handleAddMember}
              style={{ marginBottom: 16 }}
              className="fade-in"
            >
              {memberError && (
                <div
                  style={{
                    background:   'rgba(201,108,108,0.1)',
                    border:       '1px solid rgba(201,108,108,0.3)',
                    borderRadius: 6,
                    padding:      '8px 10px',
                    marginBottom: 8,
                    color:        'var(--danger)',
                    fontSize:     11,
                  }}
                >
                  ⚠ {memberError}
                </div>
              )}

              {memberSuccess && (
                <div
                  style={{
                    background:   'rgba(108,201,151,0.1)',
                    border:       '1px solid rgba(108,201,151,0.3)',
                    borderRadius: 6,
                    padding:      '8px 10px',
                    marginBottom: 8,
                    color:        'var(--success)',
                    fontSize:     11,
                  }}
                  className="fade-in"
                >
                  ✓ {memberSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="member@email.com"
                  style={{ flex: 1, height: 34, fontSize: 11 }}
                  required
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  style={{
                    padding:      '0 12px',
                    height:       34,
                    background:   'var(--gold)',
                    border:       'none',
                    borderRadius: 6,
                    color:        'var(--bg)',
                    fontSize:     11,
                    fontWeight:   500,
                    cursor:       addingMember ? 'not-allowed' : 'pointer',
                    opacity:      addingMember ? 0.7 : 1,
                    display:      'flex',
                    alignItems:   'center',
                    gap:          4,
                  }}
                >
                  {addingMember
                    ? <Loader2 size={11} className="spin" />
                    : 'Add'
                  }
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.members.map(member => {
              const m          = member as unknown as {
                _id: string; name: string; avatar?: string; role: string
              }
              const isProjectOwner = m._id === (
                typeof project.owner === 'object'
                  ? (project.owner as { _id: string })._id
                  : project.owner
              )

              return (
                <div
                  key={m._id}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        10,
                    padding:    '8px 10px',
                    background: 'var(--panel)',
                    borderRadius: 8,
                    border:     '1px solid var(--border)',
                  }}
                >
                  <Avatar name={m.name} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color:        'var(--text)',
                        fontSize:     12,
                        fontWeight:   500,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                      }}
                    >
                      {m.name}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 10 }}>
                      {m.role}
                    </div>
                  </div>

                  {isProjectOwner && (
                    <span
                      style={{
                        background:    'var(--gold-dim)',
                        color:         'var(--gold)',
                        borderRadius:  4,
                        fontSize:      9,
                        fontWeight:    500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding:       '2px 6px',
                        flexShrink:    0,
                      }}
                    >
                      Owner
                    </span>
                  )}

                  {/* Remove button — owner only, can't remove self */}
                  {isOwner && !isProjectOwner && m._id !== user?._id && (
                    <button
                      onClick={() => handleRemoveMember(m._id)}
                      disabled={removingId === m._id}
                      title="Remove member"
                      style={{
                        background:   'transparent',
                        border:       '1px solid var(--border)',
                        borderRadius: 4,
                        padding:      '3px 4px',
                        cursor:       'pointer',
                        display:      'flex',
                        color:        'var(--muted)',
                        transition:   'all 0.15s ease',
                        flexShrink:   0,
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
                      {removingId === m._id
                        ? <Loader2 size={11} className="spin" />
                        : <UserMinus size={11} />
                      }
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  color:         'var(--muted)',
                  fontSize:      10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom:  8,
                }}
              >
                Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--gold-dim)',
                      color:      'var(--gold)',
                      borderRadius: 4,
                      padding:    '3px 10px',
                      fontSize:   11,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Modal ─────────────────────── */}
      {showDeleteConfirm && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            background:     'rgba(0,0,0,0.7)',
            zIndex:         70,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        24,
          }}
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 16,
              padding:      32,
              width:        '100%',
              maxWidth:     420,
              boxShadow:    '0 12px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
            className="slide-up"
          >
            <h3
              style={{
                fontFamily:   "'Cormorant Garamond', serif",
                fontSize:     22,
                color:        'var(--text)',
                marginBottom: 8,
              }}
            >
              Delete Project
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 24 }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: 'var(--text)' }}>{project.title}</strong>?
              This will permanently delete all tasks and cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{
                  padding:      '9px 20px',
                  background:   'transparent',
                  border:       '1px solid var(--border)',
                  borderRadius: 8,
                  color:        'var(--muted)',
                  fontSize:     12,
                  cursor:       'pointer',
                  transition:   'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--text)'
                  e.currentTarget.style.color       = 'var(--text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color       = 'var(--muted)'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            8,
                  padding:        '9px 20px',
                  background:     'var(--danger)',
                  border:         'none',
                  borderRadius:   8,
                  color:          '#fff',
                  fontSize:       12,
                  fontWeight:     500,
                  cursor:         deleting ? 'not-allowed' : 'pointer',
                  opacity:        deleting ? 0.7 : 1,
                  transition:     'opacity 0.2s',
                }}
              >
                {deleting
                  ? <><Loader2 size={13} className="spin" /> Deleting…</>
                  : 'Delete Project'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        background:    `${color}15`,
        color,
        borderRadius:  4,
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding:       '3px 10px',
        whiteSpace:    'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// ─── Meta Item ────────────────────────────────────────
function MetaItem({
  icon: Icon, label, value, valueColor = 'var(--text)',
}: {
  icon:        React.ElementType
  label:       string
  value:       string
  valueColor?: string
}) {
  return (
    <div>
      <div
        style={{
          color:         'var(--muted)',
          fontSize:      10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom:  4,
          display:       'flex',
          alignItems:    'center',
          gap:           4,
        }}
      >
        <Icon size={11} />
        {label}
      </div>
      <div style={{ color: valueColor, fontSize: 13, fontWeight: 500 }}>
        {value}
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
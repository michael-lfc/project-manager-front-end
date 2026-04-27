import { useEffect, useState, useCallback } from 'react'
import { useSearchParams }                   from 'react-router-dom'
// import { useAuth }                           from '../hooks/useAuth.ts'
import { useSocket }                         from '../hooks/useSocket.ts'
import api, { getErrorMessage }              from '../services/api.ts'
import CommentList                           from '../components/tasks/CommentList.tsx'
import {
  Plus,
  Loader2,
  AlertCircle,
  X,
  Clock,
  User,
  Calendar,
}                                            from 'lucide-react'
import type {
  ITask,
  TaskStatus,
  KanbanGrouped,
  Priority,
}                                            from '../types/index.ts'

// ─── Kanban Column Config ─────────────────────────────
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: 'var(--info)'    },
  { id: 'in-progress', label: 'In Progress', color: 'var(--gold)'    },
  { id: 'in-review',   label: 'In Review',   color: 'var(--purple)'  },
  { id: 'done',        label: 'Done',        color: 'var(--success)' },
]

const priorityColors: Record<Priority, string> = {
  low:      'var(--success)',
  medium:   'var(--warn)',
  high:     'var(--gold)',
  critical: 'var(--danger)',
}

// ─── Color Helpers ────────────────────────────────────
const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    'todo':        'var(--info)',
    'in-progress': 'var(--gold)',
    'in-review':   'var(--purple)',
    'done':        'var(--success)',
  }
  return map[status] ?? 'var(--muted)'
}

const priorityColor = (priority: string): string => {
  const map: Record<string, string> = {
    low:      'var(--success)',
    medium:   'var(--warn)',
    high:     'var(--gold)',
    critical: 'var(--danger)',
  }
  return map[priority] ?? 'var(--muted)'
}

export default function TasksPage() {
  // const { user }                            = useAuth()
  const { socket }                          = useSocket()
  const [searchParams]                      = useSearchParams()
  const projectId                           = searchParams.get('project')

  const [grouped, setGrouped]               = useState<KanbanGrouped>({
    'todo':        [],
    'in-progress': [],
    'in-review':   [],
    'done':        [],
  })
  const [loading,       setLoading]         = useState(false)
  const [error,         setError]           = useState<string | null>(null)
  const [dragging,      setDragging]        = useState<string | null>(null)
  const [showTaskForm,  setShowTaskForm]    = useState(false)
  const [selectedTask,  setSelectedTask]    = useState<ITask | null>(null)

  // ── Fetch tasks ────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<{
        status: string
        data:   { tasks: ITask[]; grouped: KanbanGrouped }
      }>(`/tasks/project/${projectId}`)

      setGrouped(response.data.data.grouped)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ── Refresh selected task after comment add/delete ─
  const handleTaskUpdate = useCallback(async () => {
    if (!projectId) return

    try {
      // Fetch fresh data from server directly
      const response = await api.get<{
        status: string
        data: { tasks: ITask[]; grouped: KanbanGrouped }
      }>(`/tasks/project/${projectId}`)

      const updatedGrouped = response.data.data.grouped
      setGrouped(updatedGrouped)

      // Find the updated version of the selected task from the fresh data
      const allTasks = Object.values(updatedGrouped).flat()
      const freshTask = allTasks.find(t => t._id === selectedTask?._id)
      
      if (freshTask) {
        setSelectedTask(freshTask)
      }
    } catch (err) {
      console.error('Failed to refresh task:', err)
    }
  }, [projectId, selectedTask])

  // ── Socket — real-time task updates ───────────────
  useEffect(() => {
    if (!socket) return

    const handleTaskCreated = (task: ITask) => {
      setGrouped(prev => ({
        ...prev,
        [task.status]: [...prev[task.status as TaskStatus], task],
      }))
    }

    const handleTaskUpdated = (task: ITask) => {
      setGrouped(prev => {
        const next = { ...prev }
        COLUMNS.forEach(col => {
          next[col.id] = next[col.id].filter(t => t._id !== task._id)
        })
        next[task.status as TaskStatus] = [
          ...next[task.status as TaskStatus],
          task,
        ].sort((a, b) => a.position - b.position)
        return next
      })

      // Update selected task if it's the one being updated
      setSelectedTask(prev =>
        prev?._id === task._id ? task : prev
      )
    }

    socket.on('task:created', handleTaskCreated)
    socket.on('task:updated', handleTaskUpdated)

    return () => {
      socket.off('task:created', handleTaskCreated)
      socket.off('task:updated', handleTaskUpdated)
    }
  }, [socket])

  // ── Drag and Drop ──────────────────────────────────
  const handleDragStart = (taskId: string) => {
    setDragging(taskId)
  }

  const handleDrop = async (newStatus: TaskStatus) => {
    if (!dragging || !projectId) return

    const taskId = dragging
    setDragging(null)

    let task: ITask | undefined
    COLUMNS.forEach(col => {
      const found = grouped[col.id].find(t => t._id === taskId)
      if (found) task = found
    })

    if (!task || task.status === newStatus) return

    const newPosition = grouped[newStatus].length

    // Optimistic update
    setGrouped(prev => {
      const next      = { ...prev }
      const oldStatus = task!.status as TaskStatus
      next[oldStatus] = next[oldStatus].filter(t => t._id !== taskId)
      next[newStatus] = [...next[newStatus], { ...task!, status: newStatus }]
      return next
    })

    try {
      await api.patch(`/tasks/${taskId}/reorder`, {
        projectId,
        status:   newStatus,
        position: newPosition,
      })
    } catch {
      fetchTasks()
    }
  }

  // ── Open task detail ───────────────────────────────
  const handleTaskClick = (task: ITask) => {
    setSelectedTask(task)
  }

  // ── No project selected ────────────────────────────
  if (!projectId) {
    return (
      <div
        className="fade-in"
        style={{ textAlign: 'center', padding: '80px 24px' }}
      >
        <AlertCircle
          size={40}
          color="var(--border)"
          style={{ margin: '0 auto 16px' }}
        />
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
          No project selected
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 11 }}>
          Open a project and click "Open Board" to view its tasks.
        </p>
      </div>
    )
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
            Kanban Board
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
            {Object.values(grouped).flat().length} tasks across{' '}
            {COLUMNS.length} columns · click any card to view details
          </p>
        </div>

        <button
          onClick={() => setShowTaskForm(true)}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            8,
            padding:        '10px 20px',
            background:     'var(--gold)',
            color:          'var(--bg)',
            border:         'none',
            borderRadius:   8,
            fontSize:       12,
            fontWeight:     500,
            cursor:         'pointer',
            transition:     'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      {/* ── Error ────────────────────────────────────── */}
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

      {/* ── Kanban Board ─────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 16,
          }}
        >
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className="skeleton"
              style={{ height: 400, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 16,
            overflowX:           'auto',
          }}
        >
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={grouped[col.id]}
              dragging={dragging}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      )}

      {/* ── Task Form Modal ───────────────────────────── */}
      {showTaskForm && (
        <TaskFormModal
          projectId={projectId}
          onClose={() => setShowTaskForm(false)}
          onCreated={fetchTasks}
        />
      )}

      {/* ── Task Detail Modal ─────────────────────────── */}
      {selectedTask && (
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
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 16,
              padding:      32,
              width:        '100%',
              maxWidth:     600,
              maxHeight:    '85vh',
              overflowY:    'auto',
              boxShadow:    '0 12px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
            className="slide-up"
          >

            {/* ── Modal Header ─────────────────────── */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'flex-start',
                marginBottom:   20,
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <div className="gold-line" />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize:   22,
                    color:      'var(--text)',
                    lineHeight: 1.3,
                  }}
                >
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background:   'transparent',
                  border:       '1px solid var(--border)',
                  borderRadius: 6,
                  padding:      '5px 6px',
                  cursor:       'pointer',
                  display:      'flex',
                  color:        'var(--muted)',
                  flexShrink:   0,
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
                <X size={14} />
              </button>
            </div>

            {/* ── Status + Priority Badges ──────────── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span
                style={{
                  background:    `${statusColor(selectedTask.status)}15`,
                  color:         statusColor(selectedTask.status),
                  borderRadius:  4,
                  fontSize:      10,
                  fontWeight:    500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding:       '3px 10px',
                }}
              >
                {selectedTask.status.replace('-', ' ')}
              </span>

              <span
                style={{
                  background:    `${priorityColor(selectedTask.priority)}20`,
                  color:         priorityColor(selectedTask.priority),
                  borderRadius:  4,
                  fontSize:      10,
                  fontWeight:    500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding:       '3px 10px',
                }}
              >
                {selectedTask.priority}
              </span>

              {selectedTask.isOverdue && (
                <span
                  style={{
                    background:    'rgba(201,108,108,0.15)',
                    color:         'var(--danger)',
                    borderRadius:  4,
                    fontSize:      10,
                    fontWeight:    500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding:       '3px 10px',
                  }}
                >
                  Overdue
                </span>
              )}
            </div>

            {/* ── Description ──────────────────────── */}
            {selectedTask.description && (
              <div
                style={{
                  padding:      '12px 16px',
                  background:   'var(--panel)',
                  border:       '1px solid var(--border)',
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    color:      'var(--muted)',
                    fontSize:   12,
                    lineHeight: 1.6,
                  }}
                >
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* ── Meta Grid ────────────────────────── */}
            <div
              style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 12,
                marginBottom:        24,
                padding:             '14px 16px',
                background:          'var(--panel)',
                border:              '1px solid var(--border)',
                borderRadius:        8,
              }}
            >
              {/* Assignee */}
              {selectedTask.assignee && (
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
                    <User size={10} />
                    Assignee
                  </div>
                  <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>
                    {selectedTask.assignee.name}
                  </div>
                </div>
              )}

              {/* Reporter */}
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
                  <User size={10} />
                  Reporter
                </div>
                <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>
                  {selectedTask.reporter?.name ?? '—'}
                </div>
              </div>

              {/* Due Date */}
              {selectedTask.dueDate && (
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
                    <Calendar size={10} />
                    Due Date
                  </div>
                  <div
                    style={{
                      color:    selectedTask.isOverdue
                        ? 'var(--danger)'
                        : 'var(--text)',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {new Date(selectedTask.dueDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              )}

              {/* Hours */}
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
                  <Clock size={10} />
                  Hours
                </div>
                <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>
                  {selectedTask.loggedHours}h logged
                  {selectedTask.estimatedHours
                    ? ` / ${selectedTask.estimatedHours}h est.`
                    : ''
                  }
                </div>
              </div>
            </div>

            {/* ── Tags ─────────────────────────────── */}
            {selectedTask.tags.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedTask.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background:   'var(--gold-dim)',
                        color:        'var(--gold)',
                        borderRadius: 4,
                        padding:      '3px 10px',
                        fontSize:     11,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Divider ──────────────────────────── */}
            <div
              style={{
                height:       1,
                background:   'var(--border)',
                marginBottom: 24,
              }}
            />

            {/* ── Comments ─────────────────────────── */}
            <CommentList
              taskId={selectedTask._id}
              comments={selectedTask.comments}
              onUpdate={handleTaskUpdate}
            />

          </div>
        </div>
      )}
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────
function KanbanColumn({
  column,
  tasks,
  dragging,
  onDragStart,
  onDrop,
  onTaskClick,
}: {
  column:      { id: TaskStatus; label: string; color: string }
  tasks:       ITask[]
  dragging:    string | null
  onDragStart: (id: string)         => void
  onDrop:      (status: TaskStatus) => void
  onTaskClick: (task: ITask)        => void
}) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div
      style={{
        background:    isOver ? 'var(--gold-glow)' : 'var(--surface)',
        border:        `1px solid ${isOver ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius:  12,
        padding:       16,
        minHeight:     400,
        display:       'flex',
        flexDirection: 'column',
        transition:    'all 0.2s ease',
      }}
      onDragOver={e => { e.preventDefault(); setIsOver(true) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(column.id) }}
    >
      {/* Column Header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   14,
          flexShrink:     0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   column.color,
              flexShrink:   0,
            }}
          />
          <span
            style={{
              fontSize:      11,
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         'var(--muted)',
            }}
          >
            {column.label}
          </span>
        </div>
        <span
          style={{
            background:   'var(--panel)',
            color:        'var(--muted)',
            borderRadius: 20,
            padding:      '1px 8px',
            fontSize:     10,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            isDragging={dragging === task._id}
            onDragStart={() => onDragStart(task._id)}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div
            style={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          'var(--muted)',
              fontSize:       11,
              opacity:        0.5,
              minHeight:      80,
            }}
          >
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────
function TaskCard({
  task,
  isDragging,
  onDragStart,
  onClick,
}: {
  task:        ITask
  isDragging:  boolean
  onDragStart: () => void
  onClick:     () => void
}) {
  const color = priorityColors[task.priority]

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
    })
  }

  return (
    <div
      draggable
      onDragStart={e => {
        e.stopPropagation()
        onDragStart()
      }}
      onClick={onClick}
      style={{
        background:   'var(--panel)',
        border:       `1px solid ${isDragging ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 8,
        padding:      12,
        cursor:       'pointer',
        opacity:      isDragging ? 0.5 : 1,
        transition:   'border-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
          ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.transform  = 'translateY(0)'
      }}
    >
      {/* Priority badge */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            background:    `${color}20`,
            color,
            borderRadius:  4,
            fontSize:      9,
            fontWeight:    500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding:       '2px 7px',
          }}
        >
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <p
        style={{
          color:        'var(--text)',
          fontSize:     12,
          lineHeight:   1.4,
          marginBottom: 10,
        }}
      >
        {task.title}
      </p>

      {/* Footer */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
        }}
      >
        {/* Tags */}
        {task.tags.length > 0 && (
          <span
            style={{
              background:   'var(--gold-dim)',
              color:        'var(--gold)',
              borderRadius: 4,
              padding:      '2px 8px',
              fontSize:     10,
            }}
          >
            {task.tags[0]}
            {task.tags.length > 1 && ` +${task.tags.length - 1}`}
          </span>
        )}

        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            marginLeft: 'auto',
          }}
        >
          {/* Due date */}
          {task.dueDate && (
            <span
              style={{
                color:    task.isOverdue ? 'var(--danger)' : 'var(--muted)',
                fontSize: 9,
              }}
            >
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Assignee avatar */}
          {task.assignee && (
            <Avatar name={task.assignee.name} size={20} />
          )}
        </div>
      </div>

      {/* Comment count */}
      {(task.commentCount ?? task.comments?.length ?? 0) > 0 && (
        <div
          style={{
            marginTop:  8,
            color:      'var(--muted)',
            fontSize:   10,
            display:    'flex',
            alignItems: 'center',
            gap:        4,
          }}
        >
          💬 {task.commentCount ?? task.comments?.length}
        </div>
      )}
    </div>
  )
}

// ─── Task Form Modal ──────────────────────────────────
function TaskFormModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: string
  onClose:   () => void
  onCreated: () => void
}) {
  const [form, setForm]             = useState({
    title:          '',
    description:    '',
    priority:       'medium' as Priority,
    status:         'todo'   as TaskStatus,
    dueDate:        '',
    estimatedHours: '',
    assignee:       '',  // 🔥 NEW
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      await api.post('/tasks', {
        title:          form.title.trim(),
        description:    form.description   || undefined,
        priority:       form.priority,
        status:         form.status,
        project:        projectId,
        dueDate:        form.dueDate       || undefined,
        estimatedHours: form.estimatedHours
          ? parseFloat(form.estimatedHours)
          : undefined,
        assignee:       form.assignee      || undefined,  // 🔥 NEW
      })

      onCreated()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 16,
          padding:      32,
          width:        '100%',
          maxWidth:     480,
          boxShadow:    '0 12px 40px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
        className="slide-up"
      >
        <div className="gold-line" />
        <h3
          style={{
            fontFamily:   "'Cormorant Garamond', serif",
            fontSize:     22,
            color:        'var(--text)',
            marginBottom: 24,
          }}
        >
          Add Task
        </h3>

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
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* Title */}
          <div>
            <label>Task Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Build auth middleware"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description..."
              rows={3}
              style={{
                background:   'var(--panel)',
                border:       '1px solid var(--border)',
                color:        'var(--text)',
                borderRadius: 10,
                padding:      '10px 14px',
                fontSize:     12,
                width:        '100%',
                outline:      'none',
                resize:       'vertical',
                fontFamily:   "'DM Mono', monospace",
              }}
            />
          </div>

          {/* Priority + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* 🔥 NEW: Assignee + Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Assignee</label>
              <select name="assignee" value={form.assignee} onChange={handleChange}>
                <option value="">Unassigned</option>
                <option value="69e293a44b2ceba79f754d17">Michael</option>
                <option value="69e2940c4b2ceba79f754d19">Dorcas</option>
              </select>
            </div>
            <div>
              <label>Estimated Hours</label>
              <input
                type="number"
                name="estimatedHours"
                value={form.estimatedHours}
                onChange={handleChange}
                placeholder="e.g. 4"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display:        'flex',
              gap:            12,
              justifyContent: 'flex-end',
              marginTop:      8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={submitting || !form.title.trim()}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            8,
                padding:        '9px 20px',
                background:     'var(--gold)',
                color:          'var(--bg)',
                border:         'none',
                borderRadius:   8,
                fontSize:       12,
                fontWeight:     500,
                cursor:         submitting ? 'not-allowed' : 'pointer',
                opacity:        submitting ? 0.7 : 1,
                transition:     'opacity 0.2s',
              }}
            >
              {submitting
                ? <><Loader2 size={12} className="spin" /> Creating…</>
                : 'Create Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hue = name.charCodeAt(0) * 7 % 360

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


import { useState }             from 'react'
import { useNavigate }          from 'react-router-dom'
import { useProjects }          from '../hooks/useProjects.ts'
import { ArrowLeft, Loader2 }   from 'lucide-react'

const COLOR_OPTIONS = [
  '#c9a84c', '#6c9ec9', '#6cc997',
  '#c984c0', '#c96c6c', '#c9a46c',
]

export default function NewProjectPage() {
  const navigate                      = useNavigate()
  const { createProject, loading,
          error, clearError }         = useProjects()

  const [form, setForm]               = useState({
    title:       '',
    description: '',
    priority:    'medium',
    status:      'planning',
    color:       '#c9a84c',
    dueDate:     '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    try {
      const project = await createProject({
        title:       form.title.trim(),
        description: form.description || undefined,
        priority:    form.priority as 'low' | 'medium' | 'high' | 'critical',
        status:      form.status   as 'planning' | 'active' | 'on-hold' | 'completed' | 'archived',
        color:       form.color,
        dueDate:     form.dueDate  || undefined,
      })
      navigate(`/projects/${project._id}`)
    } catch {
      // error set in context
    }
  }

  return (
    <div className="fade-in">

      {/* ── Back ─────────────────────────────────────── */}
      <button
        onClick={() => navigate('/projects')}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          background:   'transparent',
          border:       'none',
          color:        'var(--muted)',
          fontSize:     12,
          cursor:       'pointer',
          padding:      0,
          marginBottom: 24,
          transition:   'color 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <ArrowLeft size={14} />
        Back to projects
      </button>

      {/* ── Header ───────────────────────────────────── */}
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
          New Project
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
          Set up your project details below
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────── */}
      <div
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 14,
          padding:      32,
          maxWidth:     600,
        }}
      >
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
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
        >

          {/* Title */}
          <div>
            <label>Project Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. TalentFlow LMS"
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
              placeholder="What is this project about?"
              rows={4}
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
                transition:   'border-color 0.2s ease',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onBlur={e  => e.currentTarget.style.borderColor = 'var(--border)'}
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
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
              </select>
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

          {/* Color */}
          <div>
            <label>Project Color</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, color }))}
                  style={{
                    width:        28,
                    height:       28,
                    borderRadius: '50%',
                    background:   color,
                    border:       form.color === color
                      ? '3px solid var(--text)'
                      : '3px solid transparent',
                    cursor:       'pointer',
                    transition:   'border 0.15s ease',
                    flexShrink:   0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              style={{
                padding:      '10px 20px',
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
              disabled={loading || !form.title.trim()}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            8,
                padding:        '10px 24px',
                background:     'var(--gold)',
                color:          'var(--bg)',
                border:         'none',
                borderRadius:   8,
                fontSize:       12,
                fontWeight:     500,
                cursor:         loading ? 'not-allowed' : 'pointer',
                opacity:        loading ? 0.7 : 1,
                transition:     'opacity 0.2s',
              }}
            >
              {loading
                ? <><Loader2 size={13} className="spin" /> Creating…</>
                : 'Create Project'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
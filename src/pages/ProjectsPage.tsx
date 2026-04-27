import { useEffect, useState }        from 'react'
import { Link, useSearchParams }       from 'react-router-dom'
import { useProjects }                 from '../hooks/useProjects.ts'
import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  Users,
  Calendar,
  ChevronRight,
}                                      from 'lucide-react'
import type {
  IProject,
  ProjectStatus,
  Priority,
}                                      from '../types/index.ts'

// ─── Status + Priority Config ─────────────────────────
const STATUS_OPTIONS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'planning',  label: 'Planning'  },
  { value: 'active',    label: 'Active'    },
  { value: 'on-hold',   label: 'On Hold'   },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived'  },
]

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

export default function ProjectsPage() {
  const { projects, loading, fetchProjects } = useProjects()
  const [searchParams, setSearchParams]      = useSearchParams()

  const [search,       setSearch]      = useState(searchParams.get('search') ?? '')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [sortBy,       setSortBy]      = useState('-createdAt')
  const [showFilters,  setShowFilters]  = useState(false)

  // ── Fetch on mount + search param ─────────────────
  useEffect(() => {
    const params: Record<string, string> = { sort: sortBy }
    if (search.trim()) params.search = search.trim()
    fetchProjects(params)
  }, [sortBy, search, fetchProjects])

  // ── Read search from URL (from Header search) ──────
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearch(urlSearch)
      fetchProjects({ search: urlSearch, sort: sortBy })
      setSearchParams({})
    }
  }, [searchParams])

  // ── Handle search submit ───────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params: Record<string, string> = { sort: sortBy }
    if (search.trim()) params.search = search.trim()
    fetchProjects(params)
  }

  // ── Client-side status filter ──────────────────────
  const filtered = statusFilter === 'all'
    ? projects
    : projects.filter(p => p.status === statusFilter)

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
            Projects
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>
            {projects.length} projects · {projects.filter(p => p.status === 'active').length} active
          </p>
        </div>

        <Link
          to="/projects/new"
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           8,
            padding:       '10px 20px',
            background:    'var(--gold)',
            color:         'var(--bg)',
            borderRadius:  8,
            fontSize:      12,
            fontWeight:    500,
            textDecoration: 'none',
            transition:    'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={14} />
          New Project
        </Link>
      </div>

      {/* ── Search + Filters ─────────────────────────── */}
      <div
        style={{
          display:      'flex',
          gap:          12,
          marginBottom: 24,
          flexWrap:     'wrap',
        }}
      >
        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, minWidth: 200, position: 'relative' }}
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
            style={{ paddingLeft: 36, height: 38 }}
          />
        </form>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ width: 160, height: 38 }}
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-progress">Most progress</option>
          <option value="dueDate">Due date</option>
          <option value="title">Name A-Z</option>
        </select>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(prev => !prev)}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            padding:      '0 16px',
            height:       38,
            background:   showFilters ? 'var(--gold-dim)' : 'transparent',
            border:       `1px solid ${showFilters ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 8,
            color:        showFilters ? 'var(--gold)' : 'var(--muted)',
            fontSize:     12,
            cursor:       'pointer',
            transition:   'all 0.2s ease',
          }}
        >
          <Filter size={13} />
          Filter
        </button>
      </div>

      {/* ── Status Filter Pills ───────────────────────── */}
      {showFilters && (
        <div
          style={{
            display:      'flex',
            gap:          8,
            marginBottom: 24,
            flexWrap:     'wrap',
          }}
          className="fade-in"
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value as ProjectStatus | 'all')}
              style={{
                padding:      '5px 14px',
                borderRadius: 20,
                border:       `1px solid ${statusFilter === value ? 'var(--gold)' : 'var(--border)'}`,
                background:   statusFilter === value ? 'var(--gold-dim)' : 'transparent',
                color:        statusFilter === value ? 'var(--gold)'    : 'var(--muted)',
                fontSize:     11,
                cursor:       'pointer',
                transition:   'all 0.2s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Project Grid ─────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap:                 20,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 220, borderRadius: 14 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign:  'center',
            padding:    '80px 24px',
            color:      'var(--muted)',
          }}
        >
          <FolderKanban
            size={40}
            color="var(--border)"
            style={{ margin: '0 auto 16px' }}
          />
          <p style={{ marginBottom: 8 }}>
            {statusFilter !== 'all'
              ? `No ${statusFilter} projects found`
              : 'No projects found'
            }
          </p>
          <Link
            to="/projects/new"
            style={{ color: 'var(--gold)', fontSize: 12 }}
          >
            Create your first project →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap:                 20,
          }}
        >
          {filtered.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────
function ProjectCard({ project }: { project: IProject }) {
  const statusColor   = statusColors[project.status]
  const priorityColor = priorityColors[project.priority]

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-GB', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
    })
  }

  return (
    <Link
      to={`/projects/${project._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 14,
          padding:      24,
          cursor:       'pointer',
          transition:   'border-color 0.2s ease, transform 0.2s ease',
          height:       '100%',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--border-hover)'
          el.style.transform   = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--border)'
          el.style.transform   = 'translateY(0)'
        }}
      >
        {/* ── Card Header ──────────────────────────── */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-start',
            marginBottom:   16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width:        12,
                height:       12,
                borderRadius: 3,
                background:   project.color,
                flexShrink:   0,
              }}
            />
            <h3
              style={{
                fontFamily:   "'Cormorant Garamond', serif",
                fontSize:     16,
                fontWeight:   500,
                color:        'var(--text)',
                lineHeight:   1.3,
              }}
            >
              {project.title}
            </h3>
          </div>

          {/* Status badge */}
          <span
            style={{
              background:    `${statusColor}15`,
              color:         statusColor,
              borderRadius:  4,
              fontSize:      10,
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding:       '2px 8px',
              whiteSpace:    'nowrap',
              flexShrink:    0,
            }}
          >
            {project.status}
          </span>
        </div>

        {/* ── Description ──────────────────────────── */}
        {project.description && (
          <p
            style={{
              color:        'var(--muted)',
              fontSize:     11,
              lineHeight:   1.5,
              marginBottom: 20,
              display:      '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:     'hidden',
            }}
          >
            {project.description}
          </p>
        )}

        {/* ── Progress ─────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              marginBottom:   6,
            }}
          >
            <span
              style={{
                color:         'var(--muted)',
                fontSize:      10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Progress
            </span>
            <span style={{ color: project.color, fontSize: 11, fontWeight: 500 }}>
              {project.progress}%
            </span>
          </div>
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
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Members */}
            <span
              style={{
                color:      'var(--muted)',
                fontSize:   10,
                display:    'flex',
                alignItems: 'center',
                gap:        4,
              }}
            >
              <Users size={11} />
              {project.members.length}
            </span>

            {/* Due date */}
            {project.dueDate && (
              <span
                style={{
                  color:      project.isOverdue ? 'var(--danger)' : 'var(--muted)',
                  fontSize:   10,
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                }}
              >
                <Calendar size={11} />
                {formatDate(project.dueDate)}
              </span>
            )}
          </div>

          {/* Priority + arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background:    `${priorityColor}20`,
                color:         priorityColor,
                borderRadius:  4,
                fontSize:      10,
                fontWeight:    500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding:       '2px 8px',
              }}
            >
              {project.priority}
            </span>
            <ChevronRight size={13} color="var(--muted)" />
          </div>
        </div>
      </div>
    </Link>
  )
}
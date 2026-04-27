import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.ts'
import api, { getErrorMessage } from '../../services/api.ts'
import { Loader2, Trash2, Send } from 'lucide-react'
import type { IComment } from '../../types/index.ts'

interface CommentListProps {
  taskId: string
  comments: IComment[]
  onUpdate: () => void
}

type SafeAuthor = {
  _id?: string
  name?: string
  avatar?: string
}

export default function CommentList({
  taskId,
  comments,
  onUpdate,
}: CommentListProps) {
  const { user } = useAuth()

  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [optimisticComments, setOptimisticComments] = useState<IComment[]>([])

  // Merge optimistic comments with real comments
  const allComments = [...comments, ...optimisticComments]

  // ── Add Comment ─────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return

    setSubmitting(true)
    setError(null)

    // 🔥 OPTIMISTIC UPDATE: Add comment immediately
    const tempComment = {
      _id: `temp-${Date.now()}`,
      author: {
        _id: user?._id || '',
        name: user?.name || 'You',
        avatar: user?.avatar || '',
      },
      body: body.trim(),
      createdAt: new Date().toISOString(),
    } as IComment  // ← Type assertion here

    setOptimisticComments(prev => [...prev, tempComment])
    setBody('')

    try {
      await api.post(`/tasks/${taskId}/comments`, {
        body: body.trim(),
      })

      // Remove optimistic comment and refresh from server
      setOptimisticComments([])
      onUpdate()
    } catch (err) {
      // Remove the optimistic comment on error
      setOptimisticComments(prev => prev.filter(c => c._id !== tempComment._id))
      setError(getErrorMessage(err))
      setBody(body) // Restore the text
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete Comment ───────────────────────────
  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)

    // 🔥 OPTIMISTIC DELETE: Remove immediately
    setOptimisticComments(prev => prev.filter(c => c._id !== commentId))

    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`)
      onUpdate()
    } catch (err) {
      setError(getErrorMessage(err))
      // Refresh on error to restore
      onUpdate()
    } finally {
      setDeletingId(null)
    }
  }

  // ── Time helper ──────────────────────────────
  const timeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <h4>Comments</h4>
        <span>{allComments.length}</span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          ⚠ {error}
        </div>
      )}

      {/* Comments */}
      {allComments.length === 0 ? (
        <div style={{ padding: 12, color: 'gray' }}>
          No comments yet
        </div>
      ) : (
        allComments.map((comment) => {
          // ── SAFE AUTHOR HANDLING
          const author = comment.author as SafeAuthor | undefined

          const safeName =
            author && typeof author === 'object' && author.name?.trim()
              ? author.name.trim()
              : 'Unknown user'

          const isOwn = author?._id === user?._id
          const isOptimistic = comment._id.startsWith('temp-')

          return (
            <div
              key={comment._id}
              style={{
                display: 'flex',
                gap: 10,
                padding: 10,
                borderBottom: '1px solid var(--border)',
                opacity: isOptimistic ? 0.7 : 1,
              }}
            >
              {/* Avatar */}
              <Avatar name={safeName} size={28} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 12 }}>
                  {safeName}
                  {isOptimistic && (
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>
                      sending...
                    </span>
                  )}
                </strong>

                <p style={{ margin: '4px 0', fontSize: 12 }}>
                  {comment.body}
                </p>

                <small style={{ color: 'var(--muted)' }}>
                  {isOptimistic ? 'just now' : timeAgo(comment.createdAt)}
                </small>
              </div>

              {/* Delete */}
              {isOwn && !isOptimistic && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  disabled={deletingId === comment._id}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                  }}
                >
                  {deletingId === comment._id ? (
                    <Loader2 size={14} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          )
        })
      )}

      {/* Add comment */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
        }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          style={{
            flex: 1,
            padding: 8,
            border: '1px solid var(--border)',
            borderRadius: 6,
          }}
        />

        <button
          disabled={submitting || !body.trim()}
          style={{
            padding: '8px 12px',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {submitting ? <Loader2 size={14} /> : <Send size={14} />}
        </button>
      </form>
    </div>
  )
}

// ─── SAFE AVATAR ─────────────────────────────
function Avatar({
  name,
  size = 32,
}: {
  name?: string
  size?: number
}) {
  const safeName = name?.trim() || 'Unknown user'

  const initials = safeName
    .split(' ')
    .map((n) => n?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hue = safeName.charCodeAt(0) * 7 % 360

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `hsl(${hue}, 40%, 30%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
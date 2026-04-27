import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.ts'
import { Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error, isAuth, clearError } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  
  const { isDark, toggleTheme } = useTheme()

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })

  // ── Redirect if already logged in ─────────────────
  useEffect(() => {
    if (isAuth) navigate('/dashboard')
  }, [isAuth, navigate])

  // ── Clear context error on unmount ────────────────
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  // ── Handle input change ───────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  // ── Client-side validation ────────────────────────
  const validate = (): boolean => {
    const errors = { name: '', email: '', password: '', confirm: '' }
    let valid = true

    if (!form.name.trim()) {
      errors.name = 'Name is required'
      valid = false
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
      valid = false
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required'
      valid = false
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Please enter a valid email'
      valid = false
    }

    if (!form.password) {
      errors.password = 'Password is required'
      valid = false
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
      valid = false
    }

    if (!form.confirm) {
      errors.confirm = 'Please confirm your password'
      valid = false
    } else if (form.confirm !== form.password) {
      errors.confirm = 'Passwords do not match'
      valid = false
    }

    setFieldErrors(errors)
    return valid
  }

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard')
    } catch {
      // error already set in AuthContext
    }
  }

  // ── Password strength ─────────────────────────────
  const getStrength = (): { label: string; color: string; width: string } => {
    const p = form.password
    if (!p) return { label: '', color: 'var(--border)', width: '0%' }
    if (p.length < 6) return { label: 'Weak', color: 'var(--danger)', width: '25%' }
    if (p.length < 8) return { label: 'Fair', color: 'var(--warn)', width: '50%' }
    if (p.length < 12 && /[A-Z]/.test(p) && /[0-9]/.test(p))
      return { label: 'Good', color: 'var(--info)', width: '75%' }
    if (p.length >= 12 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p))
      return { label: 'Strong', color: 'var(--success)', width: '100%' }
    return { label: 'Fair', color: 'var(--warn)', width: '50%' }
  }

  const strength = getStrength()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Theme Toggle ───────────────────────────── */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '7px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          transition: 'all 0.2s ease',
          zIndex: 100,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--gold)'
          e.currentTarget.style.color = 'var(--gold)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--muted)'
        }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* ── Ambient Glow ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="fade-in"
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* ── Logo ─────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--gold-dim)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 24,
              color: 'var(--gold)',
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36,
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '-0.01em',
            }}
          >
            Aurum
          </h1>
          <p
            style={{
              color: 'var(--muted)',
              marginTop: 6,
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Create your account
          </p>
        </div>

        {/* ── Card ─────────────────────────────────── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <div className="gold-line" />
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              marginBottom: 24,
              color: 'var(--text)',
            }}
          >
            Sign up
          </h2>

          {/* ── Server Error ─────────────────────── */}
          {error && (
            <div
              style={{
                background: 'rgba(201,108,108,0.1)',
                border: '1px solid rgba(201,108,108,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
                color: 'var(--danger)',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* ── Form ─────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Name */}
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Michael Adeyemi"
                autoComplete="name"
                style={{
                  borderColor: fieldErrors.name ? 'var(--danger)' : undefined,
                }}
              />
              {fieldErrors.name && (
                <span style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'block' }}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  borderColor: fieldErrors.email ? 'var(--danger)' : undefined,
                }}
              />
              {fieldErrors.email && (
                <span style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'block' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  style={{
                    paddingRight: 40,
                    borderColor: fieldErrors.password ? 'var(--danger)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      height: 3,
                      background: 'var(--panel)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: strength.width,
                        background: strength.color,
                        borderRadius: 2,
                        transition: 'width 0.3s ease, background 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: strength.color,
                      marginTop: 4,
                      display: 'block',
                    }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              {fieldErrors.password && (
                <span style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'block' }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  style={{
                    paddingRight: 40,
                    borderColor: fieldErrors.confirm
                      ? 'var(--danger)'
                      : form.confirm && form.confirm === form.password
                      ? 'var(--success)'
                      : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.confirm && (
                <span style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4, display: 'block' }}>
                  {fieldErrors.confirm}
                </span>
              )}
              {form.confirm && form.confirm === form.password && !fieldErrors.confirm && (
                <span style={{ color: 'var(--success)', fontSize: 11, marginTop: 4, display: 'block' }}>
                  ✓ Passwords match
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--gold)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                padding: '12px',
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
                letterSpacing: '0.04em',
                transition: 'opacity 0.2s',
              }}
            >
              {loading
                ? <><Loader2 size={14} className="spin" /> Creating account…</>
                : 'Create Account'
              }
            </button>
          </form>
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <p
          style={{
            textAlign: 'center',
            color: 'var(--muted)',
            marginTop: 20,
            fontSize: 12,
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--gold)', fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
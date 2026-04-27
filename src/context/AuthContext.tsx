import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
}                           from 'react'
import api, { getErrorMessage } from '../services/api.ts'
import type {
  IUser,
  LoginForm,
  RegisterForm,
  AuthResponse,
  ApiResponse,
}                           from '../types/index.ts'

// ─── State ────────────────────────────────────────────
interface AuthState {
  user:    IUser | null
  token:   string | null
  loading: boolean
  error:   string | null
}

// ─── Actions ──────────────────────────────────────────
type AuthAction =
  | { type: 'AUTH_SUCCESS';  payload: { user: IUser; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING';   payload: boolean }
  | { type: 'SET_ERROR';     payload: string | null }
  | { type: 'UPDATE_USER';   payload: IUser }
  | { type: 'CLEAR_ERROR' }

// ─── Reducer ──────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user:    action.payload.user,
        token:   action.payload.token,
        loading: false,
        error:   null,
      }

    case 'LOGOUT':
      return {
        user:    null,
        token:   null,
        loading: false,
        error:   null,
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'UPDATE_USER':
      return { ...state, user: action.payload }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    default:
      return state
  }
}

// ─── Initial State ────────────────────────────────────
const initialState: AuthState = {
  user:    JSON.parse(localStorage.getItem('user') ?? 'null'),
  token:   localStorage.getItem('token'),
  loading: false,
  error:   null,
}

// ─── Context Shape ────────────────────────────────────
interface AuthContextType {
  user:       IUser | null
  token:      string | null
  loading:    boolean
  error:      string | null
  isAuth:     boolean
  login:      (form: LoginForm)     => Promise<void>
  register:   (form: RegisterForm)  => Promise<void>
  logout:     ()                    => void
  updateUser: (user: IUser)         => void
  clearError: ()                    => void
}

// ─── Context ──────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ─────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ── Persist to localStorage on state change ────────
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem('token', state.token)
      localStorage.setItem('user',  JSON.stringify(state.user))
    }
  }, [state.token, state.user])

  // ── Login ──────────────────────────────────────────
  const login = useCallback(async (form: LoginForm) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        form
      )

      const { user, token } = response.data.data!

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(error) })
      throw error
    }
  }, [])

  // ── Register ───────────────────────────────────────
  const register = useCallback(async (form: RegisterForm) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        form
      )

      const { user, token } = response.data.data!

      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(error) })
      throw error
    }
  }, [])

  // ── Logout ─────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  // ── Update User ────────────────────────────────────
  const updateUser = useCallback((user: IUser) => {
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'UPDATE_USER', payload: user })
  }, [])

  // ── Clear Error ────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user:    state.user,
        token:   state.token,
        loading: state.loading,
        error:   state.error,
        isAuth:  !!state.token && !!state.user,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
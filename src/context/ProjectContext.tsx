import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
}                           from 'react'
import api, {
  getErrorMessage,
}                           from '../services/api.ts'
import type {
  IProject,
  ProjectForm,
  ApiResponse,
  PaginationMeta,
}                           from '../types/index.ts'

// ─── State ────────────────────────────────────────────
interface ProjectState {
  projects:      IProject[]
  activeProject: IProject | null
  loading:       boolean
  error:         string | null
  meta:          PaginationMeta | null
}

// ─── Actions ──────────────────────────────────────────
type ProjectAction =
  | { type: 'SET_PROJECTS';       payload: { projects: IProject[]; meta: PaginationMeta } }
  | { type: 'SET_ACTIVE_PROJECT'; payload: IProject }
  | { type: 'ADD_PROJECT';        payload: IProject }
  | { type: 'UPDATE_PROJECT';     payload: IProject }
  | { type: 'DELETE_PROJECT';     payload: string }
  | { type: 'SET_LOADING';        payload: boolean }
  | { type: 'SET_ERROR';          payload: string | null }
  | { type: 'CLEAR_ERROR' }

// ─── Reducer ──────────────────────────────────────────
const projectReducer = (
  state:  ProjectState,
  action: ProjectAction
): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload.projects,
        meta:     action.payload.meta,
        loading:  false,
        error:    null,
      }

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload, loading: false }

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        loading:  false,
      }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p._id === action.payload._id ? action.payload : p
        ),
        activeProject:
          state.activeProject?._id === action.payload._id
            ? action.payload
            : state.activeProject,
        loading: false,
      }

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p._id !== action.payload),
        activeProject:
          state.activeProject?._id === action.payload
            ? null
            : state.activeProject,
        loading: false,
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    default:
      return state
  }
}

// ─── Initial State ────────────────────────────────────
const initialState: ProjectState = {
  projects:      [],
  activeProject: null,
  loading:       false,
  error:         null,
  meta:          null,
}

// ─── Context Shape ────────────────────────────────────
interface ProjectContextType {
  projects:      IProject[]
  activeProject: IProject | null
  loading:       boolean
  error:         string | null
  meta:          PaginationMeta | null
  fetchProjects:    (params?: Record<string, string>) => Promise<void>
  fetchProject:     (id: string)                       => Promise<void>
  createProject:    (form: ProjectForm)                => Promise<IProject>
  updateProject:    (id: string, form: Partial<ProjectForm>) => Promise<void>
  deleteProject:    (id: string)                       => Promise<void>
  addMember:        (projectId: string, email: string)    => Promise<void>  // ← email
  removeMember:     (projectId: string, memberId: string) => Promise<void>  // ← memberId
  setActiveProject: (project: IProject)                => void
  clearError:       ()                                 => void
}

// ─── Context ──────────────────────────────────────────
const ProjectContext = createContext<ProjectContextType | null>(null)

// ─── Provider ─────────────────────────────────────────
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  // ── Fetch All Projects ─────────────────────────────
  const fetchProjects = useCallback(async (
    params: Record<string, string> = {}
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const query = new URLSearchParams(params).toString()

      const response = await api.get<ApiResponse<{
        projects: IProject[]
      }>>(`/projects${query ? `?${query}` : ''}`)

      dispatch({
        type:    'SET_PROJECTS',
        payload: {
          projects: response.data.data?.projects ?? [],
          meta:     response.data.meta ?? {
            page: 1, limit: 10, total: 0, totalPages: 0,
          },
        },
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
    }
  }, [])

  // ── Fetch Single Project ───────────────────────────
  const fetchProject = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.get<ApiResponse<{
        project: IProject
      }>>(`/projects/${id}`)

      dispatch({
        type:    'SET_ACTIVE_PROJECT',
        payload: response.data.data!.project,
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
    }
  }, [])

  // ── Create Project ─────────────────────────────────
  const createProject = useCallback(async (
    form: ProjectForm
  ): Promise<IProject> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.post<ApiResponse<{
        project: IProject
      }>>('/projects', form)

      const project = response.data.data!.project
      dispatch({ type: 'ADD_PROJECT', payload: project })
      return project
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
      throw err
    }
  }, [])

  // ── Update Project ─────────────────────────────────
  const updateProject = useCallback(async (
    id:   string,
    form: Partial<ProjectForm>
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.patch<ApiResponse<{
        project: IProject
      }>>(`/projects/${id}`, form)

      dispatch({
        type:    'UPDATE_PROJECT',
        payload: response.data.data!.project,
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
      throw err
    }
  }, [])

  // ── Delete Project ─────────────────────────────────
  const deleteProject = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      await api.delete(`/projects/${id}`)
      dispatch({ type: 'DELETE_PROJECT', payload: id })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
      throw err
    }
  }, [])

  // ── Add Member (by email) ──────────────────────────
  const addMember = useCallback(async (
    projectId: string,
    email:     string        // ← email
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.post<ApiResponse<{
        project: IProject
      }>>(`/projects/${projectId}/members`, { email })

      dispatch({
        type:    'UPDATE_PROJECT',
        payload: response.data.data!.project,
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
      throw err
    }
  }, [])

  // ── Remove Member (by memberId) ────────────────────
  const removeMember = useCallback(async (
    projectId: string,
    memberId:  string        // ← memberId
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await api.delete<ApiResponse<{
        project: IProject
      }>>(`/projects/${projectId}/members`, { data: { memberId } })

      dispatch({
        type:    'UPDATE_PROJECT',
        payload: response.data.data!.project,
      })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) })
      throw err
    }
  }, [])

  // ── Set Active Project ─────────────────────────────
  const setActiveProject = useCallback((project: IProject) => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project })
  }, [])

  // ── Clear Error ────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        setActiveProject,
        clearError,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────
export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
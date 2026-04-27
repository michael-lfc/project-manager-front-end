import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { config } from '../config/env.ts'
import type { ApiResponse } from '../types/index.ts'

// ─── Axios Instance ───────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ─── Request Interceptor ──────────────────────────────
// Attaches JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────
// Handles token expiry globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiResponse>) => {
    // Token expired or invalid — clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// ─── Helper to extract error message ─────────────────
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.message ??
      'Something went wrong'
    )
  }
  return 'Something went wrong'
}

export default api
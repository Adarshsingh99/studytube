import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
}

export const learningApi = {
  dashboard: () => api.get('/learning-items/dashboard').then((res) => res.data),
  list: () => api.get('/learning-items').then((res) => res.data),
  create: (payload) => api.post('/learning-items', payload).then((res) => res.data),
  get: (id) => api.get(`/learning-items/${id}`).then((res) => res.data),
  roadmap: (id) => api.get(`/learning-items/${id}/roadmap`).then((res) => res.data),
}

export const progressApi = {
  get: (id) => api.get(`/progress/${id}`).then((res) => res.data),
  update: (id, payload) => api.patch(`/progress/${id}`, payload).then((res) => res.data),
  recalculate: (id, remainingDays) => api.post(`/progress/${id}/recalculate`, null, { params: { remaining_days: remainingDays } }).then((res) => res.data),
}

export const reminderApi = {
  get: (id) => api.get(`/reminders/${id}`).then((res) => res.data),
  upsert: (id, payload) => api.put(`/reminders/${id}`, payload).then((res) => res.data),
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.detail).filter(Boolean).join(' ') || fallback
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.detail || fallback
  }
  return fallback
}

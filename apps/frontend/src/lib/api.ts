import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: attach access token ────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: auto-refresh on 401 ──────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response.data, // unwrap { success, data } envelope
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null

      if (!refreshToken) {
        isRefreshing = false
        clearTokens()
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = res.data.data
        setTokens(accessToken, newRefresh)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Extract error message from API response
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message))
  },
)

export function setTokens(access: string, refresh: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

// ── Typed API helpers ───────────────────────────────────────────

export const authApi = {
  register:      (data: any)                  => api.post('/auth/register', data),
  login:         (data: any)                  => api.post('/auth/login', data),
  logout:        (refreshToken?: string)      => api.post('/auth/logout', { refreshToken }),
  me:            ()                           => api.get('/auth/me'),
}

export const engineersApi = {
  list:              (params?: any)           => api.get('/engineers', { params }),
  get:               (id: string)             => api.get(`/engineers/${id}`),
  getMe:             ()                       => api.get('/engineers/me'),
  updateProfile:     (data: any)              => api.put('/engineers/me/profile', data),
  addSkill:          (data: any)              => api.post('/engineers/me/skills', data),
  removeSkill:       (skillId: string)        => api.delete(`/engineers/me/skills/${skillId}`),
  addPortfolio:      (data: any)              => api.post('/engineers/me/portfolio', data),
  removePortfolio:   (id: string)             => api.delete(`/engineers/me/portfolio/${id}`),
  addCertification:  (data: any)              => api.post('/engineers/me/certifications', data),
  addEducation:      (data: any)              => api.post('/engineers/me/education', data),
}

export const clientsApi = {
  getMe:   ()           => api.get('/clients/me'),
  updateMe:(data: any)  => api.put('/clients/me', data),
  get:     (id: string) => api.get(`/clients/${id}`),
}

export const jobsApi = {
  list:     (params?: any)                    => api.get('/jobs', { params }),
  get:      (id: string)                      => api.get(`/jobs/${id}`),
  create:   (data: any)                       => api.post('/jobs', data),
  update:   (id: string, data: any)           => api.put(`/jobs/${id}`, data),
  close:    (id: string)                      => api.delete(`/jobs/${id}`),
  myJobs:   (status?: string)                 => api.get('/jobs/my/postings', { params: { status } }),
}

export const proposalsApi = {
  create:     (data: any)                     => api.post('/proposals', data),
  mine:       ()                              => api.get('/proposals/my'),
  forJob:     (jobId: string)                 => api.get(`/proposals/job/${jobId}`),
  shortlist:  (id: string)                    => api.put(`/proposals/${id}/shortlist`),
  accept:     (id: string)                    => api.put(`/proposals/${id}/accept`),
  withdraw:   (id: string)                    => api.put(`/proposals/${id}/withdraw`),
}

export const contractsApi = {
  fromProposal:      (proposalId: string)     => api.post(`/contracts/from-proposal/${proposalId}`),
  mine:              ()                       => api.get('/contracts/my'),
  get:               (id: string)             => api.get(`/contracts/${id}`),
  submitMilestone:   (cId: string, mId: string, deliverables: string[]) =>
                       api.put(`/contracts/${cId}/milestones/${mId}/submit`, { deliverables }),
  approveMilestone:  (cId: string, mId: string) =>
                       api.put(`/contracts/${cId}/milestones/${mId}/approve`),
  rejectMilestone:   (cId: string, mId: string, feedback: string) =>
                       api.put(`/contracts/${cId}/milestones/${mId}/reject`, { feedback }),
  complete:          (id: string)             => api.put(`/contracts/${id}/complete`),
}

export const paymentsApi = {
  payMilestone:      (cId: string, mId: string) =>
                       api.post(`/payments/contracts/${cId}/milestones/${mId}/pay`),
  contractPayments:  (cId: string)            => api.get(`/payments/contracts/${cId}`),
}

export const messagesApi = {
  get:       (contractId: string, cursor?: string) =>
               api.get(`/messages/contracts/${contractId}`, { params: { cursor } }),
  markRead:  (contractId: string)             => api.post(`/messages/contracts/${contractId}/read`),
  unread:    ()                               => api.get('/messages/unread-count'),
}

export const notificationsApi = {
  list:      (unread?: boolean)               => api.get('/notifications', { params: { unread } }),
  unread:    ()                               => api.get('/notifications/unread-count'),
  markRead:  (id: string)                     => api.put(`/notifications/${id}/read`),
  markAll:   ()                               => api.put('/notifications/read-all'),
}

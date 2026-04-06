import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                const response = await axios.post(`${API_URL}/api/token/refresh/`, {
                    refresh: refreshToken,
                })

                const { access } = response.data
                localStorage.setItem('access_token', access)
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`
                originalRequest.headers.Authorization = `Bearer ${access}`

                return api(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api

// Ticket API
export const ticketApi = {
    list: (params = {}) => api.get('/api/tickets/', { params }),
    get: (id) => api.get(`/api/tickets/${id}/`),
    create: (data) => api.post('/api/tickets/', data),
    update: (id, data) => api.patch(`/api/tickets/${id}/`, data),
    delete: (id) => api.delete(`/api/tickets/${id}/`),
    analyze: (id) => api.post(`/api/tickets/${id}/analyze/`),
    assignAgent: (id) => api.post(`/api/tickets/${id}/assign_agent/`),
    detectDuplicates: (id) => api.post(`/api/tickets/${id}/detect_duplicates/`),
    applySuggestedResponse: (id) => api.post(`/api/tickets/${id}/apply_suggested_response/`),
    dashboardStats: () => api.get('/api/tickets/dashboard_stats/'),
}

// Comment API
export const commentApi = {
    list: (ticketId) => api.get(`/api/tickets/${ticketId}/comments/`),
    create: (ticketId, data) => api.post(`/api/tickets/${ticketId}/comments/`, data),
    update: (ticketId, commentId, data) => api.patch(`/api/tickets/${ticketId}/comments/${commentId}/`, data),
    delete: (ticketId, commentId) => api.delete(`/api/tickets/${ticketId}/comments/${commentId}/`),
}

// AI API
export const aiApi = {
    analyze: (data) => api.post('/api/ai/analyze/', data),
    detectDuplicates: (data) => api.post('/api/ai/detect-duplicates/', data),
    getAgents: () => api.get('/api/ai/agents/'),
}

// Health check
export const healthApi = {
    check: () => api.get('/api/health/'),
}

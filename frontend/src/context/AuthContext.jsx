import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            // Decode token to get user info (simplified)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUser({
                    id: payload.user_id,
                    username: localStorage.getItem('username') || 'User',
                    is_staff: payload.is_staff || false
                })
            } catch (e) {
                console.error('Failed to decode token:', e)
            }
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/token/', { username, password })
            const { access, refresh } = response.data

            localStorage.setItem('access_token', access)
            localStorage.setItem('refresh_token', refresh)
            localStorage.setItem('username', username)

            api.defaults.headers.common['Authorization'] = `Bearer ${access}`

            // Decode token
            const payload = JSON.parse(atob(access.split('.')[1]))
            setUser({
                id: payload.user_id,
                username,
                is_staff: payload.is_staff || false
            })

            return { success: true }
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Login failed' }
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const register = async (username, email, password) => {
        try {
            await api.post('/api/register/', { username, email, password })
            return { success: true }
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' }
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

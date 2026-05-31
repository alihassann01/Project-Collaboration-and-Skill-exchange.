import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginUser, registerUser, logoutUser, getMe } from '../api/auth'

const AuthContext = createContext(null)

// Backend always returns: { success: true, data: { id, name, email, role, ... } }
// So res.data.data is the user object in every case.
// We also check data.data.user and data.user as fallbacks for safety.
function extractUser(data) {
  const candidates = [
    data?.data?.user,
    data?.data,
    data?.user,
  ]
  for (const u of candidates) {
    if (u && typeof u === 'object' && u.id && u.role) return u
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  // On app load — restore session from backend
  useEffect(() => {
    getMe()
      .then(res => {
        const u = extractUser(res.data)
        setUser(u)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res  = await loginUser({ email, password })
    const data = res.data
    if (data.success) {
      const u = extractUser(data)
      if (!u) throw new Error('Invalid response from server.')
      setUser(u)
      return { success: true, role: u.role }
    }
    throw new Error(data.message || 'Login failed')
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    const res  = await registerUser({ name, email, password, role })
    const data = res.data
    if (data.success) {
      const u = extractUser(data)
      if (!u) throw new Error('Invalid response from server.')
      setUser(u)
      return { success: true, role: u.role }
    }
    throw new Error(data.message || 'Registration failed')
  }, [])

  const logout = useCallback(async () => {
    try { await logoutUser() } catch (_) {}
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully.')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

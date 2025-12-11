import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setUser(parsed.user || null)
        setToken(parsed.token || null)
      } catch (e) {
        setUser(null)
        setToken(null)
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    // use the helper that returns response data
    const data = await authApi.loginUser(email, password)
    if (data) {
      const payload = { token: data.token, user: data.user }
      localStorage.setItem('auth', JSON.stringify(payload))
      setUser(payload.user)
      setToken(payload.token)
      return payload
    }
    return null
  }

  async function register(payload) {
    const res = await authApi.registerUser(payload)
    return res
  }

  async function logout() {
    try {
      await authApi.logoutUser(token)
    } catch (e) {
      console.error('Logout error', e)
    } finally {
      localStorage.removeItem('auth')
      setUser(null)
      setToken(null)
      try { window.location.href = '/login' } catch (e) { }
    }
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext


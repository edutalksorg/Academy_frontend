import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth.api'
import { setAuthToken } from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read token and user from localStorage (stored separately)
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken) {
      try {
        setToken(storedToken)
        setAuthToken(storedToken)
      } catch (e) {
        setToken(null)
      }
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    // call API and adapt to backend response shape: axiosResponse.data === { success, data: { token, user } }
    const response = await authApi.loginUser(email, password)
    if (response && response.data && response.data.data) {
      const token = response.data.data.token
      const user = response.data.data.user

      // persist separately as requested
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // set in-memory state
      setToken(token)
      setUser(user)

      // set default header for future requests
      setAuthToken(token)

      return { token, user }
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
      // Clear storage and headers
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setToken(null)
      setAuthToken(null)
      try { window.location.href = '/login' } catch (e) { }
    }
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext


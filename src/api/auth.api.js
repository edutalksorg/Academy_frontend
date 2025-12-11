import axios from './axiosClient'

/**
 * Login — calls /auth/login on the shared axios client
 */
export const loginUser = async (email, password) => {
  const res = await axios.post('/auth/login', { email, password })
  return res.data
}

/**
 * Register
 */
export const registerUser = async (data) => {
  const res = await axios.post('/auth/register', data)
  return res.data
}

/**
 * Logout
 */
export const logoutUser = async (token) => {
  const res = await axios.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
  return res.data
}

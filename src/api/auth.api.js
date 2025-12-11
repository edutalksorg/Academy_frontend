import axios from './axiosClient'

/**
 * Login — calls /auth/login on the shared axios client
 */
export const loginUser = async (email, password) => {
  const res = await axios.post('/auth/login', { email, password })
  // return full axios response so callers can access response.data.data
  return res
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

import axios from './axiosClient'

export function register(payload) {
  return axios.post('/auth/register', payload).then(r => r.data)
}

export function login(payload) {
  return axios.post('/auth/login', payload).then(r => r.data)
}

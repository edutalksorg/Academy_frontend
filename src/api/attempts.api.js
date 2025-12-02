import axios from './axiosClient'

export function startTest(testId) {
  return axios.post(`/attempts/tests/${testId}/start`).then(r => r.data)
}

export function submitAttempt(attemptId, answers) {
  return axios.post(`/attempts/submit/${attemptId}`, { answers }).then(r => r.data)
}

export function myAttempts() {
  return axios.get('/attempts/me').then(r => r.data)
}

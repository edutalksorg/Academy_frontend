import axios from './axiosClient'

export function createTest(payload) {
  return axios.post('/tests', payload).then(r => r.data)
}

export function addQuestion(testId, payload) {
  return axios.post(`/tests/${testId}/questions`, payload).then(r => r.data)
}

export function getTest(id) {
  return axios.get(`/tests/${id}`).then(r => r.data)
}

export function updateTest(id, payload) {
  return axios.put(`/tests/${id}`, payload).then(r => r.data)
}

import axios from './axiosClient'

export function getPendingUsers(params){
  return axios.get('/admin/pending-users', { params }).then(r => r.data)
}

export function approveUser(id){
  return axios.post(`/admin/approve-user/${id}`, { approve: true }).then(r=>r.data)
}

import axios from './axiosClient'

export function collegeReport(params){
  return axios.get('/reports/tpo/college-report', { params }).then(r=>r.data)
}

export function globalReport(){
  return axios.get('/reports/admin/global-report').then(r=>r.data)
}

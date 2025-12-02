import axios from './axiosClient'

export function getCollegeStudents(params){
  return axios.get('/tpo/students', { params }).then(r => r.data)
}

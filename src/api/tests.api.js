import axiosClient from './axiosClient';

// Tests
export const listPublishedTests = (params) => axiosClient.get('/tests', { params }).then(res => res.data);
export const listMyTests = () => axiosClient.get('/tests/my-tests').then(res => res.data);
export const getTest = (id) => axiosClient.get(`/tests/${id}`).then(res => res.data);
export const createTest = (data) => axiosClient.post('/tests', data).then(res => res.data);
export const updateTest = (id, data) => axiosClient.put(`/tests/${id}`, data).then(res => res.data);
export const deleteTest = (id) => axiosClient.delete(`/tests/${id}`).then(res => res.data);

// Questions
export const addQuestion = (testId, data) => axiosClient.post(`/tests/${testId}/questions`, data).then(res => res.data);
export const deleteQuestion = (questionId) => axiosClient.delete(`/tests/questions/${questionId}`).then(res => res.data);

import axiosClient from './axiosClient';

export const runCode = (payload) => axiosClient.post('/submissions/run', payload).then(r => r.data);
export const submitCode = (payload) => axiosClient.post('/submissions/submit', payload).then(r => r.data);

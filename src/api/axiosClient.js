import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token from localStorage to each request
axiosClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const response = err.response;
    if (response && response.status === 401) {
      // clear local auth and force reload to login
      localStorage.removeItem('auth');
      try { window.location.href = '/login'; } catch (e) {}
    }
    return Promise.reject(response ? response.data : err);
  }
)

export default axiosClient

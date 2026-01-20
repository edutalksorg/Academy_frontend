import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

// Helper to set Authorization header on both the global axios and this instance
export function setAuthToken(token) {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
        delete axiosClient.defaults.headers.common["Authorization"];
    }
}

// Response interceptor to handle 401s
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops if refresh endpoint itself returns 401
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Use a new axios instance to avoid interceptor loop
                    const res = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh-token`, { token: refreshToken });

                    if (res.data && res.data.success) {
                        const newToken = res.data.data.token;
                        const newRefreshToken = res.data.data.refreshToken;

                        localStorage.setItem('token', newToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }

                        setAuthToken(newToken);
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return axiosClient(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed - clean up and redirect
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available, clear session to be safe
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;

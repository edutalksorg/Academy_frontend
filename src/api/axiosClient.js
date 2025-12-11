import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
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

export default axiosClient;

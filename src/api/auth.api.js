import axios from "axios";

/**
 * Login — uses VITE_API_BASE_URL and calls /auth/login
 */
export const loginUser = async (email, password) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
    { email, password },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    }
  );

  return response.data;
};

/**
 * Register
 */
export const registerUser = async (data) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
    data,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data;
};

/**
 * Logout
 */
export const logoutUser = async (token) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

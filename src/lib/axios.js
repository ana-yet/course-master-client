import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Allows sending/receiving Cookies (JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor: Handles global errors cleanly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 (Unauthorized), the token is invalid or expired
    if (error.response?.status === 401) {
      // Redirect to login if not already there
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

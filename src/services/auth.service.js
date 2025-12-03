import api from "@/lib/axios";

export const authService = {
  // Register User
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login User
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Logout
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get Current User
  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

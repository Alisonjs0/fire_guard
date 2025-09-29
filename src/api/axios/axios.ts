import axios from "axios";
import authService from "../../service/authService";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://fire-guard-backend-783901794609.us-central1.run.app/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.url !== "/auth/login") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
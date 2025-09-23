import axios from "axios";
import authService from "@/service/authService";

const api = axios.create({
    baseURL: "http://localhost:8080/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.url !== "/auth/login") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
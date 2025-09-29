import axios from "axios";
import authService from "../../service/authService";

const api = axios.create({
  baseURL:
    "https://fire-guard-backend-783901794609.us-central1.run.app/",
});

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
  let token: string | null = null;
  try {
    token = (typeof window !== 'undefined') ? localStorage.getItem("authToken") : null;
  } catch (e) {
    token = null;
  }

  if (!token) {
    token = getCookie('authToken');
  }

  if (token && config.url !== "/auth/login") {
    // garantir que headers existem
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    
    // Log apenas para POST (criação)
    if (config.method?.toUpperCase() === 'POST') {
      console.log('🔍 POST Request Debug:', {
        url: config.url,
        hasToken: !!token,
        headers: config.headers
      });
    }
  }
  return config;
});

// Interceptor para tratar erros de resposta e avisar sobre 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    
    console.log('❌ Erro na requisição:', {
      status,
      url,
      responseData: error?.response?.data,
      hasAuthHeader: !!error?.config?.headers?.Authorization
    });
    
    if (status === 401) {
      console.error('Erro 401: não autorizado. Credenciais inválidas.');
    } else if (status === 403) {
      console.error('Erro 403: acesso negado. Token ausente ou sem permissão.');
    }
    return Promise.reject(error);
  }
);

export default api;
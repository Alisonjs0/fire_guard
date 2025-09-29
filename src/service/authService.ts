import { jwtDecode, JwtPayload } from "jwt-decode";
import api from "../api/axios/axios";

const TOKEN_KEY = "authToken";

interface MyCustomClaims {
  id: number | null,
  name: string | null,
  roles: string | null
}

type MyTokenPayload = JwtPayload & MyCustomClaims;

interface LoginResponse {
  token: string;
  user?: any;
  message?: string;
}

const login = async (email: any, password: any): Promise<LoginResponse> => {
  console.log("Enviando para login:", email, password);
  const response = await api.post("/auth/login" ,{
    email: email,
    password: password,
  }, { headers: { "Content-Type": "application/json" } });

  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }

  return response.data;
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const getUser = () => {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode<MyTokenPayload>(token);

    return {
      id: decodedToken.id,
      cpf: decodedToken.sub,
      name: decodedToken.name || undefined,
      roles: decodedToken.roles || undefined
    };
  } catch (error) {
    console.error("Token invalido ou expirado", error);
    logout();
    return null;
  }
};

const authService = {
  login,
  logout,
  getToken,
  getUser
};

export default authService;
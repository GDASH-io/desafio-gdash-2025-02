import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import type {
  ApiErrorResponse,
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
} from "@/interfaces/auth";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

const api = axios.create({
  baseURL: API_BASE_URL,
});


function buildRegisterFormData(payload: RegisterPayload): FormData {
  const formData = new FormData();

  formData.append("username", payload.username);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("password2", payload.password2);

  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  return formData;
}

function extractErrorMessage(data?: ApiErrorResponse): string {
  if (!data) {
    return "Ocorreu um erro na requisição.";
  }

  let message = "Ocorreu um erro na requisição.";

  const errors = data.errors;

  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];

    if (Array.isArray(firstValue)) {
      message = firstValue[0];
    } else if (typeof firstValue === "string") {
      message = firstValue;
    }
  } else if (data.detail) {
    if (typeof data.detail === "string") {
      message = data.detail;
    }
  }

  return message;
}

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    throw new Error(extractErrorMessage(data));
  }

  throw new Error("Erro de conexão com o servidor.");
}


async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const formData = buildRegisterFormData(payload);

  try {
    const { data } = await api.post<RegisterResponse>(
      "/api/v1/register/",
      formData
    );

    const { token, user } = data;

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    return data;
  } catch (error) {
    handleAxiosError(error);
  }
}


async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>("/api/v1/login/", payload);

    const { token, user } = data;

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return data;
  } catch (error) {
    handleAxiosError(error);
  }
}


async function logout(): Promise<void> {
  const token = getAuthToken();

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);

  if (!token) {
    return;
  }

  try {
    await api.post(
      "/api/v1/logout/",
      { token },
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
  } catch (error) {    
    console.error("Erro ao fazer logout:", error);
  }
}


export const authService = {
  register,
  login,
  logout,
  getAuthToken,
  getAuthUser,
};

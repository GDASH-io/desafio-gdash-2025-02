const SECURE_TOKEN_NAME = "session-token";
export const API_BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:3000"

function setSecureToken(token: string) {
  document.cookie = `${SECURE_TOKEN_NAME}=${token}; SameSite=Strict`;
}

export function getSecureToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(SECURE_TOKEN_NAME + '=')) {
      return cookie.substring(SECURE_TOKEN_NAME.length + 1);
    }
  }
  return null;
}

export interface SessionStateResponse {
  token: string;
  user?: {
    display_name: string;
  };
}

export interface AuthResponse {
  goToPage?: string;
}

export interface EmailResponse {
  goToStep?: string;
}

export interface HourlyResponse {
  time: Date;
  hour: string;
  temperature: number;
  weatherCode: number;
}

export interface DailyResponse {
  time: Date;
  date: string;
  temperature: number;
  apparentTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  insights: string[];
}

export interface WeatherNowResponse {
  city: string;
  date: string;
  hour: string;
  temperature: number;
  apparentTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
  insights: string[];
  hourly: HourlyResponse[];
  daily: DailyResponse[];
}


export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface EmailPayload {
  email: string;
}

export async function RequestSessionState(): Promise<SessionStateResponse | null> {
  const response = await ApiFetch<SessionStateResponse>(`${API_BASE_URL}/api/session_state`);
  if (response) {
    setSecureToken(response.token);
  }
  return response;
}

export async function RequestEmail(data: EmailPayload): Promise<EmailResponse | null> {
  try {
    const response = await ApiFetch<EmailResponse>(`${API_BASE_URL}/api/auth/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    return null;
  }
}

export async function RequestRegister(data: RegisterPayload): Promise<AuthResponse | null> {
  try {
    const response = await ApiFetch<AuthResponse>(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    return null;
  }
}

export async function RequestLogin(data: LoginPayload): Promise<AuthResponse | null> {
  try {
    const response = await ApiFetch<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    return null;
  }
}

export async function RequestLogout(): Promise<AuthResponse | null> {
  try {
    const response = await ApiFetch<AuthResponse>(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    return null;
  }
}

export async function ApiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  const token = getSecureToken();
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', token);
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(url, response)
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<T>;
}

export async function RequestWeatherNow(): Promise<WeatherNowResponse | null> {
  const response = await ApiFetch<WeatherNowResponse>(`${API_BASE_URL}/api/weather/now`);
  return response;
}

const BASE_URL = "http://localhost:3000";

export async function apiRequest<T = any>(
  endpoint: string, 
  method: string = "GET", 
  body: any = null
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Erro na requisição");
  }

  return res.json() as Promise<T>;
}

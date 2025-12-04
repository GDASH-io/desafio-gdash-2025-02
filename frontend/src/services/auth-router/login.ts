import api from "../../lib/axios.ts";

export interface LoginData {
  email: string;
  password: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const loginUser = async (data: LoginData) => {
  const payload = {
    email: data.email,
    password: data.password,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
  };

  const res = await api.post("/auth/login", payload);
  return res.data;
};

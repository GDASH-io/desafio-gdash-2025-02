import api from "../../lib/axios.ts";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const registerUser = async (data: RegisterData) => {
  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
  };

  const res = await api.post("/auth/register", payload);
  return res.data;
};

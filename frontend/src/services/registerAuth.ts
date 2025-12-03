import { httpClient } from "./httpClient";

interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

interface AccessTokenResponse {
  access_token: string;
}

export const register = async (data: RegisterParams) => {
  const response = await httpClient.post<AccessTokenResponse>(
    "/auth/signup",
    data
  );
  return response.data;
};

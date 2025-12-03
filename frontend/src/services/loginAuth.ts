import { httpClient } from "./httpClient";

interface LoginParams {
  email: string;
  password: string;
}

interface AccessTokenResponse {
  access_token: string;
}

export const login = async (data: LoginParams) => {
  const response = await httpClient.post<AccessTokenResponse>(
    "/auth/signin",
    data
  );
  return response.data;
};

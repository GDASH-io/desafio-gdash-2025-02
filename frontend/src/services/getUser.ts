import { httpClient } from "./httpClient";

interface UserResponse {
  user: {
    name: string;
    email: string;
  };
}

export const getUser = async () => {
  const { data } = await httpClient.get<UserResponse>("/user/me");

  return data.user;
};

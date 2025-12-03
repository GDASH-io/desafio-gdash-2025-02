import { httpClient } from "./httpClient";

interface UpdateParams {
  name?: string;
  email?: string;
}

interface UpdateUserResponse {
  name: string;
  email: string;
}

export const update = async (data: UpdateParams) => {
  const response = await httpClient.patch<UpdateUserResponse>(
    "/user/update",
    data
  );
  return response.data;
};

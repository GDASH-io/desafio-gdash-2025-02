import { httpClient } from "./httpClient";

export const deleteUser = async () => {
  const response = await httpClient.delete("/user/delete");
  return response.data;
};

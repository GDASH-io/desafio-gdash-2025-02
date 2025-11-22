import { API_BASE_URL } from "@/config/api";
import type { ApiErrorResponse, RegisterPayload, RegisterResponse } from "@/interfaces/register";


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

async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const formData = buildRegisterFormData(payload);

  const response = await fetch(`${API_BASE_URL}/api/v1/register/`, {
    method: "POST",
    body: formData,
  });

  const data = (await response
    .json()
    .catch(() => ({}))) as ApiErrorResponse | RegisterResponse;

  if (!response.ok) {
    let message = "Não foi possível realizar o cadastro.";

    const errors = (data as ApiErrorResponse).errors;

    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstValue = errors[firstKey];

      if (Array.isArray(firstValue)) {
        message = firstValue[0];
      } else if (typeof firstValue === "string") {
        message = firstValue;
      }
    } else if ((data as ApiErrorResponse).detail) {
      const detail = (data as ApiErrorResponse).detail;
      if (typeof detail === "string") {
        message = detail;
      }
    }

    throw new Error(message);
  }

  return data as RegisterResponse;
}

export const authService = {
  register,
};

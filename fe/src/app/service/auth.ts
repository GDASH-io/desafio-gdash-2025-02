import { httpClient } from "./httpClient";
import { UserService } from "./users";

export class AuthService {
  static async signInUser(params: AuthService.SignInInput) {
    const { data, status } = await httpClient.post<AuthService.SignInOutPut>(
      "/auth/sign-in",
      params
    );

    return status === 200 ? data : undefined;
  }

  static async signUpUser(params: AuthService.SignUpInput) {
    const { data, status } = await httpClient.post<AuthService.SignUpOutPut>(
      "/auth/sign-up",
      {...params, role: UserService.Role.ADMIN}
    );

    return status === 201 ? data : undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuthService {
  export type SignInInput = { email: string; password: string };

  export type SignInOutPut = { token: string; user: {id: string; role: UserService.Role} };

  export type SignUpInput = { name: string; email: string; password: string };

  export type SignUpOutPut = { id: string; role: UserService.Role; token: string };
}

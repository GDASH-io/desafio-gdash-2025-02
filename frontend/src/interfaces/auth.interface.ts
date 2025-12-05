export interface ILoginResponse {
  access_token: string;
  user: {
    email: string;
    sub: string;
    role: string;
  };
}

export interface IUserData {
  email: string;
  sub: string;
  role: string;
}

export interface IAuthContext {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

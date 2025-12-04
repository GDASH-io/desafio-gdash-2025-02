export interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}
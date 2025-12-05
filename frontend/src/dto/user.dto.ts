export interface CreateUserDto {
  email: string;
  password?: string;
  role: "admin" | "user";
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: "admin" | "user";
}

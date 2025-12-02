export type UserRole = "admin" | "user";

export type User = {
  _id: string; // MongoDB usa _id
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  role?: UserRole;
};

export type UpdateUserPayload = {
  email?: string;
  password?: string;
  role?: UserRole;
};

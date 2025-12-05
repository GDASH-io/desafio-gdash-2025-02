export interface IUser {
  _id: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface IUserListResponse {
  users: IUser[];
  total: number;
}

export interface IPaginatedUsersResponse {
  pagina_atual: number;
  total_items: number;
  total_paginas: number;
  data: IUser[];
}

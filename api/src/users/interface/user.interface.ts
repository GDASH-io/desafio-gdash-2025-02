import { Request } from 'express';
import { UserRole } from '../dto/user.dto';

export interface IUserPublic {
  _id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJwtUser {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface IRequest extends Request {
  user: IJwtUser;
}

export interface IMongooseUserObject extends IUserPublic {
  password_hash: string;
  __v: number;
}

export interface IPaginatedResponse<T> {
  pagina_atual: number;
  total_items: number;
  total_paginas: number;
  data: T[];
}

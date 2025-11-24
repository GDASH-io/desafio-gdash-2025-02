import { UserRoleEnum } from '../enums/user-role'

export interface UserType {
  id: string
  name: string
  email: string
  role: UserRoleEnum
  createdAt: string
  updatedAt: string
}

export interface CreateUserInputType {
  name: string
  email: string
  password: string
  role?: UserRoleEnum
}

export interface UpdateUserInputType {
  name?: string
  email?: string
  password?: string
  role?: UserRoleEnum
}

export interface LoginInputType {
  email: string
  password: string
}

export interface AuthResponseType {
  accessToken: string
  refreshToken: string
  user: UserType
}

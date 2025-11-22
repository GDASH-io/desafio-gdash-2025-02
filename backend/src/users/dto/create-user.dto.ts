export class CreateUserDto {
  email!: string; 
  password!: string; 
  role?: 'admin' | 'user'; 
}

export class UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

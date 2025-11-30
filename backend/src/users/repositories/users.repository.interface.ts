import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>; // Retorna null se não achar, em vez de undefined
  update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
  delete(id: string): Promise<User | null>;
}

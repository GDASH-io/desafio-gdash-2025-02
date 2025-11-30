import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDocument } from '../infraestructure/schema/user.schema';

export interface UserRepositoryPort {
  create(createUserDto: CreateUserDto): Promise<UserDocument>;
  findAll(): Promise<UserDocument[]>;
  findOneById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null>;
  remove(id: string): Promise<void>;
}

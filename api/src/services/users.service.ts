import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import * as bcrypt from "bcrypt";
import { CreateUserDto, UpdateUserDto } from "../../dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}

  async findAll() {
    const users = await this.repo.findAll();
    return users.map(user => ({
    id: user._id,   // renomeando _id para id
    email: user.email,
    role: user.role,
  }));
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async create(data: CreateUserDto) {
    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw new BadRequestException("Email já está em uso");

    const hashed = await bcrypt.hash(data.password, 10);
    return this.repo.create({ ...data, password: hashed });
  }

  async update(id: string, data: UpdateUserDto) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException("Usuário não encontrado");

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.repo.update(id, updateData);
    return updated;
  }

  async delete(id: string, loggedUser: { id: string; role: string }) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException("Usuário não encontrado");

    // Regra de autorização:
    // - Admin pode deletar qualquer usuário
    // - Usuário comum só pode deletar a si mesmo
    if (loggedUser.role !== "admin" && loggedUser.id !== id) {
      throw new ForbiddenException("Você não tem permissão para deletar este usuário");
    }

    return this.repo.delete(id);
  }
}

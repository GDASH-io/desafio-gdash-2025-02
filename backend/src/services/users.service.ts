import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import * as bcrypt from "bcrypt";
import { CreateUserDto, UpdateUserDto } from "../../dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
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

  async delete(id: string) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException("Usuário não encontrado");
    return this.repo.delete(id);
  }
}

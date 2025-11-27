import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { CreateUserDto, UpdateUserDto } from "../../dto/user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.auth.guard";

@Controller("users")
export class UsersController {
  constructor(private service: UsersService) {}

  // GET /users - Lista todos os usuários
  // Comentário: rota protegida por JWT para evitar exposição de dados
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (err) {
      // Comentário: erros inesperados são propagados automaticamente pelo Nest
      throw err;
    }
  }

  // GET /users/:id - Busca por ID
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findById(@Param("id") id: string) {
    try {
      return await this.service.findById(id);
    } catch (err) {
      throw err; // NotFoundException tratado no service
    }
  }

  // POST /users - Cria usuário
  // Comentário: pode ser público, mas em apps reais você pode restringir a admin
  @Post()
  async create(@Body() data: CreateUserDto) {
    try {
      return await this.service.create(data);
    } catch (err) {
      // BadRequestException se email já estiver em uso
      throw err;
    }
  }

  // PUT /users/:id - Atualiza usuário
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(@Param("id") id: string, @Body() data: UpdateUserDto) {
    try {
      return await this.service.update(id, data);
    } catch (err) {
      throw err; // NotFoundException ou BadRequestException
    }
  }

  // DELETE /users/:id - Remove usuário
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    try {
      return await this.service.delete(id);
    } catch (err) {
      throw err; // NotFoundException
    }
  }
}

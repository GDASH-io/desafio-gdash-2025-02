import { JwtAuthGuard } from "@/common/guards/jwt-auth.guards";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateUserUseCase } from "../application/use-cases/create-user.use-case";
import { DeleteUserUseCase } from "../application/use-cases/delete-user.use-case";
import { UserRepository } from "../infrastructure/repositories/user.repository";
import { CurrentUser } from "@/common/decorators/public.decorator";
import { CreateUserDto, UpdateUserDto } from "../application/dto/user.dto";
import { ListUsersUseCase } from "../application/use-cases/list-users.use-case";
import { UpdateUserUseCase } from "../application/use-cases/update-user.use-case";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly userRepository: UserRepository,
    ) { }

    @Get('me')
    @ApiOperation({ summary: 'Obter dados do usuário atual' })
    @ApiResponse({ status: 200, description: 'Dados do usuário autenticado' })
    async getCurrentUser(@CurrentUser() user: any) {
        return this.userRepository.findById(user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar usuários' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Lista de usuários paginada' })
    async list(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('isActive') isActive?: boolean,
    ) {
        return this.listUsersUseCase.execute({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            isActive: isActive !== undefined ? isActive === true : undefined,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar usuário por ID' })
    @ApiParam({ name: 'id', description: 'ID do usuário' })
    @ApiResponse({ status: 200, description: 'Dados do usuário' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async findOne(@Param('id') id: string) {
        return this.userRepository.findById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.createUserUseCase.execute(createUserDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar usuário' })
    @ApiParam({ name: 'id', description: 'ID do usuário' })
    @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.updateUserUseCase.execute(id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar usuário' })
    @ApiParam({ name: 'id', description: 'ID do usuário' })
    @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async delete(@Param('id') id: string) {
        await this.deleteUserUseCase.execute(id)
    }
}
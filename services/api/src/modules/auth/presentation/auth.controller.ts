import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RegisterUseCase } from "../application/use-cases/register.use-case";
import { Public } from "@/common/decorators/public.decorator";
import { AuthResponseDto, LoginDto, RegisterDto } from "../application/dto/auth.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
    ) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Fazer login', description: 'Autentica usuário e retorna token JWT' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login realizado',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginDto: LoginDto) {
        return this.loginUseCase.execute(loginDto);
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar novo usuário', description: 'Cria novo usuário e retorna token JWT' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'Usuário registrado',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Email já cadastrado' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async register(@Body() registerDto: RegisterDto) {
        return this.registerUseCase.execute(registerDto);
    }
}
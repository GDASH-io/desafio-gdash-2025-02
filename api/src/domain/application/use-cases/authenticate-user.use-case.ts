import { Either, left, right } from "@/core/either";
import { UserRepository } from "../repositories/user-repository";
import { HashProvider } from "../providers/hash-provider";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { TokenProvider } from "../providers/providers/token-provider";

interface AuthenticateUserUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUserUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
>;

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
    private tokenProvider: TokenProvider
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    // Busca usuário por email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    // Verifica senha
    const isPasswordValid = await this.hashProvider.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError());
    }

    // Gera token JWT
    const accessToken = await this.tokenProvider.generate({
      sub: user.id.toString(),
      role: user.role,
    });

    return right({
      accessToken,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
}

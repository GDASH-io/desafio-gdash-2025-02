import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

@Injectable()
export class AppInitializerService implements OnModuleInit {
  constructor(
    // Usamos ConfigService para obter as variáveis de forma segura
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    // LENDO VIA ConfigService para garantir que o .env foi carregado
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME');

    // Validação de segurança dos dados
    if (!adminEmail || !adminPassword || !adminName) {
      console.warn(
        '⚠️ CREDENCIAIS DE ADMIN VAZIAS: Verifique se o arquivo .env existe na raiz do projeto e contém ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME.',
      );
      return;
    }

    try {
      // 1. Verificar se o usuário já existe
      const existingUser = await this.usersService.findOne(adminEmail);

      if (!existingUser) {
        // 2. Criar o usuário se ele não existir
        console.log(
          `👤 Criando usuário administrador padrão: ${adminEmail}...`,
        );

        // Chamada ao serviço de criação de usuário
        await this.usersService.create({
          // Garante que os valores passados são strings não vazias
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        });

        console.log('✅ Usuário administrador padrão criado com sucesso!');
      } else {
        console.log('✅ Usuário administrador padrão já existe.');
      }
    } catch (e) {
      // Se houver um erro de validação do Mongoose, ele será logado aqui
      console.error(
        '❌ Erro fatal ao inicializar o usuário administrador (Verifique o UserSchema e o DTO):', e);
    }
  }
}

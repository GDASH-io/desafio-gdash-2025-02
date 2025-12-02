import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeedService implements OnModuleInit {
    private readonly logger = new Logger(UsersSeedService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async onModuleInit() {
        await this.seedDefaultUser();
    }

    private async seedDefaultUser() {
        try {
            const defaultEmail = process.env.DEFAULT_USER_EMAIL || 'admin@weather.com';
            const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'senha123';

            // Verificar se o usuário padrão já existe
            const existingUser = await this.userModel.findOne({ email: defaultEmail });

            if (existingUser) {
                this.logger.log(`Usuário padrão já existe: ${defaultEmail}`);
                return;
            }

            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            const defaultUser = new this.userModel({
                nome: 'Administrador',
                email: defaultEmail,
                funcao: 'Administrador do Sistema',
                senha: hashedPassword,
            });

            await defaultUser.save();

            this.logger.log(`Usuário padrão criado com sucesso: ${defaultEmail}`);
            this.logger.log(`   Email: ${defaultEmail}`);
            this.logger.log(`   Senha: ${defaultPassword}`);
            this.logger.warn('IMPORTANTE: Altere a senha padrão em produção!');

        } catch (error) {
            this.logger.error(`Erro ao criar usuário padrão: ${error.message}`, error.stack);
        }
    }
}

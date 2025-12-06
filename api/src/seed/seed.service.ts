import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.createDefaultUser();
  }

  async createDefaultUser() {
    const defaultEmail = process.env.DEFAULT_USER_EMAIL || 'admin@example.com';
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || '123456';
    const defaultName = process.env.DEFAULT_USER_NAME || 'Administrador';

    const existingUser = await this.userModel.findOne({ email: defaultEmail });

    if (existingUser) {
      // Verifica se a senha precisa ser atualizada
      const passwordMatches = await bcrypt.compare(
        defaultPassword,
        existingUser.password,
      );

      // Verifica se precisa atualizar nome ou senha
      const needsUpdate =
        existingUser.name !== defaultName ||
        !passwordMatches ||
        !existingUser.isActive;

      if (needsUpdate) {
        const updateData: any = {
          name: defaultName,
          isActive: true,
        };

        if (!passwordMatches) {
          updateData.password = await bcrypt.hash(defaultPassword, 10);
        }

        await this.userModel.findByIdAndUpdate(existingUser._id, updateData);
        console.log(
          `✅ Usuário padrão atualizado: ${defaultEmail} / ${defaultPassword}`,
        );
      } else {
        console.log(
          '✅ Usuário padrão já existe e está configurado corretamente',
        );
      }
      return;
    }

    // Cria novo usuário padrão
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const user = new this.userModel({
      email: defaultEmail,
      password: hashedPassword,
      name: defaultName,
      isActive: true,
    });

    await user.save();
    console.log(
      `✅ Usuário padrão criado: ${defaultEmail} / ${defaultPassword}`,
    );
  }
}

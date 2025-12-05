import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { ResponseProps } from "src/weather/weather.service";

@Injectable()
export class InitializationService implements OnApplicationBootstrap {

  constructor(private readonly userService: UserService) { }

  async onApplicationBootstrap() {
    await this.createAdminUser();
  }

  async createAdminUser() {
    const res =  await this.userService.createUser({
      name: process.env.ADMIN_NAME as string,
      email: process.env.ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASSWORD as string,
      isAdmin: true
    });

    if(!res.success) {
      if(res.STATUS_CODE !== 409) {
        Logger.fatal("Erro ao criar usuário administrador")
        Logger.fatal("Encerrando")
      }
      Logger.warn("Admin já existe");
      return
    }

    Logger.log("Usuario administrador criado");

  }
}
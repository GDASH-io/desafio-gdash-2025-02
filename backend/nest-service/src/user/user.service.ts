import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schema/user.schema";
import { Model } from "mongoose";
import { generatePassowordHash } from "src/helpers/generatePasswordHash";
import { ResponseProps } from "src/weather/weather.service";
import { validateSignUp } from "src/helpers/validateSignUp";
import { CreateUserDto } from "src/validation/auth.schema";
import { comparePassword } from "src/helpers/comparePassword";
import { PatchOptions } from "./user.controller";
import { validateUpdate } from "src/helpers/validateUpdate";
import { UpdateUserDto } from "src/validation/updateUser.schema";

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async createUser(
    userData: {
      name: string,
      password: string,
      email: string,
      isAdmin: boolean
    }
  ): Promise<ResponseProps> {
    const errors = validateSignUp(CreateUserDto, userData)
    if (errors.length > 0) {
      Logger.error("Dados de novo usuário inválidos")
      return { success: false, message: errors[0].message, STATUS_CODE: HttpStatus.BAD_REQUEST }
    }

    const userExists = await this.userModel.findOne({ email: userData.email }).select("email");

    if (userExists) {
      Logger.warn("Email já existe");
      return { success: false, message: "Email já existe", STATUS_CODE: HttpStatus.CONFLICT }
    }

    const passwordHash = generatePassowordHash(userData.password)
    const user = new this.userModel({
      name: userData.name,
      email: userData.email,
      passwordHash,
      isAdmin: userData.isAdmin,
      tokenVersion: 0
    });

    let tries = 3;

    while (tries > 0) {
      tries--
      try {
        const res = await user.save()
        Logger.log("Novo usuário criado: " + res._id)
        break;
      } catch (err) {
        Logger.error("Falha ao cadastrar um novo usuário")
        Logger.error(err)
        if (tries > 0) {
          Logger.warn("Tentando novamente...")
          continue;
        }
        Logger.error("Operação cancelada")
        return { success: false, message: "Falha ao cadastrar usuário", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
      }
    }
    return { success: true, message: "Usuário criado", STATUS_CODE: HttpStatus.OK }
  }

  async loginUser(userData: { email: string, password: string }): Promise<ResponseProps & { id?: string, name?: string, tokenVersion?: string, isAdmin?: boolean }> {
    let user: any;
    if (!userData.password) {
      Logger.warn("Senha vazia")
      return { success: false, message: "Senha não pode ser vazia", STATUS_CODE: HttpStatus.BAD_REQUEST }
    }
    try {
      user = await this.userModel.findOne({ email: userData.email }).select("name tokenVersion email passwordHash isAdmin")
      if (!user) {
        Logger.warn("Usuário não encontrado!")
        return { success: false, message: "Usuário não encontrado", STATUS_CODE: HttpStatus.BAD_REQUEST }
      }
      const isPassOk = await comparePassword(userData.password, user.passwordHash)
      if (!isPassOk) {
        Logger.warn("Senha de usuário incorreta")
        return { success: false, message: "Senha incorreta", STATUS_CODE: HttpStatus.BAD_REQUEST }
      }
      user.tokenVersion += 1
      await this.updateUser(user.email, { tokenVersion: user.tokenVersion });
    } catch (e) {
      Logger.error("Erro ao tentar logar usuário")
      Logger.error(e.message)
      return { success: false, message: "Erro interno do servidor", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
    return { success: true, message: "Usuário autenticado", STATUS_CODE: HttpStatus.OK, id: user.id, name: user.name, tokenVersion: user.tokenVersion, isAdmin: user.isAdmin };
  }

  async logoutUser(email: string): Promise<ResponseProps> {
    try {
      const user = (await this.getUser(email)).message;
      await this.updateUser(user["email"], { tokenVersion: ++user["tokenVersion"] });
    } catch (err) {
      Logger.error("Erro ao deslogar usuário");
      Logger.error(err.message);
      return { success: false, message: "Falha ao tentar deslogar usuário", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }

    return { success: true, message: "Usuário deslogado", STATUS_CODE: HttpStatus.OK }
  }

  async getUser(email: string): Promise<ResponseProps> {
    let user: any;
    try {
      user = await this.userModel.findOne({ email }).select("-passwordHash -__v")

      if (user === null) {
        Logger.warn("Usuário " + name + " não encontrado")
        return { success: false, message: "Usuário não encontrado!", STATUS_CODE: HttpStatus.NOT_FOUND }
      }
    } catch (e) {
      Logger.error("Erro ao procurar por usuário")
      Logger.error(e.message)
      return { success: false, message: "Erro ao procurar por usuário", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
    return { success: true, message: user, STATUS_CODE: HttpStatus.OK }
  }

  async getAllUsers(): Promise<ResponseProps> {
    let users: any;
    try {
      users = await this.userModel.find().select("-passwordHash -__v -isAdmin")
      if (users.length === 0) {
        Logger.warn("Usuários não encontrados!")
        return { success: false, message: "Usuários não encontrados!", STATUS_CODE: HttpStatus.NOT_FOUND }
      }
    } catch (e) {
      Logger.error("Erro ao tentar listar usuários")
      Logger.error(e.message)
      return { success: false, message: "Erro ao tentar listar usuários", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
    return { success: true, message: users, STATUS_CODE: HttpStatus.OK }
  }

  async updateUser(email: string, update: PatchOptions): Promise<ResponseProps> {

    try {
      const errors = validateUpdate(UpdateUserDto, update);
      if (errors.length > 0) {
        Logger.error("Dados para alteração de usuário inválidos")
        return { success: false, message: errors[0].message, STATUS_CODE: HttpStatus.BAD_REQUEST }
      }
      if (update.email && email !== update.email) {
        const user = await this.getUser(update.email);
        if (user.success && user.message) {
          return {
            success: false,
            message: "Email já existe",
            STATUS_CODE: HttpStatus.CONFLICT
          };
        }
      }

      let newInfo: PatchOptions & { passwordHash?: string } = { ...update };
      if (update.password) {
        newInfo.passwordHash = generatePassowordHash(update.password);
      }

      const res = await this.userModel.findOneAndUpdate({ email }, newInfo);

      if (res === null) {
        Logger.error("Usuário não encontrado para atualização");
        return { success: false, message: "Usuário não encontrado", STATUS_CODE: HttpStatus.NOT_FOUND };
      }
    } catch (e) {
      Logger.error("Falha oa tentar atualizar os dados do usuário");
      Logger.error(e.message);
      return { success: false, message: "Erro ao atualiazar os dados", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR };
    }

    return { success: true, message: "Dados atualizados", STATUS_CODE: HttpStatus.OK }
  }

  async deleteUser(email: string): Promise<ResponseProps> {

    try {
      const deleted = await this.userModel.deleteOne({ email });
      if (deleted.deletedCount === 0) {
        Logger.warn("Conta não encontrada para deleção")
        return { success: true, message: "Conta não encontrada para deleção", STATUS_CODE: HttpStatus.NOT_FOUND }
      }
    } catch (e) {
      Logger.error("Erro ao deletar conta")
      Logger.error(e.message);
      return { success: true, message: "Falha ao tentar deletar conta", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
    return { success: true, message: "Conta deletada", STATUS_CODE: HttpStatus.OK }
  }

  async deleteAccount(email: string, password: string): Promise<ResponseProps> {
    try {
      const user = await this.userModel.findOne({ email })

      if (user === null) {
        Logger.warn("Usuário " + email + " não encontrado")
        return { success: false, message: "Usuário não encontrado!", STATUS_CODE: HttpStatus.NOT_FOUND }
      }

      const isPassOk = await comparePassword(password, user.passwordHash);

      if(!isPassOk) {
        return {success: false, message: "Senha incorreta", STATUS_CODE: HttpStatus.UNAUTHORIZED}
      }

      await this.userModel.deleteOne({email});

    } catch (e) {
      Logger.error("Erro ao deletar conta")
      Logger.error(e.message);
      return {
        success: true,
        message: "Falha ao tentar deletar conta",
        STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
    return {success: true, message: "Conta deletada", STATUS_CODE: HttpStatus.OK}
  }
}
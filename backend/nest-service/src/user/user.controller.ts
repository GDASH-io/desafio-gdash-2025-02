import { Controller, Get, Post, Body, Res, Req, Patch, Delete, HttpStatus, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import type { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { AdminGuard } from "src/guards/AdminGuard";
import { SecurityGuard } from "src/guards/SecurityGuard";

export type PatchOptions = {
  name?: string;
  email?: string;
  password?: string;
  tokenVersion?: number
}

@Controller("user")
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  @Get("/me")
  me(
    @Req() req: Request
  ) {
    const user = req["user"]
    return {
      success: true,
      message: "logado, durma em paz",
      name: user.name,
      email: user.email
    }
  }

  @Post("/signup")
  async createUser(
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("password") password: string,
    @Res() res: Response,
  ) {
    const userCreated = await this.userService.createUser({ name, password, email, isAdmin: false })
    return res.status(userCreated.STATUS_CODE).send({ success: userCreated.success, message: userCreated.message });
  }

  @Post("/login")
  async loginUser(
    @Body("email") email: string,
    @Body("password") password: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    if (req["cookies"]["logged"] === "true" && req["cookies"]["jwt"]) {
      return res.status(HttpStatus.CONFLICT).send({ success: false, message: "Usuário já está logado" });
    }
    const logado = await this.userService.loginUser({ email, password })

    if (!logado.success) {
      return res.status(logado.STATUS_CODE).send({ success: logado.success, message: logado.message })
    }

    const payload = {
      id: logado.id,
      email,
      tokenVersion: logado.tokenVersion,
      name: logado.name,
      isAdmin: logado.isAdmin
    };

    const accessToken = this.jwtService.sign(payload);

    res.cookie("jwt", accessToken, { httpOnly: true });
    res.cookie("logged", "true", { httpOnly: true });
    return res.status(logado.STATUS_CODE).send({
      success: logado.success,
      message: "Logado com sucesso!",
      name: logado.name,
      email,
      isAdmin: logado.isAdmin
    });

  }

  @Post("/logout")
  async logoutUser(
    @Res() res: Response,
    @Req() req: Request
  ) {
    const logoutedUser = await this.userService.logoutUser(req["user"]["email"])
    res.clearCookie("jwt", { httpOnly: true });
    res.clearCookie("logged", { httpOnly: true });

    return res.status(logoutedUser.STATUS_CODE).send({ success: logoutedUser.success, message: logoutedUser.message })
  }

  @Get("/search")
  async getUser(
    @Body("email") email: string,
    @Res() res: Response
  ) {
    const user = await this.userService.getUser(email)
    return res.status(user.STATUS_CODE).send({ success: user.success, message: user.message })
  }

  @Get("/all")
  @UseGuards(AdminGuard)
  async getAllUsers(
    @Res() res: Response
  ) {
    const users = await this.userService.getAllUsers();
    return res.status(users.STATUS_CODE).send({ success: users.success, message: users.message })
  }

  @Patch("/update")
  @UseGuards(SecurityGuard)
  async updateUser(
    @Body("email") email: string,
    @Body("update") update: PatchOptions,
    @Res() res: Response
  ) {
    const updated = await this.userService.updateUser(email, update)

    return res.status(updated.STATUS_CODE).send({ success: updated.success, message: updated.message });
  }

  @Delete("/delete")
  @UseGuards(SecurityGuard)
  async deleteUser(
    @Body("email") email: string,
    @Res() res: Response
  ) {

    const deletedUser = await this.userService.deleteUser(email);

    return res.status(deletedUser.STATUS_CODE).send({ success: deletedUser.success, message: deletedUser.message });
  }

  @Delete("/delete/account")
  @UseGuards(SecurityGuard)
  async deleteAccount(
    @Body("password") password:string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const data = await this.userService.deleteAccount(req["user"]["email"], password);

    return res.status(data.STATUS_CODE).send({success: data.success, message: data.message})

  }
}
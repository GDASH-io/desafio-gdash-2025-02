import { HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, type Response } from "express";
import { UserService } from "src/user/user.service";

interface AuthRequest extends Request {
  user: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) { }

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const { jwt }:{jwt: string} = req["cookies"];
    if (jwt === undefined) {
      Logger.warn("Usuáiro deslogado");
      Logger.warn("Acesso negago");
      return res.status(HttpStatus.UNAUTHORIZED).send({ success: false, message: "Necessário fazer login!" });
    }


    try {
      const payload = await this.jwtService.verify(jwt.replace("Bearer ", ""));
      req.user = payload
      const user = (await this.userService.getUser(payload["email"])).message
      if (user["tokenVersion"] !== payload["tokenVersion"]) {
        Logger.error("Token de acesso inválido")
        res.cookie("logged", "false", {httpOnly: true})
        return res.status(HttpStatus.UNAUTHORIZED).send({ success: false, message: "Faça login novamente" });
      }
    } catch (err) {
      Logger.error(err.message);
      if (err.message === "invalid signature") {
        return res.status(HttpStatus.UNAUTHORIZED).send({ success: false, message: "Token de acesso inválido" });
      }
      return res.status(HttpStatus.UNAUTHORIZED).send({ success: false, message: "Acesso negado" });
    }

    next()
  }
}
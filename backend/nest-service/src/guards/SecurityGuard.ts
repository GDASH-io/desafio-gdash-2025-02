import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private readonly userService: UserService
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user, body } = req
    const res = (await this.userService.getUser(user.email))
    if (!res.success) {
      throw new HttpException({
        success: res.success,
        message: res.message
      },
        res.STATUS_CODE
      )
    }
    const isAdmin = res.message["isAdmin"]; // true
    const isOwner = user.email === body.email; // false
    if (!isAdmin && !isOwner) {
      throw new HttpException({
        success: false,
        message: "Ação negada"
      },
        HttpStatus.UNAUTHORIZED
      )
    }

    return true
  }
}
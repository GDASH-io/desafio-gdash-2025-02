import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    let isAdmin = false;
    if(req.user) {
      isAdmin = req.user.isAdmin
    }
    
    if(!isAdmin) {
      throw new HttpException({
        success: false,
        message: "Acesso negado"
      },
      HttpStatus.UNAUTHORIZED
    )
    }
    
    return true
  }
}
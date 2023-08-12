import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import UnauthorizedException from 'src/exceptions/unauthorized.exception';
import { UserTokensService } from 'src/modules/tokens/tokens.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private userTokenService: UserTokensService,
    private userService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers.authorization;
      const bearerToken = authorization.split(" ")[1];
    
      const userData = this.userTokenService.verifyAccess(bearerToken);
      if (!bearerToken || !userData) throw new UnauthorizedException();

      const token = userData.id && await this.userTokenService.findByUserId(userData.id);

      if (!token) throw new UnauthorizedException();

      request.user = await this.userService.findById(token.userId);

      return true;
    } catch(e) {
      throw new UnauthorizedException();
    }
  }
}

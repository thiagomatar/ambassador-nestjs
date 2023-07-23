import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const jwt = request.cookies['jwt'];
      const { id, scope } = await this.jwtService.verifyAsync(jwt);

      if (!id) {
        return false;
      }

      const is_ambassador =
        request.path.toString().indexOf('api/ambassador') >= 0;
      request.user = await this.userService.findOne({ where: { id } });
      return (
        (is_ambassador && scope == 'ambassador') ||
        (!is_ambassador && scope === 'admin')
      );
    } catch (e) {
      return false;
    }
  }
}

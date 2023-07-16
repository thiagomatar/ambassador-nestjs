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
      const { id } = await this.jwtService.verifyAsync(jwt);
      if (!id) {
        return false;
      }
      request.user = await this.userService.findOne({ id });
      return true;
    } catch (e) {
      return false;
    }
  }
}

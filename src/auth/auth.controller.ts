import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { request, Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(['admin/register', 'ambassador/register'])
  async register(@Req() request: Request, @Body() body: RegisterDto) {
    const { password_confirm, ...data } = body;

    if (body.password !== password_confirm) {
      throw new BadRequestException('Passwords dont match');
    }

    const user = await this.userService.findOne({ email: data.email });

    if (user) {
      throw new BadRequestException(`The email ${data.email} already exists.`);
    }

    const hashed = bcrypt.hashSync(body.password, 12);

    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: request.path === '/api/ambassador/register',
    });
  }

  @Post(['admin/login', 'ambassador/login'])
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const adminLogin = request.path === '/api/admin/login';

    if (user.is_ambassador && adminLogin) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
      scope: adminLogin ? 'admin' : 'ambassador',
    });

    response.cookie('jwt', jwt, { httpOnly: true });
    return {
      message: 'success',
    };
  }

  @Get(['/admin/user', '/ambassador/user'])
  @UseGuards(AuthGuard)
  async user(@Req() request) {
    if (request.path === '/api/admin/user') {
      return request.user;
    }
    const user = await this.userService.findOne({
      where: { id: request.user.id },
      relations: ['orders', 'orders.orderItems'],
    });

    const { orders, password, ...data } = user;

    return {
      ...user,
      revenue: user.revenue,
    };
  }

  @Post(['admin/logout', 'ambassador/logout'])
  async logout(@Res({ passthrough: true }) response: Response) {
    this.invalidateCookie(response);

    return {
      message: 'success',
    };
  }

  @Put(['admin/users/info', 'ambassador/user/info'])
  @UseGuards(AuthGuard)
  async updateInfo(
    @Req() request,
    @Body('first_name') first_name: string,
    @Body('last_name') last_name: string,
    @Body('email') email: string,
  ) {
    const user = request.user;
    return this.userService.update(user.id, {
      first_name,
      last_name,
      email,
    });
  }

  @Put(['admin/users/password', 'ambassador/users/password'])
  @UseGuards(AuthGuard)
  async updatePassword(
    @Req() request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords dont match');
    }

    const user = request.user;
    return this.userService.update(user.id, {
      password: await bcrypt.hash(password, 12),
    });
  }

  private invalidateCookie(response) {
    response.clearCookie('jwt');
  }
}

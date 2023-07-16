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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response, Request, request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {
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
      is_ambassador: false,
    });
  }
  @Post('admin/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
    });

    response.cookie('jwt', jwt, { httpOnly: true });
    return {
      message: 'success',
    };
  }

  @Get('/admin/user')
  @UseGuards(AuthGuard)
  async user(@Req() request) {
    return request.user;
  }

  @Post('admin/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    this.invalidateCookie(response);

    return {
      message: 'success',
    };
  }

  @Put('admin/users/info')
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

  @Put('admin/users/password')
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

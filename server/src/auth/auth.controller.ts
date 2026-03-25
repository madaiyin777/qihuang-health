import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Result } from '../common/utils/result';
import { JwtAuthGuard, CurrentUser } from '../common/guards/jwt-auth.guard';

@Controller('user')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 登录（支持用户名密码 + 微信 code）
  @Post('login')
  async login(@Body() body: any) {
    // 用户名密码登录
    if (body.username && body.password) {
      const result = await this.authService.login(body.username, body.password);
      return Result.ok(result);
    }

    // 微信登录
    if (body.code) {
      const result = await this.authService.wechatLogin(
        body.code,
        body.nickname,
        body.avatar,
      );
      return Result.ok(result);
    }

    return Result.fail('请提供用户名密码或微信code');
  }

  // 获取当前用户信息
  @Get('info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@CurrentUser() user: any) {
    return Result.ok({
      userId: user.userId,
      username: user.username,
      name: user.name,
      phone: user.phone,
      userType: user.userType,
      avatar: user.avatar,
    });
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserProfile } from '../modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserProfile)
    private userRepo: Repository<UserProfile>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // 用户名密码登录
  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await this.userRepo.save(user);

    // 生成 JWT
    const token = this.jwtService.sign({
      sub: user.userId,
      username: user.username,
      userType: user.userType,
    });

    return {
      token,
      userId: user.userId,
      username: user.username,
      name: user.name,
      userType: user.userType,
    };
  }

  // 微信小程序登录（保留）
  async wechatLogin(code: string, nickname?: string, avatar?: string) {
    const openid = await this.getWechatOpenid(code);
    let user = await this.userRepo.findOne({ where: { username: openid } });

    if (!user) {
      user = this.userRepo.create({
        userId: `USR${Date.now()}`,
        username: openid,
        password: '',
        name: nickname || '用户',
        avatar: avatar || '',
        userType: 'user',
      });
      await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({
      sub: user.userId,
      username: user.username,
      userType: user.userType,
    });

    return { token, userId: user.userId };
  }

  private async getWechatOpenid(code: string): Promise<string> {
    const appid = this.config.get('WECHAT_APPID');
    const secret = this.config.get('WECHAT_SECRET');

    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.errcode) throw new Error();
      return data.openid;
    } catch {
      if (this.config.get('NODE_ENV') === 'development') {
        return `mock_${code}_${Date.now()}`;
      }
      throw new UnauthorizedException('微信登录失败');
    }
  }

  async validateUser(payload: any) {
    const user = await this.userRepo.findOne({ where: { userId: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    career?: string,
  ) {
    const payload: UserPayload = { sub: userId, email, role, career };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Correo incorrecto');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.career,
    );
    await this.userService.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        career: user.career ?? null,
      },
    };
  }

  async signOut(email: string) {
    if (!email) {
      return { message: 'Sesión cerrada' };
    }
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Correo incorrecto');

    await this.userService.updateRefreshToken(user.id, null);

    return {
      message: 'Logout exitoso',
    };
  }

  async signUp(
    email: string,
    pass: string,
    fullName: string,
    role?: UserRole,
    career?: string,
  ) {
    const existing = await this.userService.findByEmail(email);
    if (existing) throw new UnauthorizedException('Correo ya registrado');

    const createdUser = await this.userService.create({
      name: fullName,
      email,
      password: pass,
      role: role ?? 'student',
      career: career || undefined,
    });

    const tokens = await this.generateTokens(
      createdUser.id,
      createdUser.email,
      createdUser.role,
      createdUser.career,
    );
    await this.userService.updateRefreshToken(
      createdUser.id,
      tokens.refresh_token,
    );

    return {
      ...tokens,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        career: createdUser.career ?? null,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acceso denegado');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Acceso denegado');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new ForbiddenException('Token expirado o inválido');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.career,
    );
    await this.userService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }
}

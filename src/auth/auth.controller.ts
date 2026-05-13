import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body() signInDto: Record<string, string>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  signOut(@Body() signOutDto: Record<string, string>) {
    return this.authService.signOut(signOutDto?.email);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  signUp(@Body() signUpDto: Record<string, string>) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.fullName,
      signUpDto.role,
      signUpDto.career,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('refresh')
  refreshTokens(@Body() body: Record<string, string>) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}

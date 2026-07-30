import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto, RefreshTokenDto } from './dto/login-user.dto';
import {
  ResendVerificationDto,
  VerifyEmailDto,
} from './dto/verify-email.dto';
import type { JwtPayload } from './interfaces/jwt.interface';
import { CurrentUser } from '../../decorators/user-decorators';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { Public } from '../../decorators/public-decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created; verification email sent' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email by clicking the link from your email' })
  @ApiQuery({ name: 'token', description: 'Verification token from email link' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  verifyEmailFromLink(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token from verification link' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent if account exists' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email or username' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 403, description: 'Email not verified' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Returns new access and refresh tokens' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile with sessions and organizations' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke refresh token session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }
}

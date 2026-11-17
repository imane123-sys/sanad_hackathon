import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Authentication & Sessions')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account on SANAD' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using verification token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Ip() ip: string) {
    return this.authService.verifyEmail(dto.token, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user, establish session and return JWT token' })
  @ApiResponse({ status: 200, description: 'Authentication successful, session created' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out current session and revoke its token' })
  @ApiResponse({ status: 200, description: 'Current session successfully revoked' })
  async logout(@CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.authService.logout(user.id, user.sessionId, ip);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active and known sessions/devices for current user' })
  @ApiResponse({ status: 200, description: 'List of sessions returned' })
  async getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSessions(user.id, user.sessionId);
  }

  @Post('sessions/:id/revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke and disconnect a specific session/device' })
  @ApiResponse({ status: 200, description: 'Specified session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId, ip);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect and revoke all active sessions across all devices' })
  @ApiResponse({ status: 200, description: 'All active sessions revoked' })
  async logoutAll(@CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.authService.logoutAll(user.id, ip);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  @ApiResponse({ status: 200, description: 'Reset token generated if user exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string) {
    return this.authService.forgotPassword(dto, ip);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Reset password using valid token and automatically revoke all active sessions',
  })
  @ApiResponse({ status: 200, description: 'Password reset and all sessions revoked' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Ip() ip: string) {
    return this.authService.resetPassword(dto, ip);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }
}

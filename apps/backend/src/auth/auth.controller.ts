import { Controller, Post, Body, Get, Delete, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { PublicUser } from '@/shared/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ global: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ global: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    return user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.refreshToken(user.id, user.email);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.deleteAccount(user.id);
  }

  @Patch('budget-limit')
  @UseGuards(JwtAuthGuard)
  setBudgetLimit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { budgetLimit: number | null },
  ) {
    return this.authService.setBudgetLimit(user.id, body.budgetLimit);
  }

  // ─── Password Reset (public endpoints) ───────────────────────────────────────

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    // Returns { sent: true } always — we never reveal whether email exists
    const result = await this.authService.requestPasswordReset(body.email);
    // In production, email the token. Here we return it in dev mode.
    return { sent: true, ...(process.env.NODE_ENV !== 'production' ? { token: result.token } : {}) };
  }

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  // ─── Authenticated account mutations ─────────────────────────────────────────

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @Patch('currency')
  @UseGuards(JwtAuthGuard)
  async changeCurrency(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { currency: string },
  ) {
    return this.authService.changeCurrency(user.id, body.currency);
  }
}

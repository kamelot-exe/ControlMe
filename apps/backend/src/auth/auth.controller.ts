import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { PublicUser } from "@/shared/types";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { ChangeCurrencyDto } from "./dto/change-currency.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SetBudgetLimitDto } from "./dto/set-budget-limit.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AuthenticatedUser } from "./interfaces/authenticated-user.interface";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ global: { limit: 10, ttl: 60000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ global: { limit: 10, ttl: 60000 } })
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    return user;
  }

  @Throttle({ global: { limit: 20, ttl: 60000 } })
  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Delete("account")
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.deleteAccount(user.id);
  }

  @Patch("budget-limit")
  @UseGuards(JwtAuthGuard)
  setBudgetLimit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetBudgetLimitDto,
  ) {
    if (dto.budgetLimit === undefined) {
      throw new BadRequestException("budgetLimit is required");
    }

    return this.authService.setBudgetLimit(user.id, dto.budgetLimit);
  }

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.requestPasswordReset(dto.email);

    return {
      sent: true,
      ...(process.env.NODE_ENV !== "production" ? { token: result.token } : {}),
    };
  }

  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Patch("password")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Patch("currency")
  @UseGuards(JwtAuthGuard)
  async changeCurrency(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangeCurrencyDto,
  ) {
    return this.authService.changeCurrency(user.id, dto.currency);
  }
}

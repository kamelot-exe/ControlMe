import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { SUPPORTED_CURRENCIES } from "../common/constants/domain.constants";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import type { AuthSession, PublicUser } from "@/shared/types";

type UserRecord = {
  budgetLimit: number | null;
  createdAt: Date;
  currency: string;
  email: string;
  id: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        currency: dto.currency || "USD",
      },
      select: {
        id: true,
        email: true,
        currency: true,
        budgetLimit: true,
        createdAt: true,
      },
    });

    await this.prisma.notificationSettings.create({
      data: {
        userId: user.id,
        prechargeReminderDays: 1,
        smartAlertsEnabled: true,
      },
    });

    return this.buildAuthSession(user);
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthSession(user);
  }

  async validateUser(userId: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        currency: true,
        budgetLimit: true,
        createdAt: true,
      },
    });

    return user ? this.toPublicUser(user) : null;
  }

  async deleteAccount(userId: string) {
    await this.prisma.$transaction([
      this.prisma.subscriptionUsage.deleteMany({
        where: { subscription: { userId } },
      }),
      this.prisma.subscription.deleteMany({ where: { userId } }),
      this.prisma.notificationSettings.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { success: true };
  }

  async setBudgetLimit(userId: string, budgetLimit: number | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { budgetLimit },
      select: {
        id: true,
        email: true,
        currency: true,
        budgetLimit: true,
        createdAt: true,
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<Omit<AuthSession, "user">> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        email: string;
        sub: string;
        type: "refresh";
      }>(refreshToken, {
        secret: this.getRefreshSecret(),
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          currency: true,
          budgetLimit: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return this.createTokens(user.id, user.email);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async requestPasswordReset(email: string): Promise<{ token: string | null }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { token: null };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetTokenExpiry: expiry,
      },
    });

    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException("Token and new password are required");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: tokenHash },
    });

    if (!user || !user.passwordResetTokenExpiry) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (user.passwordResetTokenExpiry < new Date()) {
      throw new BadRequestException(
        "Reset token has expired. Please request a new one.",
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    return { success: true };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        "New password must be at least 8 characters",
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  }

  async changeCurrency(userId: string, currency: string) {
    const normalizedCurrency = currency.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency as never)) {
      throw new BadRequestException(
        `Unsupported currency. Allowed: ${SUPPORTED_CURRENCIES.join(", ")}`,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { currency: normalizedCurrency },
      select: {
        id: true,
        email: true,
        currency: true,
        budgetLimit: true,
        createdAt: true,
      },
    });
  }

  private toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      email: user.email,
      currency: user.currency as PublicUser["currency"],
      budgetLimit: user.budgetLimit,
      createdAt: user.createdAt,
    };
  }

  private async buildAuthSession(user: UserRecord): Promise<AuthSession> {
    const tokens = await this.createTokens(user.id, user.email);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  private async createTokens(userId: string, email: string) {
    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email, type: "access" }),
      this.jwtService.signAsync(
        { sub: userId, email, type: "refresh" },
        {
          secret: this.getRefreshSecret(),
          expiresIn: this.getRefreshExpiresIn(),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpiresIn:
        this.configService.get<string>("JWT_EXPIRES_IN") ?? "7d",
      refreshTokenExpiresIn: this.getRefreshExpiresIn(),
    };
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>("JWT_REFRESH_SECRET") ??
      this.configService.get<string>("JWT_SECRET") ??
      ""
    );
  }

  private getRefreshExpiresIn(): string {
    return this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "30d";
  }
}

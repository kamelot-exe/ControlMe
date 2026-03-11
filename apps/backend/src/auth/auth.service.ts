import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        currency: dto.currency || "USD",
      },
    });

    // Create default notification settings
    await this.prisma.notificationSettings.create({
      data: {
        userId: user.id,
        prechargeReminderDays: 1,
        smartAlertsEnabled: true,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(dto: LoginDto) {
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

    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return userWithoutPassword;
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

  async refreshToken(userId: string, email: string) {
    const token = this.jwtService.sign({ sub: userId, email });
    return { token };
  }

  // ─── Password Reset ─────────────────────────────────────────────────────────

  /**
   * Generates a reset token and returns it (caller is responsible for emailing it).
   * We always return success even if the email doesn't exist (security best practice).
   */
  async requestPasswordReset(email: string): Promise<{ token: string | null }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether the email exists
      return { token: null };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiry,
      },
    });

    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException("Token and new password are required");
    }

    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token },
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

  // ─── Change Password ─────────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException("Current password is incorrect");

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

  // ─── Change Currency ─────────────────────────────────────────────────────────

  async changeCurrency(userId: string, currency: string) {
    const allowed = [
      "USD",
      "EUR",
      "GBP",
      "RUB",
      "JPY",
      "CAD",
      "AUD",
      "CHF",
      "CNY",
      "INR",
    ];
    if (!allowed.includes(currency.toUpperCase())) {
      throw new BadRequestException(
        `Unsupported currency. Allowed: ${allowed.join(", ")}`,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { currency: currency.toUpperCase() },
      select: {
        id: true,
        email: true,
        currency: true,
        budgetLimit: true,
        createdAt: true,
      },
    });
  }
}

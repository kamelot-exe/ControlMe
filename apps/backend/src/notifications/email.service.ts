import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly configured: boolean;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly rateLimitPerMinute: number;
  private readonly sendTimestamps: number[] = [];

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST");
    const port = this.config.get<number>("SMTP_PORT") ?? 587;
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    this.from =
      this.config.get<string>("SMTP_FROM") ??
      "ControlMe <noreply@controlme.app>";
    this.maxRetries = Math.max(
      Number(this.config.get<string>("EMAIL_MAX_RETRIES") ?? 3),
      1,
    );
    this.retryBaseDelayMs = Math.max(
      Number(this.config.get<string>("EMAIL_RETRY_BASE_DELAY_MS") ?? 1000),
      250,
    );
    this.rateLimitPerMinute = Math.max(
      Number(this.config.get<string>("EMAIL_RATE_LIMIT_PER_MINUTE") ?? 20),
      1,
    );

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        ...(user && pass ? { auth: { user, pass } } : {}),
      });
      this.configured = true;
      this.logger.log(`Email transport configured -> ${host}:${port}`);
    } else {
      this.transporter = null;
      this.configured = false;
      this.logger.warn(
        "SMTP not configured (SMTP_HOST missing). Emails will be logged to console instead.",
      );
    }
  }

  async send(payload: EmailPayload): Promise<void> {
    await this.waitForRateLimitSlot();

    if (!this.configured || !this.transporter) {
      this.logger.log(
        `[EMAIL DEV] To: ${payload.to} | Subject: ${payload.subject}\n` +
          payload.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      );
      return;
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      attempt += 1;

      try {
        await this.transporter.sendMail({
          from: this.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });

        this.logger.log(
          `Email sent -> ${payload.to} | ${payload.subject} | attempt ${attempt}/${this.maxRetries}`,
        );
        return;
      } catch (error) {
        lastError = this.normalizeError(error);

        if (!this.isRetryableError(error) || attempt >= this.maxRetries) {
          break;
        }

        const delayMs = this.retryBaseDelayMs * 2 ** (attempt - 1);
        this.logger.warn(
          `Email send failed for ${payload.to} (attempt ${attempt}/${this.maxRetries}): ${lastError.message}. Retrying in ${delayMs}ms.`,
        );
        await this.delay(delayMs);
      }
    }

    const failure = lastError ?? new Error("Unknown email delivery failure");
    this.logger.error(
      `Failed to send email to ${payload.to} after ${attempt} attempt(s): ${failure.message}`,
    );
    throw failure;
  }

  private async waitForRateLimitSlot() {
    while (true) {
      const now = Date.now();
      this.pruneTimestamps(now);

      if (this.sendTimestamps.length < this.rateLimitPerMinute) {
        this.sendTimestamps.push(now);
        return;
      }

      const oldest = this.sendTimestamps[0];
      const delayMs = Math.max(250, 60_000 - (now - oldest) + 25);
      this.logger.warn(
        `Email rate limit reached (${this.rateLimitPerMinute}/minute). Waiting ${delayMs}ms.`,
      );
      await this.delay(delayMs);
    }
  }

  private pruneTimestamps(now: number) {
    while (
      this.sendTimestamps.length > 0 &&
      now - this.sendTimestamps[0] >= 60_000
    ) {
      this.sendTimestamps.shift();
    }
  }

  private isRetryableError(error: unknown) {
    if (!error || typeof error !== "object") {
      return true;
    }

    const candidate = error as {
      code?: string;
      responseCode?: number;
    };

    if (typeof candidate.responseCode === "number") {
      if (candidate.responseCode >= 500) {
        return true;
      }

      return [421, 450, 451, 452].includes(candidate.responseCode);
    }

    return [
      "ECONNECTION",
      "ECONNRESET",
      "EAI_AGAIN",
      "ESOCKET",
      "ETIMEDOUT",
    ].includes(candidate.code ?? "");
  }

  private normalizeError(error: unknown) {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

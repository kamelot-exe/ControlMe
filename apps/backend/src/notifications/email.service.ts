import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  private readonly configured: boolean;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT') ?? 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from = this.config.get<string>('SMTP_FROM') ?? 'ControlMe <noreply@controlme.app>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.configured = true;
      this.logger.log(`Email transport configured → ${host}:${port}`);
    } else {
      this.configured = false;
      this.logger.warn(
        'SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing). ' +
        'Emails will be logged to console instead.',
      );
    }
  }

  async send(payload: EmailPayload): Promise<void> {
    if (!this.configured || !this.transporter) {
      // Dev fallback — log to console
      this.logger.log(
        `[EMAIL DEV] To: ${payload.to} | Subject: ${payload.subject}\n` +
        payload.html.replace(/<[^>]+>/g, '').trim(),
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      this.logger.log(`Email sent → ${payload.to} | ${payload.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${payload.to}: ${(err as Error).message}`);
    }
  }

  /** Build a subscription-charge reminder email */
  static buildChargeReminderHtml(
    userName: string,
    items: Array<{ name: string; price: number; currency: string; daysUntil: number }>,
  ): string {
    const rows = items
      .map(
        (i) =>
          `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid #1e2d3d;color:#F9FAFB;">${i.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e2d3d;color:#4ADE80;text-align:right;">
              ${i.currency} ${i.price.toFixed(2)}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e2d3d;color:#F59E0B;text-align:right;">
              ${i.daysUntil === 0 ? 'Today' : i.daysUntil === 1 ? 'Tomorrow' : `In ${i.daysUntil}d`}
            </td>
          </tr>`,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#060B16;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0E1628;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#060B16,#0E1628);padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:22px;font-weight:800;color:#F9FAFB;letter-spacing:-0.5px;">⚡ ControlMe</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#F9FAFB;">
                Upcoming charges reminder
              </h1>
              <p style="margin:0 0 24px;color:#9CA3AF;font-size:14px;">
                Hi${userName ? ` ${userName}` : ''}! Here are your subscriptions charging soon:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #1e2d3d;">
                <thead>
                  <tr style="background:#131f30;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;">Service</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;">Amount</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;">When</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:#6B7280;">
                You're receiving this because you enabled charge reminders in ControlMe.
                <a href="https://controlme.app/settings" style="color:#4ADE80;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly verifyEmailTemplate: Handlebars.TemplateDelegate;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const port = parseInt(this.config.get<string>('SMTP_PORT', '587'), 10);
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configured: ${user}@${host}:${port}`);
    } else {
      this.logger.warn(
        'SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env',
      );
    }

    const templateSource = readFileSync(
      this.getTemplatePath('verify-email.hbs'),
      'utf-8',
    );
    this.verifyEmailTemplate = Handlebars.compile(templateSource);
  }

  private getTemplatePath(filename: string): string {
    const candidates = [
      join(process.cwd(), 'templates', filename),
      join(process.cwd(), 'dist', 'templates', filename),
      join(process.cwd(), 'dist', filename),
    ];

    for (const path of candidates) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error(`Email template not found: ${filename}`);
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const baseUrl = this.config.get<string>(
      'API_BASE_URL',
      'http://localhost:3000',
    );
    const apiVersion = this.config.get<string>('APP_VERSION', 'v1');
    const appName = this.config.get<string>('APP_NAME', 'Multi-Tenants');
    const verificationUrl = `${baseUrl}/api/${apiVersion}/auth/verify-email?token=${token}`;
    const from = this.config.get<string>(
      'MAIL_FROM',
      'noreply@multi-tenants.local',
    );

    const html = this.verifyEmailTemplate({
      appName,
      name,
      verificationUrl,
      expiry: '24 hours',
      year: new Date().getFullYear(),
    });

    const text = [
      `Hi ${name},`,
      '',
      'Thanks for creating your account. Verify your email address using the link below:',
      verificationUrl,
      '',
      `This link expires in 24 hours.`,
      '',
      `If you didn't create this account, you can safely ignore this email.`,
      '',
      `© ${new Date().getFullYear()} ${appName}. All rights reserved.`,
    ].join('\n');

    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured. Verification link for ${email}: ${verificationUrl}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from,
      to: email,
      subject: `Verify your ${appName} account`,
      text,
      html,
    });
  }
}

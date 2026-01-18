import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private mailer: MailerService,
  ) {}

  async getEmailIntegration(workspaceId: string) {
    const integration = await this.prisma.emailIntegration.findUnique({
      where: { workspaceId },
    });

    if (!integration) {
      // Return default Lite CRM integration
      return {
        provider: 'LITE_CRM',
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPass: null,
        smtpSecure: false,
        fromEmail: null,
        fromName: null,
      };
    }

    return {
      ...integration,
      smtpPass: integration.smtpPass && integration.smtpPass.length > 0 ? decrypt(integration.smtpPass) : null,
    };
  }

  async updateEmailIntegration(
    workspaceId: string,
    config: {
      provider?: string;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPass?: string;
      smtpSecure?: boolean;
      fromEmail?: string;
      fromName?: string;
    },
  ) {
    const existing = await this.prisma.emailIntegration.findUnique({
      where: { workspaceId },
    });

    const data: any = {
      workspaceId,
      provider: config.provider || 'LITE_CRM',
      smtpHost: config.smtpHost || null,
      smtpPort: config.smtpPort || null,
      smtpUser: config.smtpUser || null,
      smtpPass: config.smtpPass ? encrypt(config.smtpPass) : null,
      smtpSecure: config.smtpSecure || false,
      fromEmail: config.fromEmail || null,
      fromName: config.fromName || null,
    };

    if (existing) {
      return this.prisma.emailIntegration.update({
        where: { workspaceId },
        data,
      });
    } else {
      return this.prisma.emailIntegration.create({
        data,
      });
    }
  }

  async sendEmail(
    workspaceId: string,
    to: string,
    subject: string,
    body: string,
  ) {
    const integration = await this.getEmailIntegration(workspaceId);

    if (integration.provider === 'LITE_CRM') {
      // Use default Lite CRM SMTP
      await this.mailer.sendMail({
        to,
        subject,
        html: body,
      });
    } else {
      // Use custom SMTP
      if (!integration.smtpHost || !integration.smtpPort || !integration.smtpUser || !integration.smtpPass) {
        throw new Error('Custom SMTP configuration is incomplete');
      }

      const customMailer = require('nodemailer').createTransport({
        host: integration.smtpHost,
        port: integration.smtpPort,
        secure: integration.smtpSecure,
        auth: {
          user: integration.smtpUser,
          pass: integration.smtpPass,
        },
      });

      await customMailer.sendMail({
        from: integration.fromEmail || integration.smtpUser,
        to,
        subject,
        html: body,
      });
    }

    this.logger.log(`Email sent to ${to} for workspace ${workspaceId}`);
  }

  async testEmailConfiguration(workspaceId: string, to?: string) {
    const integration = await this.getEmailIntegration(workspaceId);
    const targetEmail = to?.trim();
    if (!targetEmail) {
      throw new Error('Test email address is required');
    }

    if (integration.provider === 'LITE_CRM') {
      // Test default SMTP
      await this.mailer.sendMail({
        to: targetEmail,
        subject: 'Test Email from Lite CRM',
        html: '<p>This is a test email from Lite CRM.</p>',
      });
    } else {
      // Test custom SMTP
      if (!integration.smtpHost || !integration.smtpPort || !integration.smtpUser || !integration.smtpPass) {
        throw new Error('Custom SMTP configuration is incomplete');
      }

      const customMailer = require('nodemailer').createTransport({
        host: integration.smtpHost,
        port: integration.smtpPort,
        secure: integration.smtpSecure,
        auth: {
          user: integration.smtpUser,
          pass: integration.smtpPass,
        },
      });

      await customMailer.sendMail({
        from: integration.fromEmail || integration.smtpUser,
        to: targetEmail,
        subject: 'Test Email from Lite CRM',
        html: '<p>This is a test email from your custom SMTP configuration.</p>',
      });
    }

    return { success: true, message: 'Test email sent successfully' };
  }
}

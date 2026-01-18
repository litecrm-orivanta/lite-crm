import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailTemplates } from '../notifications/email-templates';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes
  private readonly MAX_ATTEMPTS = 3; // Max verification attempts

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  /**
   * Generate a 6-digit OTP
   */
  private generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP to email for signup or password reset
   */
  async sendOTP(email: string, purpose: 'signup' | 'password_reset'): Promise<{ message: string }> {
    // Clean up expired OTPs
    await this.prisma.emailOTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Check for existing valid OTP
    const existingOTP = await this.prisma.emailOTP.findFirst({
      where: {
        email,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If valid OTP exists and was created less than 1 minute ago, don't send again (rate limiting)
    if (existingOTP) {
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
      if (timeSinceCreation < 60000) { // 1 minute
        throw new BadRequestException('Please wait before requesting another OTP');
      }
      // Mark old OTP as used
      await this.prisma.emailOTP.update({
        where: { id: existingOTP.id },
        data: { used: true },
      });
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Save OTP to database
    await this.prisma.emailOTP.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
      },
    });

    // Send OTP via email using premium template
    const subject = purpose === 'signup' 
      ? 'Verify Your Email - Lite CRM' 
      : 'Password Reset OTP - Lite CRM';
    
    const html = EmailTemplates.getOTP(otp, purpose, `${this.OTP_EXPIRY_MINUTES} minutes`);

    try {
      await this.notifications.sendEmail(email, subject, html);
      this.logger.log(`OTP sent to ${email} for ${purpose}`);
    } catch (error: any) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return { message: `OTP has been sent to ${email}` };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string, purpose: 'signup' | 'password_reset'): Promise<boolean> {
    // Find OTP record
    const otpRecord = await this.prisma.emailOTP.findFirst({
      where: {
        email,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Increment attempts
    await this.prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify OTP
    if (otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP. Please check and try again.');
    }

    // Mark OTP as used
    await this.prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    this.logger.log(`OTP verified for ${email} (${purpose})`);
    return true;
  }

  /**
   * Clean up expired OTPs (can be called by a scheduled job)
   */
  async cleanupExpiredOTPs() {
    const deleted = await this.prisma.emailOTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    this.logger.log(`Cleaned up ${deleted.count} expired OTPs`);
    return deleted.count;
  }
}

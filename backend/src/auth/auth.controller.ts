import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OtpService } from './otp.service';
import { InAppNotificationsService } from '../notifications/in-app-notifications.service';
import { randomUUID } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
    private audit: AuditService,
    private otpService: OtpService,
    private notifications: InAppNotificationsService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Post('send-signup-otp')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async sendSignupOTP(@Req() req: Request, @Body() body: { email: string }) {
    try {
      // Check if email already exists
      const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        throw new ConflictException('Email already exists. Please log in instead.');
      }
      const result = await this.otpService.sendOTP(body.email, 'signup');
      await this.audit.log({
        action: 'auth.signup_otp_sent',
        resource: 'auth',
        metadata: { email: body.email },
        ...this.getRequestMeta(req),
      });
      return result;
    } catch (error: any) {
      await this.audit.log({
        action: 'auth.signup_otp_failed',
        resource: 'auth',
        metadata: { email: body.email, error: error.message },
        ...this.getRequestMeta(req),
      });
      throw error;
    }
  }

  @Post('verify-signup-otp')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async verifySignupOTP(@Req() req: Request, @Body() body: { email: string; otp: string }) {
    try {
      // Check if email already exists before verifying OTP
      const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        throw new ConflictException('Email already exists. Please log in instead.');
      }

      await this.otpService.verifyOTP(body.email, body.otp, 'signup');
      await this.audit.log({
        action: 'auth.signup_otp_verified',
        resource: 'auth',
        metadata: { email: body.email },
        ...this.getRequestMeta(req),
      });
      return { verified: true, message: 'OTP verified successfully' };
    } catch (error: any) {
      await this.audit.log({
        action: 'auth.signup_otp_verification_failed',
        resource: 'auth',
        metadata: { email: body.email, error: error.message },
        ...this.getRequestMeta(req),
      });
      throw error;
    }
  }

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async signup(@Req() req: Request, @Body() body: any) {
    // Check if email already exists (double check, even if OTP was verified)
    const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new ConflictException('Email already exists. Please log in instead.');
    }

    // Verify OTP first if provided
    if (body.otp && body.email) {
      await this.otpService.verifyOTP(body.email, body.otp, 'signup');
    }

    // Backward compatible: supports both old & new payloads
    const result = await this.auth.signup(body);
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    const sessionId = randomUUID();
    if (user) {
      await this.audit.log({
        actorId: user.id,
        action: 'auth.signup',
        resource: 'user',
        resourceId: user.id,
        workspaceId: user.workspaceId,
        metadata: { email: user.email, role: user.role, otpVerified: !!body.otp },
        ...this.getRequestMeta(req),
      });
      await this.audit.log({
        actorId: user.id,
        action: 'session.start',
        resource: 'session',
        resourceId: sessionId,
        workspaceId: user.workspaceId,
        metadata: { sessionId },
        ...this.getRequestMeta(req),
      });
    }
    return { ...result, sessionId };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async login(@Req() req: Request, @Body() body: { email: string; password: string }) {
    try {
      const result = await this.auth.login(body.email, body.password);
      const user = await this.prisma.user.findUnique({ where: { email: body.email } });
      const sessionId = randomUUID();
      if (user) {
        await this.audit.log({
          actorId: user.id,
          action: 'auth.login',
          resource: 'session',
          resourceId: sessionId,
          workspaceId: user.workspaceId,
          metadata: { email: user.email, role: user.role, sessionId },
          ...this.getRequestMeta(req),
        });
        await this.audit.log({
          actorId: user.id,
          action: 'session.start',
          resource: 'session',
          resourceId: sessionId,
          workspaceId: user.workspaceId,
          metadata: { sessionId },
          ...this.getRequestMeta(req),
        });
      }
      return { ...result, sessionId };
    } catch (error) {
      await this.audit.log({
        action: 'auth.login_failed',
        resource: 'auth',
        metadata: { email: body.email },
        ...this.getRequestMeta(req),
      });
      throw error;
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async forgotPassword(@Req() req: Request, @Body() body: { email: string; mode?: 'link' | 'otp' }) {
    const mode = body.mode || 'link'; // Default to link mode for backward compatibility

    if (mode === 'otp') {
      // Send OTP for password reset
      try {
        const result = await this.otpService.sendOTP(body.email, 'password_reset');
        await this.audit.log({
          action: 'auth.password_reset_otp_sent',
          resource: 'auth',
          metadata: { email: body.email, mode: 'otp' },
          ...this.getRequestMeta(req),
        });
        return result;
      } catch (error: any) {
        await this.audit.log({
          action: 'auth.password_reset_otp_failed',
          resource: 'auth',
          metadata: { email: body.email, mode: 'otp', error: error.message },
          ...this.getRequestMeta(req),
        });
        throw error;
      }
    }

    // Original link-based password reset
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.ts:30',message:'forgotPassword endpoint called',data:{email:body.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const result = await this.auth.forgotPassword(body.email);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.ts:35',message:'forgotPassword success',data:{hasResult:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      await this.audit.log({
        action: 'auth.password_reset_request',
        resource: 'auth',
        metadata: { email: body.email },
        ...this.getRequestMeta(req),
      });
      return result;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.ts:40',message:'forgotPassword error',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async resetPassword(@Req() req: Request, @Body() body: { token?: string; email?: string; otp?: string; password: string; mode?: 'link' | 'otp' }) {
    const mode = body.mode || (body.token ? 'link' : 'otp');

    if (mode === 'otp') {
      // Reset password using OTP
      if (!body.email || !body.otp) {
        throw new BadRequestException('Email and OTP are required for OTP-based password reset');
      }

      // Verify OTP
      await this.otpService.verifyOTP(body.email, body.otp, 'password_reset');

      // Get user and reset password
      const user = await this.prisma.user.findUnique({ where: { email: body.email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(body.password, 10);
      const passwordChangedAt = new Date();
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          passwordHash,
          // Store password change timestamp in metadata (can be added as a field later)
        },
      });

      // Store password change timestamp in audit metadata for tracking
      await this.audit.log({
        actorId: user.id,
        action: 'auth.password_changed',
        resource: 'auth',
        metadata: { 
          email: body.email, 
          mode: 'otp',
          passwordChangedAt: passwordChangedAt.toISOString(),
        },
        ...this.getRequestMeta(req),
      });

      // Notify super admins about password change
      try {
        const superAdmins = await this.prisma.user.findMany({
          where: { isSuperAdmin: true },
          select: { id: true, email: true },
        });

        if (superAdmins.length > 0) {
          await this.notifications.sendNotification({
            title: 'Password Change Alert',
            body: `User ${user.email} (${user.name || 'Unknown'}) changed their password via OTP on ${passwordChangedAt.toLocaleString()}. If this was not authorized, please investigate immediately.`,
            targets: {
              userIds: superAdmins.map(admin => admin.id),
            },
          });
        }
      } catch (error: any) {
        // Log error but don't fail password reset
        console.error('Failed to notify super admins about password change:', error.message);
      }

      return { 
        message: 'Password reset successfully',
        passwordChangedAt: passwordChangedAt.toISOString(),
      };
    }

    // Original token-based password reset
    if (!body.token) {
      throw new BadRequestException('Token is required for link-based password reset');
    }
    const result = await this.auth.resetPassword(body.token, body.password);
    await this.audit.log({
      action: 'auth.password_changed',
      resource: 'auth',
      metadata: { tokenUsed: true, mode: 'link' },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string; email: string },
    @Body() body: { sessionId?: string },
  ) {
    const sessionId = body?.sessionId || randomUUID();
    await this.audit.log({
      actorId: user.userId,
      action: 'session.end',
      resource: 'session',
      resourceId: sessionId,
      workspaceId: user.workspaceId,
      metadata: { sessionId, role: user.role, email: user.email },
      ...this.getRequestMeta(req),
    });
    return { success: true };
  }

  @Post('session/heartbeat')
  @UseGuards(JwtAuthGuard)
  async heartbeat(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string; email: string },
    @Body() body: { sessionId?: string },
  ) {
    const sessionId = body?.sessionId;
    if (!sessionId) return { success: false };
    await this.audit.log({
      actorId: user.userId,
      action: 'session.heartbeat',
      resource: 'session',
      resourceId: sessionId,
      workspaceId: user.workspaceId,
      metadata: { sessionId, role: user.role, email: user.email },
      ...this.getRequestMeta(req),
    });
    return { success: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = req.user as { accessToken: string };

    const frontendCallback =
      process.env.FRONTEND_URL 
        ? `${process.env.FRONTEND_URL}/auth/google/callback`
        : 'http://localhost:8080/auth/google/callback';

    return res.redirect(
      `${frontendCallback}?token=${accessToken}`,
    );
  }
}

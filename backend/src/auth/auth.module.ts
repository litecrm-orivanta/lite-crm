import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MeController } from './auth.protected.controller';
import { GoogleStrategy } from './google.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { AuditModule } from '../audit/audit.module';
import { OtpService } from './otp.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
        ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
        ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {}),
      },
    }),
    PrismaModule,
    NotificationModule,
    AuditModule,
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, OtpService, JwtStrategy, GoogleStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, OtpService],
})
export class AuthModule {}

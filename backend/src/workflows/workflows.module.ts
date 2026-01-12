import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { N8nProxyController } from './n8n-proxy.controller';
import { N8nUserService } from './n8n-user.service';
import { WorkflowConfigurationService } from './workflow-configuration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WorkflowsService, N8nUserService, WorkflowConfigurationService],
  controllers: [WorkflowsController, N8nProxyController],
  exports: [WorkflowsService, N8nUserService, WorkflowConfigurationService],
})
export class WorkflowsModule {}

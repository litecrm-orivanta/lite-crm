import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { RazorpayService } from '../payments/razorpay.service';
import { PrismaService } from '../prisma/prisma.service';
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

@Controller('admin/payment-gateway')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PaymentGatewayController {
  private readonly logger = new Logger(PaymentGatewayController.name);

  constructor(
    private razorpayService: RazorpayService,
    private prisma: PrismaService,
  ) {}

  @Get('active-environment')
  async getActiveEnvironment() {
    // Get the environment that is currently set to useForPayments
    const activeConfig = await this.prisma.paymentGatewayConfig.findFirst({
      where: { useForPayments: true },
      select: { environment: true },
    });

    return {
      environment: (activeConfig?.environment || 'UAT') as 'UAT' | 'PRODUCTION',
    };
  }

  @Put('active-environment')
  async setActiveEnvironment(
    @Body() body: { environment: 'UAT' | 'PRODUCTION' },
  ) {
    // Ensure only one environment is set to useForPayments
    await this.prisma.$transaction(async (tx) => {
      // Set all to false
      await tx.paymentGatewayConfig.updateMany({
        data: { useForPayments: false },
      });

      // Set the selected one to true
      await tx.paymentGatewayConfig.updateMany({
        where: { environment: body.environment },
        data: { useForPayments: true },
      });
    });

    this.logger.log(`Active payment environment set to ${body.environment}`);
    return { success: true, environment: body.environment };
  }

  @Get('config')
  async getConfig(@Query('environment') environment?: string) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:39',message:'getConfig entry',data:{environment},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const env = (environment || 'UAT') as 'UAT' | 'PRODUCTION';
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:41',message:'before findUnique',data:{env},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const config = await this.prisma.paymentGatewayConfig.findUnique({
        where: { environment: env },
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:45',message:'findUnique result',data:{configFound:!!config,hasKeyId:!!config?.razorpayKeyId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (!config) {
        return {
          environment: env,
          razorpayKeyId: '',
          razorpayKeySecret: '',
          webhookUrl: null,
          webhookSecret: null,
          isActive: false,
        };
      }

      return {
        ...config,
        razorpayKeySecret: '***', // Don't return actual secret
        webhookSecret: config.webhookSecret ? '***' : null, // Don't return actual webhook secret
      };
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:58',message:'getConfig error',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  @Put('config')
  async updateConfig(
    @Body()
    body: {
      environment: 'UAT' | 'PRODUCTION';
      razorpayKeyId: string;
      razorpayKeySecret: string;
      webhookUrl?: string;
      webhookSecret?: string;
      isActive: boolean;
    },
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:60',message:'updateConfig entry',data:{environment:body.environment,hasKeyId:!!body.razorpayKeyId,hasSecret:!!body.razorpayKeySecret},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.logger.log(`Updating payment gateway config for ${body.environment}`);

    const encryptedSecret = encrypt(body.razorpayKeySecret);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:74',message:'before findUnique existing',data:{environment:body.environment},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      const existing = await this.prisma.paymentGatewayConfig.findUnique({
        where: { environment: body.environment },
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:78',message:'existing config check',data:{existingFound:!!existing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const encryptedWebhookSecret = body.webhookSecret ? encrypt(body.webhookSecret) : undefined;

      if (existing) {
        const updateData: any = {
          razorpayKeyId: body.razorpayKeyId,
          razorpayKeySecret: encryptedSecret,
          isActive: body.isActive,
        };

        if (body.webhookUrl !== undefined) {
          updateData.webhookUrl = body.webhookUrl || null;
        }
        if (body.webhookSecret !== undefined) {
          updateData.webhookSecret = encryptedWebhookSecret || null;
        }

        const result = await this.prisma.paymentGatewayConfig.update({
          where: { environment: body.environment },
          data: updateData,
        });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:87',message:'update success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return result;
      } else {
        const result = await this.prisma.paymentGatewayConfig.create({
          data: {
            environment: body.environment,
            razorpayKeyId: body.razorpayKeyId,
            razorpayKeySecret: encryptedSecret,
            webhookUrl: body.webhookUrl || null,
            webhookSecret: encryptedWebhookSecret || null,
            isActive: body.isActive,
          },
        });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:98',message:'create success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return result;
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment-gateway.controller.ts:101',message:'updateConfig error',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  @Post('test')
  async testPayment(
    @Body()
    body: {
      environment?: 'UAT' | 'PRODUCTION';
      amount?: number;
    },
  ) {
    this.logger.log(`Testing payment gateway for ${body.environment || 'UAT'}`);
    // Razorpay receipt must be max 40 characters
    const receipt = `test_${Date.now()}`.slice(0, 40);
    const order = await this.razorpayService.createOrder(
      body.amount || 100,
      'INR',
      receipt,
      body.environment || 'UAT',
    );
    return {
      success: true,
      order,
      message: 'Test order created successfully. Use Razorpay test cards to complete payment.',
    };
  }
}

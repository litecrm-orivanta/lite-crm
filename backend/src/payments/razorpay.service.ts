import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
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
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get the active payment environment (the one with useForPayments = true)
   */
  async getActiveEnvironment(): Promise<'UAT' | 'PRODUCTION'> {
    const activeConfig = await this.prisma.paymentGatewayConfig.findFirst({
      where: { useForPayments: true },
      select: { environment: true },
    });

    return (activeConfig?.environment || 'UAT') as 'UAT' | 'PRODUCTION';
  }

  async getConfig(environment?: 'UAT' | 'PRODUCTION') {
    // If no environment specified, use the active one
    if (!environment) {
      environment = await this.getActiveEnvironment();
    }

    try {
      const config = await this.prisma.paymentGatewayConfig.findUnique({
        where: { environment },
      });

      if (!config) {
        throw new BadRequestException(`Razorpay ${environment} configuration not found. Please configure it in the Admin Dashboard > Payment Gateway tab.`);
      }

      if (!config.isActive) {
        throw new BadRequestException(`Razorpay ${environment} configuration is inactive. Please activate it in the Admin Dashboard > Payment Gateway tab.`);
      }

      return {
        ...config,
        razorpayKeySecret: decrypt(config.razorpayKeySecret),
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error fetching Razorpay config: ${error.message}`);
      throw new BadRequestException(`Failed to load Razorpay ${environment} configuration. Please configure it in the Admin Dashboard.`);
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    orderId?: string,
    environment: 'UAT' | 'PRODUCTION' = 'UAT',
  ) {
    const config = await this.getConfig(environment);
    
    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });

    // Razorpay receipt must be max 40 characters
    const receipt = (orderId || `order_${Date.now()}`).slice(0, 40);
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency.toUpperCase(),
      receipt,
      notes: {
        environment,
      },
    });

    this.logger.log(`Created Razorpay order: ${order.id} for amount ${amount} ${currency}`);
    return {
      ...order,
      key_id: config.razorpayKeyId, // Include key_id for frontend
    };
  }

  async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
    environment: 'UAT' | 'PRODUCTION' = 'UAT',
  ) {
    const config = await this.getConfig(environment);

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isValid = generatedSignature === signature;

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    this.logger.log(`Payment verified: ${paymentId} for order ${orderId}`);
    return { valid: true, paymentId, orderId };
  }

  async getPaymentDetails(paymentId: string, environment: 'UAT' | 'PRODUCTION' = 'UAT') {
    const config = await this.getConfig(environment);
    
    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });

    return razorpay.payments.fetch(paymentId);
  }
}

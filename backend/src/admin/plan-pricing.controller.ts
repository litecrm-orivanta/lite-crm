import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { PlanPricingService } from './plan-pricing.service';
import { PlanType } from '@prisma/client';

@Controller('admin/plan-pricing')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PlanPricingController {
  private readonly logger = new Logger(PlanPricingController.name);

  constructor(private planPricingService: PlanPricingService) {}

  @Get()
  async getAllPricing() {
    return this.planPricingService.getAllPricing();
  }

  @Get(':planType')
  async getPricing(@Param('planType') planType: string) {
    return this.planPricingService.getPricing(planType as PlanType);
  }

  @Put(':planType')
  async updatePricing(
    @Param('planType') planType: string,
    @Body()
    body: {
      individualPrice: number;
      organizationPrice: number;
      currency?: string;
      billingCycle?: string;
      isActive?: boolean;
    },
  ) {
    return this.planPricingService.updatePricing(
      planType as PlanType,
      body.individualPrice,
      body.organizationPrice,
      body.currency || 'INR',
      body.billingCycle || 'monthly',
      body.isActive !== undefined ? body.isActive : true,
    );
  }
}

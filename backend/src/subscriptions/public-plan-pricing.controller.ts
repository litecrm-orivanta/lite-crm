import { Controller, Get } from '@nestjs/common';
import { PlanPricingService } from '../admin/plan-pricing.service';

/**
 * Public controller for plan pricing (no auth required)
 * Used by the Upgrade page to display current pricing
 */
@Controller('plan-pricing')
export class PublicPlanPricingController {
  constructor(private planPricingService: PlanPricingService) {}

  @Get()
  async getAllPricing() {
    return this.planPricingService.getAllPricing();
  }
}

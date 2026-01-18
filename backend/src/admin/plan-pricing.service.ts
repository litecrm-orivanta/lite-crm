import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class PlanPricingService {
  private readonly logger = new Logger(PlanPricingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all plan pricing
   */
  async getAllPricing() {
    const pricing = await this.prisma.planPricing.findMany({
      orderBy: {
        planType: 'asc',
      },
    });

    // If no pricing exists, initialize with defaults
    if (pricing.length === 0) {
      await this.initializeDefaultPricing();
      return this.prisma.planPricing.findMany({
        orderBy: {
          planType: 'asc',
        },
      });
    }

    return pricing;
  }

  /**
   * Get pricing for a specific plan
   */
  async getPricing(planType: PlanType) {
    const pricing = await this.prisma.planPricing.findUnique({
      where: { planType },
    });

    if (!pricing) {
      // Initialize default pricing for this plan
      await this.initializeDefaultPricing();
      return this.prisma.planPricing.findUnique({
        where: { planType },
      });
    }

    return pricing;
  }

  /**
   * Update pricing for a plan
   */
  async updatePricing(
    planType: PlanType,
    individualPrice: number,
    organizationPrice: number,
    currency: string = 'INR',
    billingCycle: string = 'monthly',
    isActive: boolean = true,
  ) {
    if (individualPrice < 0 || organizationPrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    const existing = await this.prisma.planPricing.findUnique({
      where: { planType },
    });

    if (existing) {
      const updated = await this.prisma.planPricing.update({
        where: { planType },
        data: {
          individualPrice,
          organizationPrice,
          currency,
          billingCycle,
          isActive,
        },
      });

      this.logger.log(`Updated pricing for ${planType}: Individual ₹${individualPrice}, Organization ₹${organizationPrice}`);
      return updated;
    } else {
      const created = await this.prisma.planPricing.create({
        data: {
          planType,
          individualPrice,
          organizationPrice,
          currency,
          billingCycle,
          isActive,
        },
      });

      this.logger.log(`Created pricing for ${planType}: Individual ₹${individualPrice}, Organization ₹${organizationPrice}`);
      return created;
    }
  }

  /**
   * Initialize default pricing
   */
  private async initializeDefaultPricing() {
    const defaults = [
      { planType: PlanType.FREE, individualPrice: 0, organizationPrice: 0 },
      { planType: PlanType.STARTER, individualPrice: 899, organizationPrice: 1999 },
      { planType: PlanType.PROFESSIONAL, individualPrice: 1599, organizationPrice: 3999 },
      { planType: PlanType.BUSINESS, individualPrice: 0, organizationPrice: 7999 },
      { planType: PlanType.ENTERPRISE, individualPrice: 0, organizationPrice: 0 },
    ];

    for (const plan of defaults) {
      await this.prisma.planPricing.upsert({
        where: { planType: plan.planType },
        update: {},
        create: {
          planType: plan.planType,
          individualPrice: plan.individualPrice,
          organizationPrice: plan.organizationPrice,
          currency: 'INR',
          billingCycle: 'monthly',
          isActive: true,
        },
      });
    }

    this.logger.log('Initialized default plan pricing');
  }

  /**
   * Get price for a plan based on workspace type
   */
  async getPriceForPlan(planType: PlanType, workspaceType: 'SOLO' | 'ORG' = 'SOLO'): Promise<number> {
    const pricing = await this.getPricing(planType);
    
    if (!pricing) {
      throw new NotFoundException(`Pricing for plan ${planType} not found`);
    }
    
    if (workspaceType === 'ORG') {
      return pricing.organizationPrice;
    }
    
    return pricing.individualPrice;
  }
}

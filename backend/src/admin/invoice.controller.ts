import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(private invoiceService: InvoiceService) {}

  /**
   * Get invoices for current user's subscription
   */
  @Get('me')
  async getMyInvoices(@CurrentUser() user: { workspaceId: string }) {
    return this.invoiceService.getInvoicesForWorkspace(user.workspaceId);
  }

  /**
   * Get invoice by ID
   */
  @Get(':id')
  async getInvoice(@Param('id') invoiceId: string) {
    return this.invoiceService.getInvoice(invoiceId);
  }

  /**
   * Generate invoice PDF
   */
  @Get(':id/pdf')
  async generateInvoicePDF(@Param('id') invoiceId: string) {
    const pdfUrl = await this.invoiceService.generateInvoicePDF(invoiceId);
    return { pdfUrl };
  }

  /**
   * Admin: Create invoice
   */
  @Post()
  @UseGuards(AdminGuard)
  async createInvoice(
    @Body()
    body: {
      subscriptionId: string;
      amount: number;
      currency?: string;
      dueDate?: Date;
    },
  ) {
    this.logger.log(`Admin creating invoice for subscription: ${body.subscriptionId}`);
    return this.invoiceService.createInvoice(
      body.subscriptionId,
      body.amount,
      body.currency,
      body.dueDate,
    );
  }

  /**
   * Admin: Mark invoice as sent
   */
  @Patch(':id/send')
  @UseGuards(AdminGuard)
  async markInvoiceSent(@Param('id') invoiceId: string) {
    return this.invoiceService.markInvoiceSent(invoiceId);
  }
}

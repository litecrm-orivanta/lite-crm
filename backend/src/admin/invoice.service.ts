import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create invoice
   */
  async createInvoice(
    subscriptionId: string,
    amount: number,
    currency: string = 'USD',
    dueDate?: Date,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        workspace: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        subscriptionId,
        invoiceNumber: this.generateInvoiceNumber(),
        amount,
        currency,
        status: InvoiceStatus.DRAFT,
        dueDate: dueDate || this.getDefaultDueDate(),
      },
      include: {
        subscription: {
          include: {
            workspace: true,
          },
        },
      },
    });

    this.logger.log(`Created invoice ${invoice.invoiceNumber} for subscription ${subscriptionId}`);
    return invoice;
  }

  /**
   * Get default due date (30 days from now)
   */
  private getDefaultDueDate(): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  }

  /**
   * Mark invoice as sent
   */
  async markInvoiceSent(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.SENT,
      },
    });
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(invoiceId: string, paymentId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        payment: {
          connect: { id: paymentId },
        },
      },
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string) {
    return this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });
  }

  /**
   * Get invoices for subscription
   */
  async getInvoicesForSubscription(subscriptionId: string) {
    return this.prisma.invoice.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Get invoices for workspace
   */
  async getInvoicesForWorkspace(workspaceId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      return [];
    }

    return this.getInvoicesForSubscription(subscription.id);
  }

  /**
   * Generate PDF for invoice (placeholder - implement with PDF library)
   */
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    const invoice = await this.getInvoice(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // TODO: Implement PDF generation using a library like pdfkit or puppeteer
    // For now, return a placeholder URL
    this.logger.warn('PDF generation not implemented. Returning placeholder URL.');

    const pdfUrl = `/invoices/${invoiceId}/pdf`;
    
    // Update invoice with PDF URL
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfUrl },
    });

    return pdfUrl;
  }
}

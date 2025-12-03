import { Request, Response } from 'express';
import { BillingService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { BillingDTO } from '../dto';

/**
 * Billing Controller
 * Handles HTTP requests for billing/invoice operations
 */
export class BillingController extends BaseController {
  constructor(private readonly billingService: BillingService) {
    super();
  }

  /**
   * Get billing history
   */
  getBillingHistory = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const billings = await this.billingService.getBillingHistory(accountId, limit);
    const billingDTOs = BillingDTO.fromArray(billings);

    return this.success(res, { billingHistory: billingDTOs });
  });

  /**
   * Get billing by ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { billingId } = req.params;

    const billing = await this.billingService.getById(billingId);
    const billingDTO = BillingDTO.from(billing);

    return this.success(res, { billing: billingDTO });
  });

  /**
   * Create invoice
   */
  createInvoice = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;
    const { amount, currency, description, subscriptionId, paymentProvider } = req.body;

    const billing = await this.billingService.createInvoice(
      accountId,
      amount,
      currency,
      description,
      subscriptionId,
      paymentProvider
    );
    const billingDTO = BillingDTO.from(billing);

    return this.success(res, { billing: billingDTO }, 201);
  });

  /**
   * Get invoice PDF URL
   */
  getInvoicePdf = catchAsync(async (req: Request, res: Response) => {
    const { billingId } = req.params;

    const pdfUrl = await this.billingService.getInvoicePdfUrl(billingId);

    return this.success(res, { invoicePdfUrl: pdfUrl });
  });

  /**
   * Get billing by invoice number
   */
  getByInvoiceNumber = catchAsync(async (req: Request, res: Response) => {
    const { invoiceNumber } = req.params;

    const billing = await this.billingService.getByInvoiceNumber(invoiceNumber);
    const billingDTO = BillingDTO.from(billing);

    return this.success(res, { billing: billingDTO });
  });
}


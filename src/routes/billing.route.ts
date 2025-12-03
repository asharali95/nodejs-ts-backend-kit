import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import {
  createInvoiceBodySchema,
  billingIdParamsSchema,
  invoiceNumberParamsSchema,
  getBillingHistoryQuerySchema,
} from '../validators';
import { accountIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { BillingController } from '../controllers';

const router = Router();

// Get controller from DI container
const getBillingController = (): BillingController => {
  return container.resolve<BillingController>('BillingController');
};

/**
 * @swagger
 * /api/v1/billing/account/{accountId}/history:
 *   get:
 *     summary: Get billing history for an account
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Billing history
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/account/:accountId/history',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  validate(getBillingHistoryQuerySchema, 'query'),
  (req, res, next) => getBillingController().getBillingHistory(req, res, next)
);

/**
 * @swagger
 * /api/v1/billing/account/{accountId}/invoice:
 *   post:
 *     summary: Create invoice
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, INR, CAD, AUD]
 *                 default: USD
 *               description:
 *                 type: string
 *               subscriptionId:
 *                 type: string
 *               paymentProvider:
 *                 type: string
 *                 default: stripe
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/account/:accountId/invoice',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  validate(createInvoiceBodySchema, 'body'),
  (req, res, next) => getBillingController().createInvoice(req, res, next)
);

/**
 * @swagger
 * /api/v1/billing/{billingId}:
 *   get:
 *     summary: Get billing by ID
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Billing details
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:billingId',
  authenticate,
  validate(billingIdParamsSchema, 'params'),
  (req, res, next) => getBillingController().getById(req, res, next)
);

/**
 * @swagger
 * /api/v1/billing/{billingId}/invoice-pdf:
 *   get:
 *     summary: Get invoice PDF URL
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: billingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice PDF URL
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:billingId/invoice-pdf',
  authenticate,
  validate(billingIdParamsSchema, 'params'),
  (req, res, next) => getBillingController().getInvoicePdf(req, res, next)
);

/**
 * @swagger
 * /api/v1/billing/invoice/{invoiceNumber}:
 *   get:
 *     summary: Get billing by invoice number
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Billing details
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/invoice/:invoiceNumber',
  authenticate,
  validate(invoiceNumberParamsSchema, 'params'),
  (req, res, next) => getBillingController().getByInvoiceNumber(req, res, next)
);

export default router;


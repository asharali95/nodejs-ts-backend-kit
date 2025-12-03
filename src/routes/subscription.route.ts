import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import {
  createSubscriptionBodySchema,
  updateSubscriptionPlanBodySchema,
  cancelSubscriptionBodySchema,
  subscriptionIdParamsSchema,
} from '../validators';
import { accountIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { SubscriptionController } from '../controllers';

const router = Router();

// Get controller from DI container
const getSubscriptionController = (): SubscriptionController => {
  return container.resolve<SubscriptionController>('SubscriptionController');
};

/**
 * @swagger
 * /api/v1/subscriptions/account/{accountId}:
 *   post:
 *     summary: Create subscription for an account
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planType
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *               paymentProvider:
 *                 type: string
 *                 default: stripe
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/account/:accountId',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  validate(createSubscriptionBodySchema, 'body'),
  (req, res, next) => getSubscriptionController().create(req, res, next)
);

/**
 * @swagger
 * /api/v1/subscriptions/account/{accountId}:
 *   get:
 *     summary: Get subscription by account ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription details
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/account/:accountId',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  (req, res, next) => getSubscriptionController().getByAccountId(req, res, next)
);

/**
 * @swagger
 * /api/v1/subscriptions/account/{accountId}/current-plan:
 *   get:
 *     summary: Get current plan features
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current plan features
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/account/:accountId/current-plan',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  (req, res, next) => getSubscriptionController().getCurrentPlan(req, res, next)
);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/plan:
 *   patch:
 *     summary: Update subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
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
 *               - planType
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:subscriptionId/plan',
  authenticate,
  validate(subscriptionIdParamsSchema, 'params'),
  validate(updateSubscriptionPlanBodySchema, 'body'),
  (req, res, next) => getSubscriptionController().updatePlan(req, res, next)
);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelAtPeriodEnd:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:subscriptionId/cancel',
  authenticate,
  validate(subscriptionIdParamsSchema, 'params'),
  validate(cancelSubscriptionBodySchema, 'body'),
  (req, res, next) => getSubscriptionController().cancel(req, res, next)
);

/**
 * @swagger
 * /api/v1/subscriptions/{subscriptionId}/resume:
 *   post:
 *     summary: Resume cancelled subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription resumed successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:subscriptionId/resume',
  authenticate,
  validate(subscriptionIdParamsSchema, 'params'),
  (req, res, next) => getSubscriptionController().resume(req, res, next)
);

export default router;


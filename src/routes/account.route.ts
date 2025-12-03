import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import {
  createAccountBodySchema,
  updateAccountBodySchema,
} from '../validators/account.validator';
import { accountIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { AccountController } from '../controllers';

const router = Router();

// Get controller from DI container
const getAccountController = (): AccountController => {
  return container.resolve<AccountController>('AccountController');
};

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Company
 *               subdomain:
 *                 type: string
 *                 example: mycompany
 *               plan:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *                 default: free
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         account:
 *                           $ref: '#/components/schemas/Account'
 */
router.post(
  '/',
  validate(createAccountBodySchema, 'body'),
  (req, res, next) => getAccountController().create(req, res, next)
);

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string

 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         account:
 *                           $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:accountId',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  (req, res, next) => getAccountController().getById(req, res, next)
);

/**
 * @swagger
 * /api/v1/accounts/{accountId}/trial-status:
 *   get:
 *     summary: Get trial status for an account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string

 *         description: Account ID
 *     responses:
 *       200:
 *         description: Trial status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         trial:
 *                           type: object
 *                           properties:
 *                             isTrial:
 *                               type: boolean
 *                             isActive:
 *                               type: boolean
 *                             isExpired:
 *                               type: boolean
 *                             daysRemaining:
 *                               type: number
 *                             trialStartDate:
 *                               type: string
 *                               format: date-time
 *                             trialEndDate:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:accountId/trial-status',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  (req, res, next) => getAccountController().getTrialStatus(req, res, next)
);

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   patch:
 *     summary: Update account
 *     tags: [Accounts]
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
 *             properties:
 *               name:
 *                 type: string
 *               subdomain:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *               status:
 *                 type: string
 *                 enum: [active, suspended, cancelled]
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         account:
 *                           $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:accountId',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  validate(updateAccountBodySchema, 'body'),
  (req, res, next) => getAccountController().update(req, res, next)
);

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   delete:
 *     summary: Delete account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string

 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:accountId',
  authenticate,
  validate(accountIdParamsSchema, 'params'),
  (req, res, next) => getAccountController().delete(req, res, next)
);

export default router;


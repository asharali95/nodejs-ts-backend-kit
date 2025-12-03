import { Router } from 'express';
import { validate, authRateLimiter } from '../middlewares';
import {
  registerBodySchema,
  loginBodySchema,
  requestPasswordResetBodySchema,
  resetPasswordBodySchema,
} from '../validators';
import { container } from '../di';
import { AuthController } from '../controllers';

const router = Router();

// Get controller from DI container
const getAuthController = (): AuthController => {
  return container.resolve<AuthController>('AuthController');
};

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user and create account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - accountName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               accountName:
 *                 type: string
 *                 example: My Company
 *               subdomain:
 *                 type: string
 *                 example: mycompany
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: User and account created successfully
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         account:
 *                           $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerBodySchema, 'body'),
  (req, res, next) => getAuthController().register(req, res, next)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         account:
 *                           $ref: '#/components/schemas/Account'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginBodySchema, 'body'),
  (req, res, next) => getAuthController().login(req, res, next)
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset requested
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(requestPasswordResetBodySchema, 'body'),
  (req, res, next) => getAuthController().requestPasswordReset(req, res, next)
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validate(resetPasswordBodySchema, 'body'),
  (req, res, next) => getAuthController().resetPassword(req, res, next)
);

export default router;


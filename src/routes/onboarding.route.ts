import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import { submitOnboardingBodySchema } from '../validators/onboarding.validator';
import { userIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { OnboardingController } from '../controllers';

const router = Router();

// Get controller from DI container
const getOnboardingController = (): OnboardingController => {
  return container.resolve<OnboardingController>('OnboardingController');
};

/**
 * @swagger
 * /api/v1/onboarding:
 *   post:
 *     summary: Submit onboarding survey (one-time only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *               - mainGoal
 *               - monthlyProjects
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [individual, architect, real_estate_company, other]
 *                 example: architect
 *                 description: Who are you?
 *               mainGoal:
 *                 type: string
 *                 enum: [personal_project, business_use, client_work, education_learning]
 *                 example: client_work
 *                 description: What's your main goal?
 *               monthlyProjects:
 *                 type: string
 *                 enum: ['1-5', '6-15', '16-30', '30+']
 *                 example: '6-15'
 *                 description: How many projects per month?
 *               companyName:
 *                 type: string
 *                 example: ABC Architects
 *                 description: Company name (optional)
 *               accountId:
 *                 type: string
 *                 format: uuid
 *                 description: Account ID (temporary, will be from auth)
 *     responses:
 *       201:
 *         description: Onboarding completed successfully
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
 *                         onboarding:
 *                           $ref: '#/components/schemas/Onboarding'
 *       409:
 *         description: Onboarding already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticate,
  validate(submitOnboardingBodySchema, 'body'),
  (req, res, next) => getOnboardingController().submit(req, res, next)
);

/**
 * @swagger
 * /api/v1/onboarding:
 *   get:
 *     summary: Get onboarding data by user ID
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding data
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
 *                         onboarding:
 *                           $ref: '#/components/schemas/Onboarding'
 *                           nullable: true
 *                         completed:
 *                           type: boolean
 */
router.get(
  '/',
  authenticate,
  (req, res, next) => getOnboardingController().getByUserId(req, res, next)
);

/**
 * @swagger
 * /api/v1/onboarding/{userId}/status:
 *   get:
 *     summary: Check onboarding completion status
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string

 *         description: User ID
 *     responses:
 *       200:
 *         description: Onboarding status
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
 *                         completed:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:userId/status',
  authenticate,
  validate(userIdParamsSchema, 'params'),
  (req, res, next) => getOnboardingController().checkStatus(req, res, next)
);

export default router;


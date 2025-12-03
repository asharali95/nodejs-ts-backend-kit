import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import { getActivitiesQuerySchema } from '../validators/activity.validator';
import { userIdParamsSchema, accountIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { ActivityController } from '../controllers';

const router = Router();

// Get controller from DI container
const getActivityController = (): ActivityController => {
  return container.resolve<ActivityController>('ActivityController');
};

/**
 * @swagger
 * /api/v1/activities/recent:
 *   get:
 *     summary: Get recent activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of activities to return
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string

 *         description: User ID (temporary, will be from auth)
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string

 *         description: Account ID (temporary, will be from auth)
 *     responses:
 *       200:
 *         description: List of recent activities
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
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/recent',
  authenticate,
  validate(getActivitiesQuerySchema, 'query'),
  (req, res, next) => getActivityController().getRecent(req, res, next)
);

/**
 * @swagger
 * /api/v1/activities/user/{userId}:
 *   get:
 *     summary: Get activities by user ID
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string

 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: List of user activities
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
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/user/:userId',
  authenticate,
  validate(userIdParamsSchema, 'params'),
  validate(getActivitiesQuerySchema, 'query'),
  (req, res, next) => getActivityController().getByUserId(req, res, next)
);

/**
 * @swagger
 * /api/v1/activities/account/{accountId}:
 *   get:
 *     summary: Get activities by account ID
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string

 *         description: Account ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: List of account activities
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
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
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
  validate(getActivitiesQuerySchema, 'query'),
  (req, res, next) => getActivityController().getByAccountId(req, res, next)
);

export default router;


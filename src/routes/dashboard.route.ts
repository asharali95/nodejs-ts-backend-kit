import { Router } from 'express';
import { authenticate } from '../middlewares';
import { container } from '../di';
import { DashboardController } from '../controllers';

const router = Router();

// Get controller from DI container
const getDashboardController = (): DashboardController => {
  return container.resolve<DashboardController>('DashboardController');
};

/**
 * @swagger
 * /api/v1/dashboard/{accountId}:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Dashboard]
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
 *         description: Dashboard analytics
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
 *                         analytics:
 *                           $ref: '#/components/schemas/DashboardAnalytics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:accountId',
  authenticate,
  (req, res, next) => getDashboardController().getAnalytics(req, res, next)
);

export default router;


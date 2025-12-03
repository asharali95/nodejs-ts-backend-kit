import { Router } from 'express';
import { validate, authenticate } from '../middlewares';
import { updateProfileBodySchema } from '../validators/profile.validator';
import { userIdParamsSchema } from '../validators/common.validator';
import { container } from '../di';
import { ProfileController } from '../controllers';

const router = Router();

// Get controller from DI container
const getProfileController = (): ProfileController => {
  return container.resolve<ProfileController>('ProfileController');
};

/**
 * @swagger
 * /api/v1/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
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
 *         description: User profile
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:userId',
  authenticate,
  validate(userIdParamsSchema, 'params'),
  (req, res, next) => getProfileController().getProfile(req, res, next)
);

/**
 * @swagger
 * /api/v1/profile/{userId}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string

 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               company:
 *                 type: string
 *                 example: Acme Corp
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:userId',
  authenticate,
  validate(userIdParamsSchema, 'params'),
  validate(updateProfileBodySchema, 'body'),
  (req, res, next) => getProfileController().updateProfile(req, res, next)
);

export default router;


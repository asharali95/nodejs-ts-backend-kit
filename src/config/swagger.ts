import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${config.APP_NAME} API`,
      version: '1.0.0',
      description: 'Scalable Express TypeScript backend API template with multi-tenant SaaS architecture',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Local development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Example production server (replace with your own)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            subdomain: { type: 'string' },
            plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
            status: { type: 'string', enum: ['active', 'suspended', 'cancelled'] },
            isTrial: { type: 'boolean' },
            trialStartDate: { type: 'string', format: 'date-time' },
            trialEndDate: { type: 'string', format: 'date-time' },
            trialDaysRemaining: { type: 'number' },
            isTrialActive: { type: 'boolean' },
            isTrialExpired: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            accountId: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['owner', 'admin', 'member'] },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            company: { type: 'string' },
            phone: { type: 'string' },
            profilePicture: { type: 'string', format: 'uri' },
            onboardingCompleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            accountId: { type: 'string' },
            activityType: { type: 'string' },
            description: { type: 'string' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Onboarding: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            accountId: { type: 'string' },
            userType: {
              type: 'string',
              enum: ['individual', 'architect', 'real_estate_company', 'other'],
            },
            mainGoal: {
              type: 'string',
              enum: ['personal_project', 'business_use', 'client_work', 'education_learning'],
            },
            monthlyProjects: { type: 'string', enum: ['1-5', '6-15', '16-30', '30+'] },
            companyName: { type: 'string' },
            completedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DashboardAnalytics: {
          type: 'object',
          properties: {
            totalFloorPlans: { type: 'number' },
            publishedPlans: { type: 'number' },
            teamMembers: { type: 'number' },
            storageUsed: { type: 'number', description: 'Storage used in MB' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Accounts', description: 'Account management endpoints' },
      { name: 'Dashboard', description: 'Dashboard analytics endpoints' },
      { name: 'Profile', description: 'User profile management endpoints' },
      { name: 'Activities', description: 'Recent activities endpoints' },
      { name: 'Onboarding', description: 'Onboarding survey endpoints' },
      { name: 'Subscriptions', description: 'Subscription management endpoints' },
      { name: 'Billing', description: 'Billing and invoice management endpoints' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/app.ts',
    './dist/routes/*.js',
    './dist/app.js',
  ], // Path to the API files (both TS and compiled JS)
};

export const swaggerSpec = swaggerJsdoc(options);


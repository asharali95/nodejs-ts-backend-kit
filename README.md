## SaaS Backend Template

 A reusable Express TypeScript backend template with multi-tenant SaaS architecture.  
 The included modules (accounts, auth, subscriptions, billing, etc.) act as an example setup you can keep, extend, or replace with your own domains.

## Project Structure

```
src/
├── app.ts                # Express app configuration (security, rate limiting, routes)
├── server.ts             # Server entry point & graceful shutdown
├── config/               # Configuration with environment validation
│   ├── index.ts          # Zod-based env validation + app config
│   └── swagger.ts        # Swagger/OpenAPI setup
├── controllers/          # Request handlers (extends BaseController)
│   ├── BaseController.ts
│   ├── auth.controller.ts
│   ├── account.controller.ts
│   ├── subscription.controller.ts
│   ├── billing.controller.ts
│   └── ...
├── services/             # Business logic (extends BaseService)
│   ├── BaseService.ts
│   ├── auth.service.ts
│   ├── account.service.ts
│   ├── subscription.service.ts
│   └── ...
├── repositories/         # Data access layer (Repository Pattern)
│   ├── BaseRepository.ts
│   ├── AccountRepository.ts
│   ├── UserRepository.ts
│   └── ...
├── models/               # Data models/interfaces
│   ├── auth.model.ts
│   ├── account.model.ts
│   ├── subscription.model.ts
│   └── ...
├── dto/                  # Data Transfer Objects
├── validators/           # Zod validation schemas
├── middlewares/          # Express middlewares (auth, validation, rate limiting)
├── errors/               # Custom error classes
├── interfaces/           # Shared interfaces (repos, services, providers)
├── di/                   # Dependency Injection container & wiring
├── utils/                # Utility functions (logging, JWT, password hashing, etc.)
├── providers/            # Email, SMS, MFA provider abstractions
├── payment-providers/    # Stripe and payment provider abstractions
├── queue/                # BullMQ jobs (e.g., trial expiration)
├── routes/               # API routes
└── scripts/
    └── scaffoldModule.ts # CLI to scaffold new modules
```

## Naming Convention

- Routes: `{module}.route.ts`
- Controllers: `{module}.controller.ts`
- Services: `{module}.service.ts`
- Models: `{module}.model.ts`
- Validators: `{module}.validator.ts`

Each folder has an `index.ts` file that exports all modules for easy importing.

## Using This as a Template

- **Core template**: configuration (`config`), DI container (`di`), base classes (`BaseController`, `BaseService`, `BaseRepository`), errors, middlewares, and utilities are **domain-agnostic** and can be reused as-is.
- **Example domains**: the existing modules (`accounts`, `auth`, `dashboard`, `subscriptions`, `billing`, etc.) show how to build features on top of the core.

To add a new domain/module:

1. **Model**: create `yourModule.model.ts` in `models/` (interfaces + domain logic helpers).
2. **Repository**: create `YourModuleRepository.ts` in `repositories/` that extends `BaseRepository`.
3. **Service**: create `yourModule.service.ts` in `services/` that extends `BaseService` and contains business logic only.
4. **Controller**: create `yourModule.controller.ts` in `controllers/` that extends `BaseController` and only coordinates HTTP <-> service calls.
5. **Routes**: add `yourModule.route.ts` in `routes/` that wires HTTP paths to controller methods.
6. **DI registration**: register repository, service, and controller in `di/setup.ts`.

This pattern keeps business logic in services, data access in repositories, and HTTP concerns in controllers, so swapping the floorplan example for another product is straightforward.

### Scaffolding New Modules

You can quickly scaffold a new module (model + repository + service + controller + route) using the built-in script:

```bash
npm run scaffold myModule
```

This will:

- Create:
  - `models/myModule.model.ts`
  - `repositories/MyModuleRepository.ts`
  - `services/myModule.service.ts`
  - `controllers/myModule.controller.ts`
  - `routes/myModule.route.ts`
- Print ready-to-paste snippets for:
  - DI registrations in `di/setup.ts`
  - Route export in `routes/index.ts`
  - Route mount in `app.ts`

## Features

- ✅ **TypeScript** for type safety
- ✅ **Express.js** web framework
- ✅ **Multi-tenant SaaS architecture** with Account system
- ✅ **Trial system** for MVP lead extraction (configurable trial length)
- ✅ **Design Patterns**:
  - Repository Pattern (data access abstraction)
  - Dependency Injection (loose coupling)
  - DTO Pattern (data transfer objects)
  - Base Classes (code reuse)
  - Strategy Pattern (auth, payments, notifications)
- ✅ **Security & hardening**:
  - Helmet (security headers)
  - CORS (configurable, currently wide-open for template use)
  - Gzip compression
  - Basic input sanitization (guards against simple XSS and query injection)
  - Centralized error handling
- ✅ **Rate limiting**:
  - Global IP-based rate limiting
  - Stricter rate limiting on auth routes
- ✅ **Authentication**:
  - Password-based auth with **bcrypt** hashing
  - Multi-strategy auth design (`password`, `oauth2`, `saml`, `sso` hooks)
  - JWT-based sessions
  - **MFA support** via pluggable TOTP provider
- ✅ **Account & subscription system** (free/trial/pro)
- ✅ **Notifications layer**:
  - Pluggable **email provider** (default: noop logger)
  - Pluggable **SMS provider** (default: noop logger)
- ✅ **Zod validation** for API requests and environment variables
- ✅ **Health check** & Swagger API docs
- ✅ **Modular and scalable** architecture

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Auth
- `POST /api/v1/auth/register` - Register a new user and create account (multi-tenant)
- `POST /api/v1/auth/login` - Login with multi-strategy auth (password + optional MFA, OAuth2/SAML/SSO hooks)
- `POST /api/v1/auth/forgot-password` - Request password reset (sends email/SMS via providers)
- `POST /api/v1/auth/reset-password` - Reset password using reset token

### Accounts
- `POST /api/v1/accounts` - Create a new account
- `GET /api/v1/accounts/:accountId` - Get account by ID
- `PATCH /api/v1/accounts/:accountId` - Update account
- `DELETE /api/v1/accounts/:accountId` - Delete account

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
API_VERSION=v1
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
TRIAL_DAYS=14
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_FROM_ADDRESS=no-reply@example.com
EMAIL_PROVIDER=noop
SMS_PROVIDER=noop
```

**Note:** Environment variables are validated using Zod on application startup. Invalid configurations will prevent the server from starting.

### Security & Rate Limiting

- **Helmet** and **compression** are enabled in `app.ts` by default.
- Rate limits are controlled via:
  - `RATE_LIMIT_WINDOW_MS` – window size in ms (default 15 minutes).
  - `RATE_LIMIT_MAX_REQUESTS` – max requests per IP per window (default 100).

### Notifications

- **EMAIL_PROVIDER** and **SMS_PROVIDER** are currently `noop` (log-only) for local development and templating.
- To integrate a real provider:
  - Implement `IEmailProvider` / `ISmsProvider` in `providers/`.
  - Update `EmailProviderFactory` / `SmsProviderFactory` to return your implementation based on config.

## Multi-Tenant Architecture

The backend is designed for SaaS applications with multiple tenants:

- **Accounts**: Each tenant has an account with a unique ID, name, subdomain, and plan
- **Users**: Users belong to an account and have roles (owner, admin, member)
- **Registration**: When a user registers, an account is automatically created and the user becomes the owner

## Validation

### Request Validation

Zod validators are used as middleware to validate request data:

```typescript
import { validate } from '../middlewares';
import { registerBodySchema } from '../validators';

router.post(
  '/register',
  validate(registerBodySchema, 'body'),
  authController.register
);
```

### Environment Variable Validation

Environment variables are validated on startup using Zod in `src/config/index.ts`. Invalid configurations will cause the application to exit with an error message.

## Authentication & MFA Guide

- **Registration** (`POST /api/v1/auth/register`):
  - Creates an account + owner user.
  - Password is hashed with **bcrypt** before storage.
- **Login** (`POST /api/v1/auth/login`):
  - Supports a `method` field (`password`, `oauth2`, `saml`, `sso` – non-password strategies are extensible hooks).
  - For password logins:
    - Required: `email`, `password`.
    - Optional: `mfaCode` (required if `mfaEnabled` for the user).
- **MFA (TOTP)**:
  - Backed by a pluggable MFA provider (`TotpMfaProvider`).
  - To enable MFA for a user:
    1. Generate a secret + otpauth URL via the MFA provider.
    2. Show QR code in the frontend.
    3. Verify a first code from the authenticator app.
    4. Persist `mfaEnabled = true` and `mfaSecret` for the user.
  - On subsequent logins, users with `mfaEnabled` must provide a valid `mfaCode`.
- **Password reset**:
  - `POST /api/v1/auth/forgot-password` – generates a secure token, stores its hash, and sends email/SMS via providers.
  - `POST /api/v1/auth/reset-password` – verifies token, sets new hashed password, clears reset fields, and returns a fresh JWT.

## Architecture Patterns

### Repository Pattern
Data access is abstracted through repositories, making it easy to switch data sources:
```typescript
// Repository handles all data operations
const account = await accountRepository.findById(id);
```

### Dependency Injection
Services and controllers receive dependencies through constructor injection:
```typescript
// Services are injected, not instantiated directly
constructor(private readonly accountService: AccountService) {}
```

### DTO Pattern
Data Transfer Objects control what data is exposed in API responses:
```typescript
// Convert model to DTO before sending response
const accountDTO = AccountDTO.from(account);
return this.success(res, { account: accountDTO });
```

### Base Classes
Common functionality is shared through base classes:
- `BaseRepository` - Common CRUD operations
- `BaseService` - Common service operations
- `BaseController` - Common response helpers

## Error Handling

### Custom Error Classes
The application uses custom error classes for better error handling:
- `AppError` - Base error class
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)

### Usage
```typescript
// In services/repositories
throw new NotFoundError('Account not found');
throw new ConflictError('Email already exists');
```

### catchAsync Middleware
Wraps async controller methods to automatically catch errors:
```typescript
export class MyController extends BaseController {
  myMethod = catchAsync(async (req: Request, res: Response) => {
    // Your async code here
    // Errors are automatically caught and passed to error handler
  });
}
```

Validation errors are automatically handled by the validator middleware and return a 400 status with detailed error messages.


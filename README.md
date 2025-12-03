## SaaS Backend Template

 A reusable Express TypeScript backend template with multi-tenant SaaS architecture.  
 The included modules (accounts, auth, subscriptions, billing, etc.) act as an example setup you can keep, extend, or replace with your own domains.

## Project Structure

```
src/
├── config/          # Configuration with environment validation
│   └── index.ts
├── controllers/     # Request handlers (extends BaseController)
│   ├── BaseController.ts
│   ├── auth.controller.ts
│   ├── account.controller.ts
│   └── index.ts
├── services/        # Business logic (extends BaseService)
│   ├── BaseService.ts
│   ├── auth.service.ts
│   ├── account.service.ts
│   └── index.ts
├── repositories/    # Data access layer (Repository Pattern)
│   ├── BaseRepository.ts
│   ├── AccountRepository.ts
│   ├── UserRepository.ts
│   └── index.ts
├── routes/          # API routes
│   ├── auth.route.ts
│   ├── account.route.ts
│   └── index.ts
├── models/          # Data models/interfaces
│   ├── auth.model.ts
│   ├── account.model.ts
│   └── index.ts
├── dto/             # Data Transfer Objects
│   ├── AccountDTO.ts
│   ├── UserDTO.ts
│   └── index.ts
├── validators/      # Zod validation schemas
│   ├── auth.validator.ts
│   ├── account.validator.ts
│   └── index.ts
├── middlewares/     # Express middlewares
│   ├── validator.middleware.ts
│   └── index.ts
├── errors/          # Custom error classes
│   ├── AppError.ts
│   └── index.ts
├── interfaces/      # TypeScript interfaces
│   ├── IRepository.ts
│   ├── IService.ts
│   └── index.ts
├── di/              # Dependency Injection
│   ├── Container.ts
│   ├── setup.ts
│   └── index.ts
├── utils/           # Utility functions
│   ├── catchAsync.ts
│   ├── idGenerator.ts
│   └── index.ts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
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

## Features

- ✅ **TypeScript** for type safety
- ✅ **Express.js** web framework
- ✅ **Multi-tenant SaaS architecture** with Account system
- ✅ **14-day trial system** for MVP lead extraction
- ✅ **Design Patterns**:
  - Repository Pattern (data access abstraction)
  - Dependency Injection (loose coupling)
  - DTO Pattern (data transfer objects)
  - Base Classes (code reuse)
  - Strategy Pattern (error handling)
- ✅ **Zod validation** for API requests and environment variables
- ✅ **Custom error classes** with proper HTTP status codes
- ✅ **Centralized error handling** with operational vs programming errors
- ✅ **Environment variable validation** with Zod
- ✅ **Health check endpoint**
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
- `POST /api/v1/auth/login` - Login user

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
```

**Note:** Environment variables are validated using Zod on application startup. Invalid configurations will prevent the server from starting.

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


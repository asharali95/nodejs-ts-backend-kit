import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple scaffolding script to generate a new module with:
 * - model
 * - repository
 * - service
 * - controller
 * - route
 *
 * Usage:
 *   npx ts-node src/scripts/scaffoldModule.ts moduleName
 *
 * This script is intentionally conservative: it does NOT auto-edit DI or route
 * registration files, but prints snippets you can paste into `di/setup.ts`
 * and `routes/index.ts` / `app.ts`.
 */

const [, , rawName] = process.argv;

if (!rawName) {
  console.error('Usage: npx ts-node src/scripts/scaffoldModule.ts <moduleName>');
  process.exit(1);
}

const toPascal = (name: string): string =>
  name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+(.)(\w*)/g, (_m, p1, p2) => p1.toUpperCase() + p2.toLowerCase())
    .replace(/^(.)/, (m) => m.toUpperCase());

const toCamel = (name: string): string => {
  const pascal = toPascal(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const moduleName = rawName.toLowerCase();
const PascalName = toPascal(moduleName);
const camelName = toCamel(moduleName);

const rootDir = path.resolve(__dirname, '..');

const ensureFile = (relativePath: string, content: string): void => {
  const absPath = path.join(rootDir, relativePath);
  if (fs.existsSync(absPath)) {
    console.log(`Skipped existing file: ${relativePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content.trimStart() + '\n', 'utf-8');
  console.log(`Created: ${relativePath}`);
};

const modelTemplate = (name: string, pascal: string): string =>
  [
    `export interface I${pascal} {`,
    `  id: string;`,
    `  accountId?: string;`,
    `  createdAt: Date;`,
    `  updatedAt: Date;`,
    `  // TODO: add ${name}-specific fields`,
    `}`,
    ``,
    `export class ${pascal} implements I${pascal} {`,
    `  id: string;`,
    `  accountId?: string;`,
    `  createdAt: Date;`,
    `  updatedAt: Date;`,
    ``,
    `  constructor(data: Partial<I${pascal}> = {}) {`,
    `    this.id = data.id || '';`,
    `    this.accountId = data.accountId;`,
    `    this.createdAt = data.createdAt || new Date();`,
    `    this.updatedAt = data.updatedAt || new Date();`,
    `  }`,
    `}`,
  ].join('\n');

const repositoryTemplate = (pascal: string): string =>
  [
    `import { BaseRepository } from './BaseRepository';`,
    `import { I${pascal}, ${pascal} } from '../models';`,
    ``,
    `/**`,
    ` * ${pascal} Repository`,
    ` * Data access for ${pascal} entities.`,
    ` * Replace this in-memory storage with real persistence when needed.`,
    ` */`,
    `export class ${pascal}Repository extends BaseRepository<${pascal}> {`,
    `  protected storage: ${pascal}[] = [];`,
    ``,
    `  async findById(id: string): Promise<${pascal} | null> {`,
    `    return this.storage.find((item) => item.id === id) || null;`,
    `  }`,
    ``,
    `  async findAll(): Promise<${pascal}[]> {`,
    `    return this.storage;`,
    `  }`,
    ``,
    `  async create(entity: Partial<I${pascal}>): Promise<${pascal}> {`,
    `    const now = new Date();`,
    `    const created = new ${pascal}({`,
    `      ...entity,`,
    `      id: entity.id || String(this.storage.length + 1),`,
    `      createdAt: now,`,
    `      updatedAt: now,`,
    `    });`,
    `    this.storage.push(created);`,
    `    return created;`,
    `  }`,
    ``,
    `  async update(id: string, updates: Partial<I${pascal}>): Promise<${pascal}> {`,
    `    const existing = await this.findById(id);`,
    `    this.throwIfNotFound(existing, id, '${pascal}');`,
    `    const updated = Object.assign(existing, updates, { updatedAt: new Date() });`,
    `    return updated;`,
    `  }`,
    ``,
    `  async delete(id: string): Promise<void> {`,
    `    this.storage = this.storage.filter((item) => item.id !== id);`,
    `  }`,
    `}`,
  ].join('\n');

const serviceTemplate = (pascal: string, camel: string): string =>
  [
    `import { BaseService } from './BaseService';`,
    `import { ${pascal} } from '../models';`,
    `import { ${pascal}Repository } from '../repositories';`,
    ``,
    `/**`,
    ` * ${pascal} Service`,
    ` * Business logic for ${camel} operations.`,
    ` */`,
    `export class ${pascal}Service extends BaseService<${pascal}, string> {`,
    `  constructor(private readonly ${camel}Repository: ${pascal}Repository) {`,
    `    super();`,
    `  }`,
    ``,
    `  async getById(id: string): Promise<${pascal}> {`,
    `    const entity = await this.${camel}Repository.findById(id);`,
    `    this.throwIfNotFound(entity, id, '${pascal}');`,
    `    return entity;`,
    `  }`,
    ``,
    `  async getAll(): Promise<${pascal}[]> {`,
    `    return this.${camel}Repository.findAll();`,
    `  }`,
    ``,
    `  async create(data: Partial<${pascal}>): Promise<${pascal}> {`,
    `    return this.${camel}Repository.create(data);`,
    `  }`,
    ``,
    `  async update(id: string, updates: Partial<${pascal}>): Promise<${pascal}> {`,
    `    return this.${camel}Repository.update(id, updates);`,
    `  }`,
    ``,
    `  async delete(id: string): Promise<void> {`,
    `    await this.${camel}Repository.delete(id);`,
    `  }`,
    `}`,
  ].join('\n');

const controllerTemplate = (pascal: string, camel: string): string =>
  [
    `import { Request, Response } from 'express';`,
    `import { BaseController } from './BaseController';`,
    `import { ${pascal}Service } from '../services';`,
    `import { catchAsync } from '../utils';`,
    ``,
    `/**`,
    ` * ${pascal} Controller`,
    ` * HTTP handlers for ${camel} operations.`,
    ` */`,
    `export class ${pascal}Controller extends BaseController {`,
    `  constructor(private readonly ${camel}Service: ${pascal}Service) {`,
    `    super();`,
    `  }`,
    ``,
    `  create = catchAsync(async (req: Request, res: Response) => {`,
    `    const entity = await this.${camel}Service.create(req.body);`,
    `    return this.success(res, { ${camel}: entity }, 201);`,
    `  });`,
    ``,
    `  getAll = catchAsync(async (_req: Request, res: Response) => {`,
    `    const items = await this.${camel}Service.getAll();`,
    `    return this.success(res, { items });`,
    `  });`,
    ``,
    `  getById = catchAsync(async (req: Request, res: Response) => {`,
    `    const { id } = req.params;`,
    `    const entity = await this.${camel}Service.getById(id);`,
    `    return this.success(res, { ${camel}: entity });`,
    `  });`,
    ``,
    `  update = catchAsync(async (req: Request, res: Response) => {`,
    `    const { id } = req.params;`,
    `    const entity = await this.${camel}Service.update(id, req.body);`,
    `    return this.success(res, { ${camel}: entity });`,
    `  });`,
    ``,
    `  delete = catchAsync(async (req: Request, res: Response) => {`,
    `    const { id } = req.params;`,
    `    await this.${camel}Service.delete(id);`,
    `    return this.success(res, { message: '${pascal} deleted successfully' });`,
    `  });`,
    `}`,
  ].join('\n');

const routeTemplate = (pascal: string, _camel: string, _name: string): string =>
  [
    `import { Router } from 'express';`,
    `import { container } from '../di';`,
    `import { ${pascal}Controller } from '../controllers';`,
    `import { authenticate } from '../middlewares';`,
    `// import { validate } from '../middlewares';`,
    `// import { someSchema } from '../validators';`,
    ``,
    `const router = Router();`,
    ``,
    `const getController = (): ${pascal}Controller => {`,
    `  return container.resolve<${pascal}Controller>('${pascal}Controller');`,
    `};`,
    ``,
    `// Basic CRUD routes – customize as needed`,
    `router.post(`,
    `  '/',`,
    `  authenticate,`,
    `  (req, res, next) => getController().create(req, res, next)`,
    `);`,
    ``,
    `router.get(`,
    `  '/',`,
    `  authenticate,`,
    `  (req, res, next) => getController().getAll(req, res, next)`,
    `);`,
    ``,
    `router.get(`,
    `  '/:id',`,
    `  authenticate,`,
    `  (req, res, next) => getController().getById(req, res, next)`,
    `);`,
    ``,
    `router.patch(`,
    `  '/:id',`,
    `  authenticate,`,
    `  (req, res, next) => getController().update(req, res, next)`,
    `);`,
    ``,
    `router.delete(`,
    `  '/:id',`,
    `  authenticate,`,
    `  (req, res, next) => getController().delete(req, res, next)`,
    `);`,
    ``,
    `export default router;`,
  ].join('\n');

// Generate files
// 1) Model file
ensureFile(path.join('models', `${moduleName}.model.ts`), modelTemplate(moduleName, PascalName));
// Ensure models/index.ts exports this model
const modelsIndexPath = path.join(rootDir, 'models', 'index.ts');
const exportLine = `export * from './${moduleName}.model';`;
if (fs.existsSync(modelsIndexPath)) {
  const current = fs.readFileSync(modelsIndexPath, 'utf-8');
  if (!current.split('\n').some((line) => line.trim() === exportLine)) {
    const updated = `${current.trimEnd()}\n${exportLine}\n`;
    fs.writeFileSync(modelsIndexPath, updated, 'utf-8');
    console.log(`Updated: models/index.ts (added export for ${moduleName}.model)`);
  } else {
    console.log(`models/index.ts already exports ${moduleName}.model`);
  }
} else {
  fs.mkdirSync(path.dirname(modelsIndexPath), { recursive: true });
  fs.writeFileSync(modelsIndexPath, `${exportLine}\n`, 'utf-8');
  console.log('Created: models/index.ts');
}

ensureFile(path.join('repositories', `${PascalName}Repository.ts`), repositoryTemplate(PascalName));
ensureFile(path.join('services', `${moduleName}.service.ts`), serviceTemplate(PascalName, camelName));
ensureFile(path.join('controllers', `${moduleName}.controller.ts`), controllerTemplate(PascalName, camelName));
ensureFile(path.join('routes', `${moduleName}.route.ts`), routeTemplate(PascalName, camelName, moduleName));

// 6) Print DI and route wiring hints
console.log('\nScaffold complete.\n');
console.log('Add DI registrations in src/di/setup.ts:\n');
console.log(
  [
    `  // Repository`,
    `  container.register('${PascalName}Repository', () => new ${PascalName}Repository(), true);`,
    ``,
    `  // Service`,
    `  container.register(`,
    `    '${PascalName}Service',`,
    `    () => {`,
    `      const repo = container.resolve<${PascalName}Repository>('${PascalName}Repository');`,
    `      return new ${PascalName}Service(repo);`,
    `    },`,
    `    true`,
    `  );`,
    ``,
    `  // Controller`,
    `  container.register(`,
    `    '${PascalName}Controller',`,
    `    () => {`,
    `      const svc = container.resolve<${PascalName}Service>('${PascalName}Service');`,
    `      return new ${PascalName}Controller(svc);`,
    `    },`,
    `    false`,
    `  );`,
  ].join('\n')
);

console.log('\nExport route in src/routes/index.ts:\n');
console.log(`  export { default as ${camelName}Routes } from './${moduleName}.route';`);

console.log('\nMount route in src/app.ts:\n');
console.log(`  app.use(\`\${apiVersion}/${moduleName}\`, ${camelName}Routes);`);



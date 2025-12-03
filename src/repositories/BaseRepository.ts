import { IRepository } from '../interfaces';
import { NotFoundError } from '../errors';

/**
 * Base repository implementation
 * Provides common CRUD operations that can be extended
 */
export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
  protected abstract storage: Map<ID, T> | T[];

  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Partial<T>): Promise<T>;
  abstract update(id: ID, updates: Partial<T>): Promise<T>;
  abstract delete(id: ID): Promise<void>;

  async exists(id: ID): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  protected throwIfNotFound(entity: T | null, id: ID, resourceName: string = 'Resource'): asserts entity is T {
    if (!entity) {
      throw new NotFoundError(`${resourceName} with id ${id} not found`);
    }
  }
}


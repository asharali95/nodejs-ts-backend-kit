import { IService } from '../interfaces';
import { NotFoundError } from '../errors';

/**
 * Base service implementation
 * Provides common service operations
 */
export abstract class BaseService<T, ID = string> implements IService<T, ID> {
  abstract getById(id: ID): Promise<T>;
  abstract getAll(): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: ID, updates: Partial<T>): Promise<T>;
  abstract delete(id: ID): Promise<void>;

  protected throwIfNotFound(entity: T | null, id: ID, resourceName: string = 'Resource'): asserts entity is T {
    if (!entity) {
      throw new NotFoundError(`${resourceName} with id ${id} not found`);
    }
  }
}


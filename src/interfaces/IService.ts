/**
 * Generic service interface
 */
export interface IService<T, ID = string> {
  getById(id: ID): Promise<T>;
  getAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}


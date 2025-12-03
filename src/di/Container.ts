/**
 * Simple Dependency Injection Container
 * Manages service instances and their dependencies
 */
export class Container {
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();
  private singletons: Map<string, any> = new Map();

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: () => T, singleton: boolean = true): void {
    if (singleton) {
      this.factories.set(name, factory);
    } else {
      this.services.set(name, factory);
    }
  }

  /**
   * Register a singleton instance
   */
  registerInstance<T>(name: string, instance: T): void {
    this.singletons.set(name, instance);
  }

  /**
   * Resolve a service
   */
  resolve<T>(name: string): T {
    // Check if it's a singleton instance
    if (this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    // Check if it's a singleton factory
    if (this.factories.has(name)) {
      if (!this.singletons.has(name)) {
        const instance = this.factories.get(name)!();
        this.singletons.set(name, instance);
      }
      return this.singletons.get(name) as T;
    }

    // Check if it's a factory
    if (this.services.has(name)) {
      const factory = this.services.get(name);
      return factory() as T;
    }

    throw new Error(`Service ${name} not found in container`);
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.singletons.has(name) || this.factories.has(name) || this.services.has(name);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }
}

// Global container instance
export const container = new Container();


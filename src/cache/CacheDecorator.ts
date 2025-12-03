import { redisCache } from './RedisCache';

/**
 * Cache decorator for automatic caching
 * Usage: @Cacheable('key-prefix', 3600)
 */
export function Cacheable(keyPrefix: string, ttl?: number) {
  return function (
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from prefix and arguments
      const key = `${keyPrefix}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await redisCache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method
      const result = await method.apply(this, args);

      // Store in cache (fire and forget)
      redisCache.set(key, result, ttl).catch((err) => {
        console.error('Failed to cache result:', err);
      });

      return result;
    };
  };
}

/**
 * Cache invalidator decorator
 * Usage: @CacheInvalidate('key-prefix')
 */
export function CacheInvalidate(keyPrefix: string) {
  return function (
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Execute method first
      const result = await method.apply(this, args);

      // Invalidate cache pattern
      redisCache.invalidatePattern(`${keyPrefix}:*`).catch((err) => {
        console.error('Failed to invalidate cache:', err);
      });

      return result;
    };
  };
}


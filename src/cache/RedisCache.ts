import Redis, { RedisOptions } from 'ioredis';
import { config } from '../config';

/**
 * Redis Cache Service
 * Plug-and-play caching system with automatic fallback
 */
export class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = config.REDIS_TTL;
    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  private async initialize(): Promise<void> {
    try {
      const options: RedisOptions = {};

      if (config.REDIS_URL) {
        // Use Redis URL if provided
        this.client = new Redis(config.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });
      } else {
        // Use individual config
        options.host = config.REDIS_HOST;
        options.port = config.REDIS_PORT;
        if (config.REDIS_PASSWORD) {
          options.password = config.REDIS_PASSWORD;
        }
        options.retryStrategy = (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        };
        options.maxRetriesPerRequest = 3;

        this.client = new Redis(options);
      }

      // Handle connection events
      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Redis connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('⚠️  Redis connection error:', err.message);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        console.warn('⚠️  Redis connection closed');
      });

      // Test connection
      await this.client.ping();
      this.isConnected = true;
    } catch (error) {
      console.warn('⚠️  Redis not available, caching disabled:', (error as Error).message);
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      await this.client!.setex(key, expiration, serialized);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<boolean> {
    if (!this.isAvailable() || keys.length === 0) {
      return false;
    }

    try {
      await this.client!.del(...keys);
      return true;
    } catch (error) {
      console.error('Redis deleteMany error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetchFn();

    // Store in cache (fire and forget)
    this.set(key, value, ttl).catch((err) => {
      console.error('Failed to cache value:', err);
    });

    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clearAll(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushdb();
      return true;
    } catch (error) {
      console.error('Redis clearAll error:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const redisCache = new RedisCache();


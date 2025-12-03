import { randomUUID } from 'crypto';

/**
 * Generate a unique ID
 * Uses UUID v4 for production-ready unique identifiers
 */
export const generateId = (): string => {
  return randomUUID();
};

/**
 * Generate a short ID (for development/testing)
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};


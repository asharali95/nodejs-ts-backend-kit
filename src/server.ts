import app from './app';
import { config } from './config';
import { connectDatabase } from './database';
import { redisCache } from './cache';
import { trialExpirationWorker, trialExpirationQueue } from './queue';
import { logger } from './utils';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Redis connection is initialized automatically (plug-and-play)
    // It will work if Redis is available, otherwise gracefully degrades

    // Start BullMQ worker for trial expiration
    logger.info('✅ BullMQ trial expiration worker started');

    // Start Express server
    const server = app.listen(config.PORT, () => {
      logger.info('🚀 Server started', {
        port: config.PORT,
        environment: config.NODE_ENV,
        apiVersion: config.API_VERSION,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        logger.info('HTTP server closed');
        // Close BullMQ worker and queue
        await trialExpirationWorker.close();
        await trialExpirationQueue.close();
        logger.info('BullMQ workers closed');
        // Disconnect Redis
        await redisCache.disconnect();
        // Disconnect MongoDB
        const { disconnectDatabase } = await import('./database');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();


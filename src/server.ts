import app from './app';
import { config } from './config';
import { connectDatabase } from './database';
import { redisCache } from './cache';
import { trialExpirationWorker, trialExpirationQueue } from './queue';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Redis connection is initialized automatically (plug-and-play)
    // It will work if Redis is available, otherwise gracefully degrades

    // Start BullMQ worker for trial expiration
    console.log('✅ BullMQ trial expiration worker started');

    // Start Express server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Server is running on port ${config.PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 API Version: ${config.API_VERSION}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        console.log('HTTP server closed');
        // Close BullMQ worker and queue
        await trialExpirationWorker.close();
        await trialExpirationQueue.close();
        console.log('BullMQ workers closed');
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


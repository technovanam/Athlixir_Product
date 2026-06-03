import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: IORedis;
  private redisErrorLogged = false;
  private analysisQueue: Queue;

  constructor() {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        // Linear backoff starting at 1s, capped at 10s
        return Math.min(times * 1000, 10000);
      },
    });

    // Handle Redis connection events to prevent unhandled promise/error log pollution
    this.connection.on('error', (err) => {
      if (!this.redisErrorLogged) {
        this.logger.warn(
          `Redis connection failed (is Redis running?): ${err.message}`,
        );
        this.redisErrorLogged = true;
      }
    });

    this.connection.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
      this.redisErrorLogged = false;
    });

    this.analysisQueue = new Queue('analysis-jobs', {
      connection: this.connection as any,
    });
    this.analysisQueue.on('error', (err) => {
      if (!this.redisErrorLogged) {
        this.logger.error(`Queue error: ${err.message}`);
      }
    });
    this.logger.log('Analysis queue initialized');
  }

  isReady(): boolean {
    return this.connection.status === 'ready';
  }

  async addJob(jobName: string, data: any) {
    await this.analysisQueue.add(jobName, data);
    this.logger.log(`Added job '${jobName}' to the analysis queue`);
  }

  onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    this.analysisQueue.close();
    this.connection.quit();
  }
}

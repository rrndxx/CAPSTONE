import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

export const connectRedis = () => {
  redis.on('connect', () => {
    console.log('🔌 Connected to Redis');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });
};

import express from 'express';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

redis.on('connect', () => {
  console.log('🔌 Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

app.get('/', async (_req, res) => {
  await redis.set('message', 'Hello Redis!');
  const message = await redis.get('message');
  res.json({ message: `Redis says: ${message}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

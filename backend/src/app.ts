import express from 'express';
import routes from './routes';
import { connectRedis } from './services/redis.service';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis connection
connectRedis();

// Mount all routes
app.use('/', routes);

export default app;
    
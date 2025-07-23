import { Router } from 'express';
import devicesRoute from './devices.route';

const router = Router();

router.use('/devices', devicesRoute);

// Test root
router.get('/', (_req, res) => {
  res.send('✅ NetDetect API is running');
});

export default router;

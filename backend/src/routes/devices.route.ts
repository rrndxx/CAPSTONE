import { Router } from 'express';
import { getAllDevices } from '../services/sophos.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const devices = await getAllDevices();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load devices' });
  }
});

export default router;

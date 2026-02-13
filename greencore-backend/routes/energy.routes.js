import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getEnergyData, getEnergyById, createEnergy, updateEnergy, deleteEnergy,
  getEnergyStats, getChartData, getRecentEntries,
} from '../controllers/energy.controller.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getEnergyStats);
router.get('/chart', getChartData);
router.get('/recent', getRecentEntries);
router.get('/', getEnergyData);
router.get('/:id', getEnergyById);
router.post('/', createEnergy);
router.put('/:id', updateEnergy);
router.delete('/:id', deleteEnergy);

export default router;

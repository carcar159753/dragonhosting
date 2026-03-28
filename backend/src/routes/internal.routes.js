import { Router } from 'express';
import { apiSecretRequired } from '../middleware/apiSecret.js';
import { store } from '../services/store.js';
import { flagSchema, positionSchema } from '../utils/validators.js';

const router = Router();
router.use(apiSecretRequired);

router.post('/players/position', (req, res) => {
  const { error, value } = positionSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const key = String(value.source);
  store.onlinePlayers.set(key, {
    id: value.source,
    name: value.name,
    coords: value.coords,
    speed: value.speed,
    heading: value.heading,
    behaviorScore: value.behaviorScore,
    history: value.history,
    updatedAt: value.timestamp
  });

  req.app.get('wsBroadcast')({ type: 'player:update', payload: store.onlinePlayers.get(key) });
  return res.json({ ok: true });
});

router.post('/events/flag', (req, res) => {
  const { error, value } = flagSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  store.flags.push(value);
  req.app.get('wsBroadcast')({ type: 'flag:new', payload: value });
  return res.json({ ok: true });
});

router.post('/players/ban', (req, res) => {
  store.bans.push(req.body);
  req.app.get('wsBroadcast')({ type: 'ban:new', payload: req.body });
  return res.json({ ok: true });
});

export default router;

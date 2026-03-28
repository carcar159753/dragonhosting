import { Router } from 'express';
import { authRequired, staffLevel } from '../middleware/auth.js';
import { store } from '../services/store.js';
import { reportSchema } from '../utils/validators.js';

const router = Router();
router.use(authRequired);

router.get('/dashboard', (req, res) => {
  return res.json({
    playersOnline: store.onlinePlayers.size,
    flags: store.flags.slice(-100).reverse(),
    bans: store.bans.slice(-100).reverse(),
    reports: store.reports.slice(-100).reverse()
  });
});

router.get('/players/live', (req, res) => {
  return res.json(Array.from(store.onlinePlayers.values()));
});

router.get('/players/:id/replay', (req, res) => {
  const player = store.onlinePlayers.get(String(req.params.id));
  if (!player) return res.status(404).json({ error: 'Player não encontrado' });
  return res.json({ history: player.history || [] });
});

router.post('/actions/:action/:id', staffLevel(2), (req, res) => {
  const id = Number(req.params.id);
  const action = req.params.action;
  if (!['kick', 'ban'].includes(action)) return res.status(400).json({ error: 'Ação inválida' });

  // TODO: disparar via RCON/event broker para FiveM
  if (action === 'ban') {
    store.bans.push({ id, reason: 'Banimento via painel', by: req.user.username, at: Date.now() });
  }

  return res.json({ ok: true, action, id });
});

router.post('/reports', (req, res) => {
  const { error, value } = reportSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  store.reports.push({ ...value, status: 'open', at: Date.now() });
  return res.status(201).json({ ok: true });
});

export default router;

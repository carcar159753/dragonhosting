import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import { store } from '../data/store.js';
import { addBan, addKick, addReport, ingestLog } from '../services/telemetryService.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  const players = [...store.players.values()].map((player) => ({
    source: player.source,
    name: player.name,
    license: player.license,
    position: player.latest,
    speed: player.speed,
    health: player.health,
    armor: player.armor,
    updatedAt: player.updatedAt,
  }));

  return res.json({
    onlinePlayers: players.length,
    players,
    logs: store.logs.slice(0, 50),
    bans: store.bans.slice(0, 50),
    kicks: store.kicks.slice(0, 50),
    reports: store.reports.slice(0, 50),
  });
});

router.get('/replay/:license', (req, res) => {
  const player = store.players.get(req.params.license);
  if (!player) {
    return res.status(404).json({ error: 'Player não encontrado.' });
  }

  return res.json({
    license: player.license,
    name: player.name,
    replay: player.replay,
  });
});

router.post(
  '/actions',
  requireLevel(50),
  [body('type').isIn(['kick', 'ban']), body('license').isString().isLength({ min: 8 }), body('reason').isString().isLength({ min: 3 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Dados inválidos.', details: errors.array() });
    }

    const baseAction = {
      license: req.body.license,
      reason: req.body.reason,
      by: req.user.email,
    };

    if (req.body.type === 'ban') {
      const ban = addBan({
        type: 'manual_ban',
        ...baseAction,
      });

      ingestLog({
        name: req.user.email,
        license: req.body.license,
        reason: `Manual ban applied: ${req.body.reason}`,
      });

      req.app.get('io').emit('bans:update', ban);
      return res.json({ ok: true, action: 'ban', id: ban.id });
    }

    const kick = addKick({
      type: 'manual_kick',
      ...baseAction,
    });

    ingestLog({
      name: req.user.email,
      license: req.body.license,
      reason: `Manual kick applied: ${req.body.reason}`,
    });

    req.app.get('io').emit('kicks:update', kick);
    return res.json({ ok: true, action: 'kick', id: kick.id });
  }
);

router.post('/reports', [body('title').isString().isLength({ min: 3 }), body('description').isString().isLength({ min: 5 }), body('license').isString().isLength({ min: 8 })], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Dados inválidos.', details: errors.array() });
  }

  const report = addReport(req.body);
  return res.status(201).json(report);
});

export default router;

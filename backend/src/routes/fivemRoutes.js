import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireFiveMKey } from '../middleware/fivemKey.js';
import { addBan, ingestLog, ingestTelemetry } from '../services/telemetryService.js';

export default function makeFiveMRoutes(io) {
  const router = Router();

  router.use(requireFiveMKey);

  router.post(
    '/telemetry',
    [body('source').isInt(), body('name').isString(), body('license').isString(), body('position').isObject()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ error: 'Payload inválido.' });
      }

      const player = ingestTelemetry(req.body);
      io.emit('telemetry:update', {
        license: player.license,
        name: player.name,
        position: player.latest,
        speed: player.speed,
        health: player.health,
        armor: player.armor,
        updatedAt: player.updatedAt,
      });

      return res.json({ ok: true });
    }
  );

  router.post('/logs', [body('source').isInt(), body('reason').isString()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Payload inválido.' });
    }

    ingestLog(req.body);
    io.emit('logs:update', req.body);
    return res.json({ ok: true });
  });

  router.post('/actions', [body('type').isString()], (req, res) => {
    if (req.body.type === 'auto_ban') {
      addBan(req.body);
      io.emit('bans:update', req.body);
    }

    return res.json({ ok: true });
  });

  return router;
}

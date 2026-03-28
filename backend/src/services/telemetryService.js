import crypto from 'node:crypto';

import { store } from '../data/store.js';

const MAX_LOGS = 1000;
const MAX_REPLAY_POINTS = 300;

export function ingestTelemetry(payload) {
  const key = payload.license || `src:${payload.source}`;

  const current = store.players.get(key) || {
    source: payload.source,
    name: payload.name,
    license: payload.license,
    latest: null,
    replay: [],
    updatedAt: Date.now(),
  };

  current.source = payload.source;
  current.name = payload.name;
  current.license = payload.license;
  current.latest = payload.position;
  current.health = payload.health;
  current.armor = payload.armor;
  current.speed = payload.speed;
  current.updatedAt = Date.now();

  if (Array.isArray(payload.replay)) {
    current.replay = payload.replay.slice(-MAX_REPLAY_POINTS);
  }

  store.players.set(key, current);
  return current;
}

export function ingestLog(entry) {
  store.logs.unshift({ ...entry, id: crypto.randomUUID(), at: Date.now() });
  store.logs = store.logs.slice(0, MAX_LOGS);
}

export function addBan(data) {
  const ban = { ...data, id: crypto.randomUUID(), at: Date.now() };
  store.bans.unshift(ban);
  store.bans = store.bans.slice(0, 1000);
  return ban;
}

export function addKick(data) {
  const kick = { ...data, id: crypto.randomUUID(), at: Date.now() };
  store.kicks.unshift(kick);
  store.kicks = store.kicks.slice(0, 1000);
  return kick;
}

export function addReport(data) {
  const record = { ...data, id: crypto.randomUUID(), status: 'open', at: Date.now() };
  store.reports.unshift(record);
  store.reports = store.reports.slice(0, 1000);
  return record;
}

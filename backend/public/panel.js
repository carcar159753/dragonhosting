const API = '/api';
const MAP_IMAGE_URL = 'https://i.imgur.com/0pG5uYx.jpeg';

const state = { token: '', players: [], flags: [], bans: [], selectedId: null };
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const mapImg = new Image();
mapImg.src = MAP_IMAGE_URL;

function toCanvasCoords(x, y) {
  const minX = -4000, maxX = 4500;
  const minY = -4000, maxY = 8000;
  const nx = (x - minX) / (maxX - minX);
  const ny = 1 - ((y - minY) / (maxY - minY));
  return { x: nx * canvas.width, y: ny * canvas.height };
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mapImg.complete) ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

  state.players.forEach((p) => {
    const pos = toCanvasCoords(p.coords.x, p.coords.y);
    ctx.beginPath();
    ctx.fillStyle = p.id === state.selectedId ? '#ff5577' : '#7b87ff';
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();

    if (Array.isArray(p.history) && p.history.length > 1 && p.id === state.selectedId) {
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      p.history.slice(-80).forEach((h, i) => {
        const hp = toCanvasCoords(h.x, h.y);
        if (i === 0) ctx.moveTo(hp.x, hp.y); else ctx.lineTo(hp.x, hp.y);
      });
      ctx.stroke();
    }
  });
}

async function login() {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const data = await res.json();
  state.token = data.token;
}

async function fetchDashboard() {
  const res = await fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${state.token}` } });
  const data = await res.json();
  state.flags = data.flags || [];
  state.bans = data.bans || [];
  document.getElementById('playersOnline').textContent = String(data.playersOnline || 0);
  document.getElementById('flagsCount').textContent = String(state.flags.length);
  document.getElementById('bansCount').textContent = String(state.bans.length);

  const flagsList = document.getElementById('flagsList');
  flagsList.innerHTML = '';
  state.flags.slice(0, 12).forEach((f) => {
    const li = document.createElement('li');
    li.textContent = `[${f.flag}] ${f.player} (#${f.source})`;
    flagsList.appendChild(li);
  });
}

async function fetchPlayers() {
  const res = await fetch(`${API}/players/live`, { headers: { Authorization: `Bearer ${state.token}` } });
  state.players = await res.json();

  const list = document.getElementById('playersList');
  list.innerHTML = '';
  state.players.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = `${p.name || 'Sem nome'} #${p.id}`;
    li.onclick = () => { state.selectedId = p.id; drawMap(); };

    const kickBtn = document.createElement('button');
    kickBtn.textContent = 'Kick';
    kickBtn.onclick = (e) => { e.stopPropagation(); action('kick', p.id); };

    const banBtn = document.createElement('button');
    banBtn.textContent = 'Ban';
    banBtn.onclick = (e) => { e.stopPropagation(); action('ban', p.id); };

    li.appendChild(kickBtn);
    li.appendChild(banBtn);
    list.appendChild(li);
  });

  drawMap();
}

async function action(type, id) {
  await fetch(`${API}/actions/${type}/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${state.token}` }
  });
}

async function fetchReplay() {
  if (!state.selectedId) return;
  const res = await fetch(`${API}/players/${state.selectedId}/replay`, { headers: { Authorization: `Bearer ${state.token}` } });
  const data = await res.json();
  const player = state.players.find((p) => p.id === state.selectedId);
  if (player) player.history = data.history;
  drawMap();
}

function initWs() {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.type === 'player:update') {
      const i = state.players.findIndex((p) => p.id === msg.payload.id);
      if (i >= 0) state.players[i] = msg.payload; else state.players.push(msg.payload);
      drawMap();
    }
  };
}

document.getElementById('btnRefresh').onclick = async () => {
  await fetchDashboard();
  await fetchPlayers();
};
document.getElementById('btnReplay').onclick = fetchReplay;

(async function boot() {
  await login();
  await fetchDashboard();
  await fetchPlayers();
  initWs();
  setInterval(async () => {
    await fetchDashboard();
    await fetchPlayers();
  }, 5000);
})();

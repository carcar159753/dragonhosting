const state = {
  token: localStorage.getItem('dragon_token') || '',
  players: [],
  logs: [],
  replay: [],
};

const mapImage = new Image();
mapImage.src = '/assets/gta-map.svg';

const mapBounds = {
  minX: -4000,
  maxX: 4000,
  minY: -4000,
  maxY: 4000,
};

const authCard = document.getElementById('authCard');
const panelRoot = document.getElementById('panelRoot');
const loginForm = document.getElementById('loginForm');
const onlineCounter = document.getElementById('onlineCounter');
const mapCanvas = document.getElementById('mapCanvas');
const logList = document.getElementById('logList');
const replayPlayer = document.getElementById('replayPlayer');

const ctx = mapCanvas.getContext('2d');

function toCanvas(position) {
  const px = (position.x - mapBounds.minX) / (mapBounds.maxX - mapBounds.minX);
  const py = (position.y - mapBounds.minY) / (mapBounds.maxY - mapBounds.minY);
  return {
    x: Math.max(0, Math.min(mapCanvas.width, px * mapCanvas.width)),
    y: Math.max(0, Math.min(mapCanvas.height, mapCanvas.height - py * mapCanvas.height)),
  };
}

function drawMap() {
  ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  ctx.drawImage(mapImage, 0, 0, mapCanvas.width, mapCanvas.height);

  for (const player of state.players) {
    if (!player.position) continue;
    const p = toCanvas(player.position);
    ctx.beginPath();
    ctx.fillStyle = '#22f59d';
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(player.name, p.x + 8, p.y - 8);
  }
}

function drawReplayLine(replay) {
  if (!replay.length) return;
  ctx.beginPath();
  ctx.strokeStyle = '#ffcb3d';
  ctx.lineWidth = 2;

  replay.forEach((point, idx) => {
    const p = toCanvas(point);
    if (idx === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
}

function updateLogs() {
  logList.innerHTML = '';
  state.logs.slice(0, 20).forEach((log) => {
    const item = document.createElement('li');
    item.textContent = `[${new Date(log.at || Date.now()).toLocaleTimeString()}] ${log.name || 'unknown'} → ${log.reason}`;
    logList.appendChild(item);
  });
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadDashboard() {
  const data = await api('/api/panel/dashboard');
  state.players = data.players;
  state.logs = data.logs;

  onlineCounter.textContent = `Players online: ${data.onlinePlayers}`;
  replayPlayer.innerHTML = state.players.map((p) => `<option value="${p.license}">${p.name} (${p.license})</option>`).join('');
  updateLogs();
  drawMap();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const data = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  state.token = data.token;
  localStorage.setItem('dragon_token', data.token);
  authCard.classList.add('hidden');
  panelRoot.classList.remove('hidden');
  await loadDashboard();
});

document.getElementById('refreshBtn').addEventListener('click', loadDashboard);

document.getElementById('playReplay').addEventListener('click', async () => {
  const license = replayPlayer.value;
  if (!license) return;

  const data = await api(`/api/panel/replay/${encodeURIComponent(license)}`);
  drawMap();
  drawReplayLine(data.replay || []);
});

document.getElementById('actionForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  await api('/api/panel/actions', {
    method: 'POST',
    body: JSON.stringify({
      type: document.getElementById('actionType').value,
      license: document.getElementById('actionLicense').value,
      reason: document.getElementById('actionReason').value,
    }),
  });
});

document.getElementById('reportForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  await api('/api/panel/reports', {
    method: 'POST',
    body: JSON.stringify({
      license: document.getElementById('reportLicense').value,
      title: document.getElementById('reportTitle').value,
      description: document.getElementById('reportDescription').value,
    }),
  });
});

if (state.token) {
  authCard.classList.add('hidden');
  panelRoot.classList.remove('hidden');
  loadDashboard().catch(() => {
    state.token = '';
    localStorage.removeItem('dragon_token');
    authCard.classList.remove('hidden');
    panelRoot.classList.add('hidden');
  });
}

const socket = io();
socket.on('telemetry:update', (payload) => {
  const idx = state.players.findIndex((p) => p.license === payload.license);
  if (idx >= 0) state.players[idx] = { ...state.players[idx], ...payload, position: payload.position };
  else state.players.push({ ...payload, position: payload.position });
  onlineCounter.textContent = `Players online: ${state.players.length}`;
  drawMap();
});

socket.on('logs:update', (payload) => {
  state.logs.unshift({ ...payload, at: Date.now() });
  updateLogs();
});

mapImage.onload = drawMap;

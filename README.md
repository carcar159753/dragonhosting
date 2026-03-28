# Dragon AntiCheat Suite (FiveM + Painel Web)

Sistema completo com anticheat FiveM, backend Node.js/Express e painel web em dark theme com mapa 2D, replay e ações de staff.

## Estrutura

- `fivem-anticheat/` → resource FiveM (1 `client.lua`, 1 `server.lua`).
- `backend/` → API JWT, staff levels, ingestão de telemetria e websocket.
- `web/` → painel responsivo estilo Nexus/FiveGuard.

## 1) Configurar Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start
```

Credenciais padrão (alterar no `.env`):
- `ADMIN_EMAIL=admin@dragon.local`
- `ADMIN_PASSWORD=ChangeMe123!`

## 2) Configurar Resource FiveM

1. Copie a pasta `fivem-anticheat` para `resources/[local]/dragon_anticheat`.
2. Edite `fivem-anticheat/config.lua`:
   - `Config.ResourceSecret`
   - `Config.BackendBaseUrl`
   - `Config.BackendApiKey` (igual ao `FIVEM_API_KEY` do backend)
3. No `server.cfg`, adicione:

```cfg
ensure dragon_anticheat
```

## 3) Abrir Painel

Com backend ativo:
- URL: `http://localhost:3000`
- Login com credenciais staff.

## Funcionalidades

- Anti-bypass por token de sessão.
- Detecção: godmode, speed hack, teleport, noclip altura, arma ilegal.
- Sistema de flags ponderadas + autoban.
- IA simples por padrão de comportamento suspeito.
- Replay de movimentação e telemetria em tempo real.
- Dashboard com mapa 2D, players online, logs, replay visual.
- Ban/Kick via painel e sistema de denúncias.
- JWT, rotas protegidas e validação de payload.
- Estrutura preparada para MySQL (`backend/src/data/mysql.js`).

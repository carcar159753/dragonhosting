# Dragon Anticheat Suite (FiveM + Web Panel)

## Estrutura

- `fivem-anticheat/`: resource completo do FiveM (`client.lua` e `server.lua` únicos)
- `backend/`: API Node.js + painel web em tempo real

## Requisitos

- Node.js 20+
- FiveM server com `oxmysql` (ou equivalente MySQL)

## Instalação rápida

### 1) FiveM

1. Copie `fivem-anticheat` para `resources/[local]/dragon_anticheat`
2. Adicione no `server.cfg`:
   ```cfg
   ensure oxmysql
   add_ace group.admin dragon_ac.staff allow
   ensure dragon_anticheat
   ```
3. Ajuste `Config.BackendApi` e `Config.BackendSecret` em `fivem-anticheat/config.lua`

### 2) Backend + painel

```bash
cd backend
cp .env.example .env
npm install
npm run start
```

Acesse: `http://localhost:3000`

### Login padrão painel

- Usuário: `admin`
- Senha: `admin123`

## Produção

- Trocar todas as secrets do `.env`
- Integrar persistência MySQL nas rotas e serviços
- Habilitar HTTPS + reverse proxy

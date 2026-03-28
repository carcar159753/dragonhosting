local sessions = {}
local playerFlags = {}

local function randomToken()
  local charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  local token = {}
  for i = 1, 64 do
    local index = math.random(1, #charset)
    token[i] = charset:sub(index, index)
  end
  return table.concat(token)
end

local function getLicense(src)
  for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
    if identifier:sub(1, 8) == 'license:' then
      return identifier
    end
  end
  return 'unknown'
end

local function sendBackend(path, payload)
  PerformHttpRequest(
    Config.BackendBaseUrl .. path,
    function() end,
    'POST',
    json.encode(payload),
    {
      ['Content-Type'] = 'application/json',
      ['x-api-key'] = Config.BackendApiKey
    }
  )
end

local function registerFlag(src, reason, telemetry)
  if not playerFlags[src] then
    playerFlags[src] = {
      points = 0,
      reasons = {},
    }
  end

  local weight = Config.FlagWeights[reason] or 1
  playerFlags[src].points = playerFlags[src].points + weight
  playerFlags[src].reasons[#playerFlags[src].reasons + 1] = {
    reason = reason,
    at = os.time(),
  }

  local logPayload = {
    source = src,
    name = GetPlayerName(src),
    license = getLicense(src),
    reason = reason,
    points = playerFlags[src].points,
    telemetry = telemetry,
  }

  sendBackend('/api/fivem/logs', logPayload)

  if playerFlags[src].points >= Config.MaxFlagsBeforeAutoBan then
    sendBackend('/api/fivem/actions', {
      type = 'auto_ban',
      source = src,
      name = GetPlayerName(src),
      license = getLicense(src),
      reasons = playerFlags[src].reasons,
    })

    DropPlayer(src, '[DragonAC] Ban automático por atividade suspeita.')
  end
end

RegisterNetEvent('dragon_anticheat:request_token', function()
  local src = source
  local token = randomToken()

  sessions[src] = {
    token = token,
    createdAt = os.time(),
  }

  TriggerClientEvent('dragon_anticheat:session_token', src, token)
end)

RegisterNetEvent('dragon_anticheat:heartbeat', function(payload)
  local src = source
  local session = sessions[src]

  if not session or not payload or payload.token ~= session.token then
    DropPlayer(src, '[DragonAC] Token inválido (anti-bypass).')
    return
  end

  local telemetry = {
    source = src,
    name = GetPlayerName(src),
    license = getLicense(src),
    position = payload.position,
    speed = payload.speed,
    health = payload.health,
    armor = payload.armor,
    replay = payload.replay,
    tick = payload.tick,
    ts = os.time(),
  }

  sendBackend('/api/fivem/telemetry', telemetry)

  if payload.flags and #payload.flags > 0 then
    for _, reason in ipairs(payload.flags) do
      registerFlag(src, reason, telemetry)
    end
  end
end)

AddEventHandler('playerDropped', function()
  local src = source
  sessions[src] = nil
  playerFlags[src] = nil
end)

local sessionToken = nil
local replayBuffer = {}
local lastPos = nil
local suspiciousPatternScore = 0

local function pushReplay(pos)
  replayBuffer[#replayBuffer + 1] = {
    x = pos.x,
    y = pos.y,
    z = pos.z,
    t = GetGameTimer()
  }

  if #replayBuffer > Config.ReplayWindow then
    table.remove(replayBuffer, 1)
  end
end

local function collectFlags(ped, pos)
  local flags = {}

  if GetPlayerInvincible(PlayerId()) then
    flags[#flags + 1] = 'godmode'
  end

  if IsPedInAnyVehicle(ped, false) == false then
    local speed = GetEntitySpeed(ped)
    if speed > Config.SpeedThreshold then
      flags[#flags + 1] = 'speed_hack'
    end
  end

  if lastPos then
    local distance = #(pos - lastPos)
    if distance > Config.TeleportDistanceThreshold and not IsPedInAnyVehicle(ped, false) then
      flags[#flags + 1] = 'teleport'
      suspiciousPatternScore = suspiciousPatternScore + 2
    end
  end

  local isFalling = IsPedFalling(ped)
  local isParachuting = IsPedInParachuteFreeFall(ped)
  local heightDelta = GetEntityHeightAboveGround(ped)
  if heightDelta > Config.NoclipHeightThreshold and not isFalling and not isParachuting and not IsPedInAnyVehicle(ped, false) then
    flags[#flags + 1] = 'noclip_height'
  end

  local selectedWeapon = GetSelectedPedWeapon(ped)
  if not Config.WeaponWhitelist[selectedWeapon] then
    flags[#flags + 1] = 'illegal_weapon'
    suspiciousPatternScore = suspiciousPatternScore + 2
  end

  if #flags > 0 and #flags >= 2 then
    suspiciousPatternScore = suspiciousPatternScore + 1
  else
    suspiciousPatternScore = math.max(0, suspiciousPatternScore - 1)
  end

  if suspiciousPatternScore >= 4 then
    flags[#flags + 1] = 'ai_pattern'
  end

  return flags
end

RegisterNetEvent('dragon_anticheat:session_token', function(token)
  sessionToken = token
end)

CreateThread(function()
  while not sessionToken do
    TriggerServerEvent('dragon_anticheat:request_token')
    Wait(3000)
  end

  while true do
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local health = GetEntityHealth(ped)
    local armor = GetPedArmour(ped)
    local speed = GetEntitySpeed(ped)

    pushReplay(pos)
    local flags = collectFlags(ped, pos)

    TriggerServerEvent('dragon_anticheat:heartbeat', {
      token = sessionToken,
      position = { x = pos.x, y = pos.y, z = pos.z },
      speed = speed,
      health = health,
      armor = armor,
      flags = flags,
      replay = replayBuffer,
      tick = GetGameTimer()
    })

    lastPos = pos
    Wait(Config.TickMs)
  end
end)

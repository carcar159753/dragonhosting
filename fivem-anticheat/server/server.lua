local PlayerState = {}
local TokenState = {}

local function logInfo(message, data)
    local payload = json.encode(data or {})
    print(('[DragonAC] %s | %s'):format(message, payload))
end

local function postBackend(path, payload)
    PerformHttpRequest(('%s%s'):format(Config.BackendApi, path), function() end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json',
        ['x-resource'] = Config.ResourceName,
        ['x-secret'] = Config.BackendSecret,
    })
end

local function ensurePlayer(source)
    local id = tostring(source)
    if not PlayerState[id] then
        PlayerState[id] = {
            flags = 0,
            history = {},
            behaviorScore = 0,
            identifiers = GetPlayerIdentifiers(source),
            name = GetPlayerName(source),
        }
    end
    return PlayerState[id]
end

local function banPlayer(source, reason)
    DropPlayer(source, reason or Config.BanReason)
    postBackend('/players/ban', {
        source = source,
        reason = reason,
        identifiers = GetPlayerIdentifiers(source),
        timestamp = os.time(),
    })
end

local function addFlag(source, flagType, evidence)
    local p = ensurePlayer(source)
    p.flags = p.flags + 1
    p.behaviorScore = p.behaviorScore + 1

    logInfo('Flag adicionada', {
        source = source,
        player = p.name,
        flag = flagType,
        flags = p.flags,
        evidence = evidence,
    })

    postBackend('/events/flag', {
        source = source,
        player = p.name,
        flag = flagType,
        flags = p.flags,
        evidence = evidence,
        timestamp = os.time(),
    })

    if p.flags >= Config.FlagLimit then
        banPlayer(source, Config.BanReason)
    end
end

local function newToken(source)
    local token = _DRAGON_UTILS.uuid()
    TokenState[tostring(source)] = {
        token = token,
        expiresAt = os.time() + Config.TokenRotateSeconds,
    }
    return token
end

RegisterNetEvent('dragon_ac:requestToken', function()
    local source = source
    local token = newToken(source)
    TriggerClientEvent('dragon_ac:receiveToken', source, token, TokenState[tostring(source)].expiresAt)
end)

RegisterNetEvent('dragon_ac:positionUpdate', function(payload)
    local source = source
    local p = ensurePlayer(source)
    local tokenData = TokenState[tostring(source)]

    if not tokenData or tokenData.token ~= payload.token or os.time() > tokenData.expiresAt then
        addFlag(source, 'token_bypass', payload)
        return
    end

    if #p.history >= Config.Detection.ReplayPointsLimit then
        table.remove(p.history, 1)
    end

    p.history[#p.history + 1] = {
        x = payload.x,
        y = payload.y,
        z = payload.z,
        speed = payload.speed,
        heading = payload.heading,
        t = os.time(),
    }

    postBackend('/players/position', {
        source = source,
        name = p.name,
        coords = { x = payload.x, y = payload.y, z = payload.z },
        speed = payload.speed,
        heading = payload.heading,
        history = p.history,
        behaviorScore = p.behaviorScore,
        timestamp = os.time(),
    })
end)

RegisterNetEvent('dragon_ac:flag', function(flagType, evidence)
    local source = source
    addFlag(source, flagType, evidence)
end)

RegisterNetEvent('dragon_ac:adminAction', function(action, target)
    local src = source
    local group = IsPlayerAceAllowed(src, 'dragon_ac.staff') and 'admin' or nil
    if not group then return end

    if action == 'kick' then
        DropPlayer(target, 'Expulso via painel Dragon AC')
    elseif action == 'ban' then
        banPlayer(target, 'Banimento via painel Dragon AC')
    end
end)

CreateThread(function()
    while true do
        Wait(30000)
        for src, tokenData in pairs(TokenState) do
            if os.time() > tokenData.expiresAt then
                local source = tonumber(src)
                if source then
                    local token = newToken(source)
                    TriggerClientEvent('dragon_ac:receiveToken', source, token, TokenState[src].expiresAt)
                end
            end
        end
    end
end)

AddEventHandler('playerDropped', function()
    local src = tostring(source)
    PlayerState[src] = nil
    TokenState[src] = nil
end)

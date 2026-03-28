local sessionToken = nil
local tokenExpiresAt = 0
local lastCoords = nil
local lastCheckAt = 0

local function sendFlag(flagType, evidence)
    TriggerServerEvent('dragon_ac:flag', flagType, evidence)
end

RegisterNetEvent('dragon_ac:receiveToken', function(token, expiresAt)
    sessionToken = token
    tokenExpiresAt = expiresAt
end)

CreateThread(function()
    Wait(2500)
    TriggerServerEvent('dragon_ac:requestToken')

    while true do
        Wait(Config.Detection.PositionIntervalMs)

        if not sessionToken or os.time() >= tokenExpiresAt then
            TriggerServerEvent('dragon_ac:requestToken')
        end

        local ped = PlayerPedId()
        if not DoesEntityExist(ped) then goto continue end

        local coords = GetEntityCoords(ped)
        local speed = GetEntitySpeed(ped)
        local health = GetEntityHealth(ped)

        if health > Config.Detection.GodModeHealthLimit then
            sendFlag('godmode', { health = health })
        end

        if speed > Config.Detection.MaxSpeedMps and not IsPedInAnyVehicle(ped, false) then
            sendFlag('speedhack', { speed = speed })
        end

        if lastCoords then
            local dist = # (coords - lastCoords)
            if dist > Config.Detection.MaxTeleportDistance then
                sendFlag('teleport', { distance = dist })
            end

            local zDiff = coords.z - lastCoords.z
            if zDiff > Config.Detection.NoclipHeightThreshold and not IsPedFalling(ped) and not IsPedInAnyVehicle(ped, false) then
                sendFlag('noclip_height', { zDiff = zDiff })
            end
        end

        for weaponName, _ in pairs(Config.IllegalWeapons) do
            local hash = GetHashKey(weaponName)
            if HasPedGotWeapon(ped, hash, false) then
                sendFlag('illegal_weapon', { weapon = weaponName })
                RemoveWeaponFromPed(ped, hash)
            end
        end

        TriggerServerEvent('dragon_ac:positionUpdate', {
            token = sessionToken,
            x = coords.x,
            y = coords.y,
            z = coords.z,
            speed = speed,
            heading = GetEntityHeading(ped),
        })

        lastCoords = coords
        lastCheckAt = GetGameTimer()

        ::continue::
    end
end)

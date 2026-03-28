Config = {}

Config.ResourceName = 'dragon_anticheat'
Config.TokenRotateSeconds = 120
Config.FlagLimit = 6
Config.BanReason = 'Dragon Anticheat: comportamento suspeito recorrente.'

Config.Webhook = ''
Config.BackendApi = 'http://127.0.0.1:3000/api'
Config.BackendSecret = 'CHANGE_ME_BACKEND_SECRET'

Config.Detection = {
    GodModeHealthLimit = 250,
    MaxSpeedMps = 18.0,
    MaxTeleportDistance = 120.0,
    NoclipHeightThreshold = 10.0,
    PositionIntervalMs = 900,
    ReplayPointsLimit = 240,
}

Config.IllegalWeapons = {
    ['WEAPON_RAILGUN'] = true,
    ['WEAPON_RPG'] = true,
    ['WEAPON_MINIGUN'] = true,
    ['WEAPON_HOMINGLAUNCHER'] = true,
}

Config.StaffGroups = {
    admin = 3,
    mod = 2,
    suporte = 1,
}

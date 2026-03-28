Config = {}

Config.ResourceSecret = 'CHANGE_ME_RESOURCE_SECRET'
Config.BackendBaseUrl = 'http://127.0.0.1:3000'
Config.BackendApiKey = 'CHANGE_ME_PANEL_API_KEY'

Config.MaxFlagsBeforeAutoBan = 6
Config.FlagWeights = {
  godmode = 2,
  speed_hack = 2,
  teleport = 2,
  noclip_height = 1,
  illegal_weapon = 3,
  ai_pattern = 1,
}

Config.SpeedThreshold = 18.0
Config.TeleportDistanceThreshold = 120.0
Config.NoclipHeightThreshold = 7.0
Config.HealthDeltaIgnore = 5
Config.TickMs = 1000
Config.ReplayWindow = 120

Config.WeaponWhitelist = {
  [GetHashKey('WEAPON_UNARMED')] = true,
  [GetHashKey('WEAPON_KNIFE')] = true,
  [GetHashKey('WEAPON_BAT')] = true,
  [GetHashKey('WEAPON_PISTOL')] = true,
  [GetHashKey('WEAPON_COMBATPISTOL')] = true,
  [GetHashKey('WEAPON_SMG')] = true,
  [GetHashKey('WEAPON_CARBINERIFLE')] = true,
}

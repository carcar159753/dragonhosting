fx_version 'cerulean'
game 'gta5'

lua54 'yes'

name 'dragon_anticheat'
author 'DragonHosting'
description 'Anticheat avançado com integração em painel web'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'shared/utils.lua'
}

client_script 'client/client.lua'
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/server.lua'
}

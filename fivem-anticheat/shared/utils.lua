local Utils = {}

function Utils.now()
    return os.time()
end

function Utils.uuid()
    local template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function(c)
        local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
        return string.format('%x', v)
    end)
end

function Utils.round(n, decimals)
    local power = 10 ^ (decimals or 0)
    return math.floor((n * power) + 0.5) / power
end

function Utils.distance(a, b)
    local dx, dy, dz = a.x - b.x, a.y - b.y, a.z - b.z
    return math.sqrt((dx * dx) + (dy * dy) + (dz * dz))
end

_DRAGON_UTILS = Utils

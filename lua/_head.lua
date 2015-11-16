local prefix = '{' .. KEYS[1] .. '}' .. '::'
local id = ARGV[1]
local key = prefix .. id

local updateHasChildenCache = function (target, hasChildren)
  local parentKey = prefix .. target .. '::P'
  local parents = redis.call('smembers', parentKey)

  for _, parent in ipairs(parents) do
    if parent then
      local parentValue = redis.call('get', prefix .. parent);

      if parentValue then
        local list = cmsgpack.unpack(parentValue)
        for _, v in ipairs(list) do
          if v[1] == id then
            v[2] = 1
          end
        end
        redis.call('set', prefix .. parent, cmsgpack.pack(list));
      else
        -- REMEDY
        redis.call('srem', parentKey, parent)
      end
    end
  end
end

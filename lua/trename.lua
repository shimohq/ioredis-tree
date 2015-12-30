if #ARGV ~= 2 then
  return redis.error_reply("ERR wrong number of arguments for 'trename' command")
end

-- Parent: prefix .. id / key
local newName = ARGV[2]
local newKey = prefix .. newName

local newKeyExists = redis.call('exists', newKey) == 1 or redis.call('exists', newKey .. '::P') == 1
if newKeyExists then
  return redis.error_reply("ERR target node already exists")
end

if redis.call('exists', key) == 1 then
  redis.call('rename', key, newKey)

  -- Update children
  local value = redis.call('get', newKey);
  if value then
    local list = cmsgpack.unpack(value)
    for _, v in ipairs(list) do
      local parent = prefix .. v[1] .. '::P'
      redis.call('srem', parent, id);
      redis.call('sadd', parent, newName);
    end
  end
end

-- Update parents
local parentKey = key .. '::P'
local parents = redis.call('smembers', parentKey)
for _, parent in ipairs(parents) do
  if parent then
    local parentValue = redis.call('get', prefix .. parent);

    if parentValue then
      local list = cmsgpack.unpack(parentValue)
      for _, v in ipairs(list) do
        if v[1] == id then
          v[1] = newName
        end
      end
      redis.call('set', prefix .. parent, cmsgpack.pack(list));
    else
      -- REMEDY
      redis.call('srem', parentKey, parent)
    end
  end
end

if #parents > 0 then
  redis.call('rename', parentKey, newKey .. '::P');
end

return redis.status_reply('OK')

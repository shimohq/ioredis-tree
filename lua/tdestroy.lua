local deleteCount = 0

local delNode
delNode = function (id, parent)
  local value = redis.call('get', prefix .. id)

  if value then
    local list = cmsgpack.unpack(value)
    deleteCount = deleteCount + #list
    for i, v in ipairs(list) do
      if v[2] > 0 then
        delNode(v[1])
      else
        redis.call('del', prefix .. v[1] .. '::P')
      end
    end
    redis.call('del', prefix .. id)
  end

  redis.call('srem', prefix .. id .. '::P', parent)
end

local targetParent
if ARGV[2] and string.upper(ARGV[2]) then
  if not ARGV[3] then
    return redis.error_reply("ERR wrong number of arguments for 'tdel' command")
  end
  targetParent = ARGV[3]
end

if targetParent then
  redis.call('srem', prefix .. id .. '::P')
else
  parents = redis.call('smembers', prefix .. id .. '::P')
  redis.call('del', prefix .. id .. '::P')
end

-- Delete parent references

local deleteReference = function (id, parent)
  local value = redis.call('get', prefix .. parent)

  if not value then
    return
  end

  local list = cmsgpack.unpack(value)

  for i = #list, 1, -1 do
     local item = list[i];
     if item[1] == id then
       table.remove(list, i)
     end
  end

  redis.call('set', prefix .. parent, cmsgpack.pack(list))
end


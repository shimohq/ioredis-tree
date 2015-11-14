local getChildren
getChildren = function (id, level, result)
  level = level - 1
  local value = redis.call('get', prefix .. id)
  if not value then
    return result
  end
  local list = cmsgpack.unpack(value)

  for i, v in ipairs(list) do
    local cid = v[1]
    local childCount = v[2]

    local item = { cid, childCount }

    if childCount > 0 and level ~= 0 then
      getChildren(cid, level, item)
    end

    result[#result + 1] = item
  end

  return result
end

local level = -1

local option = ARGV[2]
if option then
  if string.upper(option) == 'LEVEL' then
    if not ARGV[3] then
      return redis.error_reply("ERR wrong number of arguments for 'tchildren' command")
    end
    level = tonumber(ARGV[3])
  end
end

if level == 0 then
  return nil
end

return getChildren(id, level, {})

function getChildren(id, level, result)
  local list = cmsgpack.unpack(redis.call('get', prefix .. id))

  for i, v in ipairs(list) do
    local cid = v[0]
    local childCount = v[1]

    local item = { cid, childCount }

    if childCount > 0 and level ~= 0 then
      getChildren(cid, level - 1, item)
    end

    result[#result + 1] = item
  end

  return result
end

local level = ARGV[argIndex + 1]
if level == 0 then
  return nil
end

if not level or level < 0 then
  level = -1
end

return getChildren(key, level, {})

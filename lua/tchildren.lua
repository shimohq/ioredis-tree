local getChildren = function (id, level, result)
  local list = cmsgpack.unpack(redis.call('get', prefix .. id))

  for i, v in ipairs(list) do
    local cid = v[1]
    local childCount = v[2]

    local item = { cid, childCount }

    if childCount > 0 and level ~= 0 then
      getChildren(cid, level - 1, item)
    end

    result[#result + 1] = item
  end

  return result
end

local level = ARGV[2]
if level then
  level = tonumber(level)
  if level == 0 then
    return nil
  end
else
  level = -1
end

return getChildren(id, level, {})

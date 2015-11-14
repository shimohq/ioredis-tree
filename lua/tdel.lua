local deleteCount = 0

local delNode
delNode = function (id)
  local value = redis.call('get', prefix .. id)
  if not value then
    return
  end
  local list = cmsgpack.unpack(value)
  deleteCount = deleteCount + #list
  for i, v in ipairs(list) do
    if v[2] > 0 then
      delNode(v[1])
    end
  end

  redis.call('del', prefix .. id)
  redis.call('del', prefix .. id .. '::P')
end

local parent = redis.call('get', prefix .. id .. '::P')
if parent then
  local list = cmsgpack.unpack(redis.call('get', prefix .. parent))
  for i, v in ipairs(list) do
    if v[1] == id then
      v[2] = v[2] - 1
    end
  end
  redis.call('set', prefix .. parent , cmsgpack.pack(list))
end

delNode(id)

return deleteCount + 1

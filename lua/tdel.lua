local deleteCount = 0

local delNode = function (id)
  local list = cmsgpack.unpack(prefix .. id)
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
  local list = cmsgpack.unpack(prefix .. parent)
  for i, v in ipairs(list) do
    if v[1] == id then
      v[2] = v[2] - 1
    end
  end
  redis.call('set', prefix .. parent , cmsgpack.pack(list))
end

delNode(id)

return deleteCount

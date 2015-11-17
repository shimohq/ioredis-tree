local deleteCount = 0

local destroyNode
destroyNode = function (id)
  local parents = redis.call('smembers', prefix .. id .. '::P')
  for _, parent in ipairs(parents) do
    deleteReference(parent, id, 0)
  end

  local value = redis.call('get', prefix .. id)

  if #parents > 0 or value then
    deleteCount = deleteCount + 1
  end

  if not value then
    return
  end

  local list = cmsgpack.unpack(value)
  -- deleteCount = deleteCount + #list
  for _, node in ipairs(list) do
    destroyNode(node[1])
  end

  redis.call('del', prefix .. id)
end

destroyNode(id)

return deleteCount

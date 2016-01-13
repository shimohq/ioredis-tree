local pruneTree
pruneTree = function (id)
  local value = redis.call('get', prefix .. id)
  if not value then
    return
  end
  local list = cmsgpack.unpack(value)

  for i, v in ipairs(list) do
    local cid = v[1]

    if (cid == id) then
      return redis.error_reply("ERR infinite loop found in 'tchildren' command")
    end

    local parents = redis.call('smembers', prefix .. cid .. '::P')
    for _, parent in ipairs(parents) do
      if parent ~= id then
        deleteReference(parent, cid, 0)
      end
    end

    pruneTree(cid)
  end
end

pruneTree(id)

return redis.status_reply('OK');

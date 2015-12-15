local getPath = function (from, to)
  if from == to then
    return nil
  end

  local visitedNode = {}

  -- First step, we backtrack to the first ancestor that has
  -- more than one parent to reduce the overhead.
  local path = {}

  while true do
    if visitedNode[to] then
      return redis.error_reply("ERR infinite loop (parent) found in 'tpath' command")
    end
    visitedNode[to] = true
    local parents = redis.call('smembers', prefix .. to .. '::P')
    local length = #parents
    if length == 0 then
      return nil
    else
      for _, parent in ipairs(parents) do
        if parent == from then
          return path
        end
      end
      if length == 1 then
        to = parents[1]
        table.insert(path, 1, to)
      else
        break
      end
    end
  end

  local copyTable = function (t)
    local t2 = {}
    for k, v in pairs(t) do
      t2[k] = v
    end
    return t2
  end

  local queue = { {from} }
  -- push the first path into the queue
  while #queue > 0 do
    -- get the first path from the queue
    local lpath = table.remove(queue, 1)
    -- get the last node from the lpath
    local node = lpath[#lpath]
    -- enumerate all adjacent nodes, construct a new lpath and push it into the queue
    local children = redis.call('get', prefix .. node)
    if children then
      children = cmsgpack.unpack(children)
      for _, child in ipairs(children) do
        if child[1] == to then
          for _, v in ipairs(path) do
            lpath[#lpath + 1] = v
          end
          table.remove(lpath, 1)
          return lpath
        end
        if child[2] ~= 0 then
          if child[1] == lpath[#lpath] then
            return redis.error_reply("ERR infinite loop (children) found in 'tpath' command")
          end
          local newPath = copyTable(lpath)
          newPath[#newPath + 1] = child[1]
          queue[#queue + 1] = newPath
        end
      end
    end
  end

  return nil
end

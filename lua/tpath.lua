if #ARGV ~= 2 then
  return redis.error_reply("ERR wrong number of arguments for 'tpath' command")
end

local to = ARGV[2]

-- First step, we backtrack to the first ancestor that has
-- more than one parent to reduce the overhead.
local path = {}

while true do
  local parents = redis.call('smembers', prefix .. to .. '::P')
  local length = #parents
  if length == 0 then
    return nil
  else
    for _, parent in ipairs(parents) do
      if parent == id then
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


queue = { {id} }
-- push the first path into the queue
while #queue > 0 do
  -- get the first path from the queue
  lpath = table.remove(queue, 1)
  -- get the last node from the lpath
  node = lpath[#lpath]
  -- enumerate all adjacent nodes, construct a new lpath and push it into the queue
  local children = redis.call('get', prefix .. node)
  for _, child in ipairs(children) do
    if child[1] == to then
      for _, v in ipairs(path) do
        lpath[#lpath + 1] = v
      end
      return lpath
    end
    if child[2] ~= 0 then
      local newPath = copyTable(lpath)
      newPath[#newPath + 1] = child
      queue[#queue + 1] = newPath
    end
  end
end

return nil

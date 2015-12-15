if #ARGV ~= 4 then
  return redis.error_reply("ERR wrong number of arguments for 'tinsert' command")
end

local child = ARGV[2]
if child == id then
  return redis.error_reply("ERR parent node cannot be same with new node")
end

local childHasChild = redis.call('exists', prefix .. child)
if childHasChild then
  if getPath(child, id) then
    return redis.error_reply("ERR parent node cannot be the posterity of new node")
  end
end

-- Among BEFORE, AFTER and INDEX
local insertType = string.upper(ARGV[3])
local insertPivot = ARGV[4]

local parentHasChildren
local parentChildList = redis.call('get', key)
if parentChildList then
  parentHasChildren = true
  parentChildList = cmsgpack.unpack(parentChildList)
else
  parentHasChildren = false
  parentChildList = {}
end

-- Convert BEFORE and AFTER to INDEX by finding out
-- the index of the pivot
if insertType == 'BEFORE' or insertType == 'AFTER' then
  local index
  for i, v in ipairs(parentChildList) do
    if v[1] == insertPivot then
      index = i
      break
    end
  end

  -- If pivot is not found, set the index to
  -- head (BEFORE) or tail (AFTER)
  if index then
    if insertType == 'BEFORE' then
      insertPivot = index - 1
    else
      insertPivot = index
    end
  else
    if insertType == 'BEFORE' then
      insertPivot = 0
    else
      insertPivot = -1
    end
  end

  insertType = 'INDEX'
else
  insertPivot = tonumber(insertPivot)
end

if insertType ~= 'INDEX' then
  return redis.error_reply('ERR Invalid insert option')
end

local parentChildListLength = #parentChildList

-- Support negative index
if insertPivot < 0 then
  insertPivot = parentChildListLength + insertPivot + 2
else
  insertPivot = insertPivot + 1
end

-- Handle out of range
if insertPivot < 1 then
  insertPivot = 1
elseif insertPivot > parentChildListLength + 1 then
  insertPivot = parentChildListLength + 1
end

table.insert(parentChildList, insertPivot, { child, childHasChild })

-- Update parent childCount
if not parentHasChildren then
  updateHasChildenCache(id, 1)
end

redis.call('set', key, cmsgpack.pack(parentChildList))
redis.call('sadd', prefix .. child .. '::P', id)

-- Return the inserted position
return insertPivot - 1

if #ARGV ~= 4 then
  return redis.error_reply("ERR wrong number of arguments for 'tinsert' command")
end

local data = ARGV[2]
local parentKey = prefix .. data .. '::P'

local oldParent = redis.call('get', parentKey)
if oldParent then
  -- Remove from the old parent
  local list = cmsgpack.unpack(oldParent)
  for i, v in ipairs(list) do
    if v[1] == insertPivot then
      table.remove(list, i)
      break;
    end
  end
  redis.call('set', parentKey, cmsgpack.pack(list))
end

-- Among BEFORE, AFTER and INDEX
local insertType = string.upper(ARGV[3])
local insertPivot = tonumber(ARGV[4])

local list = redis.call('get', key)
if list then
  list = cmsgpack.unpack(list)
else
  list = {}
end

-- Convert BEFORE and AFTER to INDEX by finding out
-- the index of the pivot
if insertType == 'BEFORE' or insertType == 'AFTER' then
  for i, v in ipairs(list) do
    if v[1] == insertPivot then
      insertPivot = i
      break
    end
  end

  -- If pivot is not found, set the index to
  -- head (BEFORE) or tail (AFTER)
  if not index then
    if insertType == 'BEFORE' then
      insertPivot = 0
    else
      insertPivot = -1
    end
  end

  insertType = 'INDEX'
end

if insertType ~= 'INDEX' then
  return redis.error_reply('ERR Invalid insert option')
end

local listLength = #list

-- Support negative index
if insertPivot < 0 then
  insertPivot = listLength + insertPivot + 2
else
  insertPivot = insertPivot + 1
end

-- Handle out of range
if insertPivot < 1 then
  insertPivot = 1
elseif insertPivot > listLength + 1 then
  insertPivot = listLength + 1
end

table.insert(list, insertPivot, { data, 0 })

redis.call('set', key, cmsgpack.pack(list))
redis.call('set', parentKey, id)

-- Return the inserted position
return insertPivot

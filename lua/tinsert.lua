if #ARGV ~= 4 then
  return redis.error_reply("ERR wrong number of arguments for 'tinsert' command")
end

local data = ARGV[2]
local parentKey = prefix .. data .. '::P'

local formerParent = redis.call('get', parentKey)
local formerParentValue
local formerGrandparent
local formerGrandparentValue
if formerParent then
  -- Remove from the former parent
  local list = cmsgpack.unpack(redis.call('get', prefix .. formerParent))
  for i, v in ipairs(list) do
    if v[1] == insertPivot then
      table.remove(list, i)
      formerParentValue = list
      break;
    end
  end

  -- Update child count in the grandparent
  formerGrandparent = redis.call('get', prefix .. formerParent .. '::P')
  if formerGrandparent then
    local list = cmsgpack.unpack(prefix .. formerGrandparent)
    for i, v in ipairs(list) do
      if v[1] == formerParent then
        v[2] = v[2] - 1
        formerGrandparentValue = list
        break;
      end
    end
  end
end

-- Prevent inserting data into its posterity
if redis.call('exists', prefix .. data) == 1 then
  local parent = id
  while parent do
    if parent == data then
      return redis.error_reply('ERR node to be inserted into cannot be the posterity of new node')
    end
    parent = redis.call('get', prefix .. id .. '::P')
  end
end

-- Among BEFORE, AFTER and INDEX
local insertType = string.upper(ARGV[3])
local insertPivot = ARGV[4]

local list = redis.call('get', key)
if list then
  list = cmsgpack.unpack(list)
else
  list = {}
end

-- Convert BEFORE and AFTER to INDEX by finding out
-- the index of the pivot
if insertType == 'BEFORE' or insertType == 'AFTER' then
  local index
  for i, v in ipairs(list) do
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

-- Update parent childCount
local grandparent = redis.call('get', key .. '::P')
if grandparent then
  local grandparentValue = redis.call('get', prefix .. grandparent);
  local list = cmsgpack.unpack(grandparentValue)
  for i, v in ipairs(list) do
    if v[1] == id then
      v[2] = v[2] + 1
      redis.call('set', prefix .. grandparent, cmsgpack.pack(list));
      break;
    end
  end
end

if formerParentValue then
  redis.call('set', formerParent, cmsgpack.pack(formerParentValue))
  if formerGrandparentValue then
    redis.call('set', formerGrandparent, cmsgpack.pack(formerGrandparentValue))
  end
end
redis.call('set', key, cmsgpack.pack(list))
redis.call('set', parentKey, id)

-- Return the inserted position
return insertPivot - 1

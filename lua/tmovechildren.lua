local to = ARGV[2]
local position = 'APPEND'
if ARGV[3] then
  position = string.upper(ARGV[3])
end

local value = redis.call('get', key)

if not value then
  return 0
end

local sourceList = cmsgpack.unpack(value)
local sourceListSize = #sourceList;

if sourceListSize == 0 then
  return 0
end

local parentHasChildren
local targetList = redis.call('get', prefix .. to)
if targetList then
  parentHasChildren = true
  targetList = cmsgpack.unpack(targetList)
else
  parentHasChildren = false
  targetList = {}
end

for i, v in ipairs(sourceList) do
  local cid = v[1]
  if position == 'APPEND' then
    table.insert(targetList, v)
  else
    table.insert(targetList, i, v)
  end
  redis.call('sadd', prefix .. cid .. '::P', to)
  redis.call('srem', prefix .. cid .. '::P', id)
end

-- Update parent childCount
if not parentHasChildren then
  updateHasChildenCache(to, 1)
end

redis.call('set', prefix .. to, cmsgpack.pack(targetList))
updateHasChildenCache(id, 0)
redis.call('del', key)

return sourceListSize

-- Parent: prefix .. id / key
local parents = redis.call('smembers', key .. '::P')
local to = ARGV[2]
local position = ARGV[3]

local total = 0
for _, parent in ipairs(parents) do
  if not exclude or parent ~= exclude then
    total = total + 1
    deleteReference(parent, id, 0)
  end
end

local value = redis.call('get', key)

if not value then
  return 0
end

local list = cmsgpack.unpack(value)

if #list == 0 then
  return 0
end

local parentHasChildren = redis.call('exists', prefix .. to) == 1

for i, v in ipairs(list) do
end

if deleted > 0 then
  if #list == 0 then
    updateHasChildenCache(parent, 0)
    redis.call('del', prefix .. parent)
  else
    redis.call('set', prefix .. parent, cmsgpack.pack(list))
  end
end

if remain == 0 then
  redis.call('srem', prefix .. node .. '::P', parent)
end

return remain

if #ARGV ~= 3 then
  return redis.error_reply("ERR wrong number of arguments for 'trem' command")
end

local deleteCount = 0

-- Parent: prefix .. id / key
local count = tonumber(ARGV[2])
local node = ARGV[3]

local remain = deleteReference(id, node, count)
if remain == 0 then
  redis.call('srem', prefix .. node .. '::P')
end

return remain

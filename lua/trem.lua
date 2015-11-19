if #ARGV ~= 3 then
  return redis.error_reply("ERR wrong number of arguments for 'trem' command")
end

-- Parent: prefix .. id / key
local count = tonumber(ARGV[2])
local node = ARGV[3]

return deleteReference(id, node, count)

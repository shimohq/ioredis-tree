if #ARGV ~= 2 then
  return redis.error_reply("ERR wrong number of arguments for 'tpath' command")
end

local to = ARGV[2]

return getPath(id, to)

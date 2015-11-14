local level = -1

local option = ARGV[2]
if option then
  if string.upper(option) == 'LEVEL' then
    if not ARGV[3] then
      return redis.error_reply("ERR wrong number of arguments for 'tchildren' command")
    end
    level = tonumber(ARGV[3])
  end
end

if level == 0 then
  return {}
end

local ancestors = {}

local parent = redis.call('get', key .. '::P')

while parent and level ~= 0 do
  ancestors[#ancestors + 1] = parent
  level = level - 1
  parent = redis.call('get', prefix .. parent .. '::P')
end

return ancestors

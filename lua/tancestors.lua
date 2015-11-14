local level = ARGV[2]
if level then
  level = tonumber(level)
  if level == 0 then
    return nil
  end
else
  level = -1
end

local ancestors = {}

local parent = id

while parent and level ~= 0 do
  level = level - 1
  parent = redis.call('get', prefix .. parent .. '::P')
  ancestors[#ancestors + 1] = parent
end

return ancestors

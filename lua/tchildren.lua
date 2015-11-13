local level = ARGV[argIndex + 1]
local items = { key }
while level > 0 do
  items = redis.call('get', items)
end

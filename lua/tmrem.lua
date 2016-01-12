-- Parent: prefix .. id / key
local parents = redis.call('smembers', key .. '::P')
local option = ARGV[2]

local exclude
if option then
  if string.upper(option) == 'NOT' then
    exclude = ARGV[3]
  end
end

local total = 0
for _, parent in ipairs(parents) do
  if not exclude or parent ~= exclude then
    total = total + 1
    deleteReference(parent, id, 0)
  end
end

return total

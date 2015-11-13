local prefix = '{' .. KEYS[0] .. '}' .. '::'
local id
local argIndex
if string.upper(ARGV[0]) == 'ROOT' then
  argIndex = 1
  id = 'ROOT:' .. ARGV[1]
else
  argIndex = 0
  id = ARGV[0]
end
local key = prefix .. id

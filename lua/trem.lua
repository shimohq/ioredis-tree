if #ARGV ~= 3 then
  return redis.error_reply("ERR wrong number of arguments for 'trem' command")
end

local deleteReference = function (parent, node, count)
  local value = redis.call('get', prefix .. parent)

  if not value then
    return 0
  end

  local list = cmsgpack.unpack(value)

  local listSize = #list
  if count == 0 then
    count = -listSize
  end

  local remain = 0
  local deleted = 0

  if count < 0 then
    count = -count
    for i = listSize, 1, -1 do
       local item = list[i];
       if item[1] == id then
         if count == deleted then
           remain = remain + 1
         else
          table.remove(list, i)
          deleted = deleted + 1
         end
       end
    end
  else
    local i = 1
    while i <= listSize do
       local item = list[i];
       if item[1] == id then
         if count == deleted then
           remain = remain + 1
         else
           table.remove(list, i)
           deleted = deleted + 1
         end
        else
          i = i + 1
       end
    end
  end

  return remain
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

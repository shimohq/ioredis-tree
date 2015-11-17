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

  if #list == 0 then
    updateHasChildenCache(parent, 0)
  end

  return remain
end

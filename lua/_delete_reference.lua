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
      if item[1] == node then
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
    while i <= #list do
      local item = list[i];
      if item[1] == node then
        if count == deleted then
          remain = remain + 1
          i = i + 1;
        else
          table.remove(list, i)
          deleted = deleted + 1
        end
      else
        i = i + 1
      end
    end
  end

  if deleted > 0 then
    if #list == 0 then
      updateHasChildenCache(parent, 0)
      redis.call('del', prefix .. parent)
    else
      redis.call('set', prefix .. parent, cmsgpack.pack(list))
    end
  end

  if remain == 0 then
    redis.call('srem', prefix .. node .. '::P', parent)
  end

  return remain
end

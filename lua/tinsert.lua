local data = ARGV[argIndex + 1]
local insertType = string.upper(ARGV[argIndex + 2])
local insertPivot = ARGV[argIndex + 3]

if insertType == 'BEFORE' or insertType == 'AFTER' then
  local result = redis.call('linsert', key, insertType, insertPivot)
  if result ~= -1 then
    return result
  end
  -- Pivot not found, fallback to INDEX mode
  insertType = 'INDEX'
  if insertType == 'BEFORE' then
    insertPivot = '0'
  else
    insertPivot = '-1'
  end
end

if insertType == 'INDEX' then
  -- Fast way to insert item to head and tail
  if insertPivot == '0' then
    return redis.call('lpush', key, data)
  elseif insertPivot == '-1' then
    return redis.call('rpush', key, data)
  end

  local pivot = redis.call('lindex', key, insertPivot)
  if pivot then
    return redis.call('linsert', key, 'BEFORE', pivot, data)
  end

  -- Index is out of range, insert to tail
  return redis.call('rpush', key, data)
end

return redis.error_reply('ERR Wrong insert option')

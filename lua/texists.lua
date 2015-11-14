local exists = redis.call('exists', key) == 1 or redis.call('exists', key .. '::P') == 1

if exists then return 1 else return 0 end

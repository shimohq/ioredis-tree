return redis.call('smembers', key .. '::P')

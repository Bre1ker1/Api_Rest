const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.on('error', (err) => console.error('[Redis Client Error]', err));
client.connect().catch(console.error);

async function acquireLock(lockKey, ttlMs = 5000) {
  const token = uuidv4();
  try {
    const result = await client.set(lockKey, token, {
      PX: ttlMs,
      NX: true
    });
    if (result === 'OK') {
      return token;
    }
    return null;
  } catch (error) {
    console.error('[Redis Lock] Error al adquirir candado:', error);
    return null;
  }
}

async function releaseLock(lockKey, token) {
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  try {
    const result = await client.eval(luaScript, {
      keys: [lockKey],
      arguments: [token]
    });
    return result === 1;
  } catch (error) {
    console.error('[Redis Lock] Error al liberar candado con Lua:', error);
    return false;
  }
}

module.exports = { acquireLock, releaseLock };
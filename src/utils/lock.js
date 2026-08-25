const { createClient } = require('redis');
require('dotenv').config();

// Forzamos RESP2 (protocol: 2) para compatibilidad con Redis en Windows
const redisClient = createClient({ 
  url: process.env.REDIS_URL,
  RESP: 2 
});

redisClient.on('error', (err) => console.error('Error en Redis:', err));

(async () => {
  try {
    await redisClient.connect();
    console.log('Conectado a Redis exitosamente.');
  } catch (err) {
    console.error('Error al conectar con Redis:', err);
  }
})();

async function adquirirLock(recursoId, tokenPropietario, ttlSegundos = 5) {
  const lockKey = `lock:${recursoId}`;
  const resultado = await redisClient.set(lockKey, tokenPropietario, {
    NX: true,
    EX: ttlSegundos
  });
  return resultado === 'OK';
}

async function liberarLock(recursoId, tokenPropietario) {
  const lockKey = `lock:${recursoId}`;
  const scriptLua = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  await redisClient.eval(scriptLua, {
    keys: [lockKey],
    arguments: [tokenPropietario]
  });
}

module.exports = { adquirirLock, liberarLock };
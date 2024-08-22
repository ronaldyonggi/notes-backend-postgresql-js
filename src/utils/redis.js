const { createClient } = require('redis');

const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

const connectRedisClient = async () => {
  await client.connect();
};

connectRedisClient();

const setAsync = async (key, value) => {
  await client.set(key, value);
};

const getAsync = async (key) => {
  return await client.get(key);
};

const delAsync = async (key) => {
  await client.del(key);
};

module.exports = {
  setAsync,
  getAsync,
  delAsync
};

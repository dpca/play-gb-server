import redis from 'redis';

const redisUrl = process.env.REDIS_URL || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const client = redis.createClient(redisPort, redisUrl);

export default client;

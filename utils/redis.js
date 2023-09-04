const redis = require('redis');
const util = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Promisify Redis client methods
    this.client.getAsync = util.promisify(this.client.get).bind(this.client);
    this.client.setAsync = util.promisify(this.client.set).bind(this.client);
    this.client.delAsync = util.promisify(this.client.del).bind(this.client);

    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
    });
  }

  isAlive() {
    return this.client.connected;
    // return !this.client.connected;
  }
  async get(key) {
    try {
      const value = await this.client.getAsync(key);
      return value;
    } catch (error) {
      console.error('Redis GET Error:', error);
      throw error;
    }
  }

  async set(key, value, durationSeconds) {
    try {
      const result = await this.client.setAsync(key, value, 'EX', durationSeconds);
      return result === 'OK';
    } catch (error) {
      console.error('redis SET Error:', eror);
      throw error;
    }
  }

  async del(key) {
    try {
      const result = await this.client.delAsync(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL Error:', error);
      throw error;
    }
  }
}

const redisClient = new RedisClient;

module.exports = redisClient;

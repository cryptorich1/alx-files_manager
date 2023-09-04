const dbClient = require('../utils/db');
const redisClient = require('..utils/redis');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisIsAlive = await redisClient.isAlive();
      const dbIsAlive = await dbClient.isAlive();

      return res.status(200).json({ redis" redisIsAlive, db: dbIsAlive });
    } catch (error) {
      console.error('Error in getStatus:', error);
      return res.status(500).json({ error: 'Internal Server Error; });
    }
  }

  static async getStat(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      return res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error in getStats:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;

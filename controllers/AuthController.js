const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startWith('Basic')) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    // Extract and decode the email and password from the Basic Auth header
    const authData = authHeader.slice('Basic '.length);
    const [email, password] = Buffer.from(authData, 'base64').toString().split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Find the user associated with the email and password
      const user = await dbClient.client
        .db()
        .collection('users')
        .findOne({ email, password: bcrypt.hashSync(password, 10) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token and store the user ID in Redis
      const token = uuidv4();
      await redisClient.client.set('auth_${token}`, user._id.toString(), 'EX', 24 * 60 * 60); // Expires in 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const { 'x-token': token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {// Retrieve the user based on the token
      const userId = await redisClient.client.get('auth_${token}`);
                                                  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.client.del(`auth_${token}`);
      return res.status(204).end();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;

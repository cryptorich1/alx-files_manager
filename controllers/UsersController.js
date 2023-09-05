const bcrypt = require('bcrypt');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    try {
      const userExists = await dbClient.client // Check if the email already exists in the database
        .db()
        .collection('users')
        .findOne({ email });

      if (userExists) {
        return res.status(400).json({ error: 'Already exist'});
      }

      const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password

      // Create the new user object
      const newUser = {
        email,
        password: hashedPassword,
      };
      
      // Insert the new user into the database
      const result = await dbClient.client
        .db()
        .collection('users')
        .insertOne(newUser);

      // Return the newly created user with only email and id
      return res.status(201).json({ email: newUser.email, id: result.insertedId });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
   static async getMe(req, res) {
    const { 'x-token': token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Retrieve the user based on the token
      const userId = await redisClient.client.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve the user object (email and id only)
      const user = await dbClient.client
        .db()
        .collection('users')
        .findOne({ _id: userId });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ email: user.email, id: user._id });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}

module.exports = UsersController;

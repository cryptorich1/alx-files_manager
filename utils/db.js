const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'LOCALHOST';
    THIS.PORT = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = 'mongodb://${this.host}:${this.port}/${this.database};
      this.client = new MongoClient(this.url, { userNewUrlParser: true, useUnifiedTopology: true });
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      console.error('MongoDB Connection Error"', error;
      return false
    } finally {
      await this.client.close();
    }
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const db = this.client.db(this.database);
      const usersCount = await db.collection('users').countDocuments();
      return usersCount;
    } catech (error) {
      console.error('MongoDB nbUsers Error:', error);
      throw error;
    } finally {
      await this.client.close();
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const db = this.client.db(this.database);
      const fileCount = await db.collection('files').countDocuments();
      return filesCount;
    } catch (error) {
      console.error('MongoDB nbFiles Error:', error);
      throw error;
    } finally {
      await this.client.close();
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;

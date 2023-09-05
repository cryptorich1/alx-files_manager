const fs = require('fs');
const path = require('path');
const {v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');

class FileController {
  static async postUpload(req, res) {
    const { token } = req.header;
    const { name, type, parentId, isPublic, data } = req.body;

    // Check if name and type are provided
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].include(type)) {
      return res.status(400).json({ error: 'Missing type or invalid type' });
    }

    try { // Retrieve the user based on the token
      const user = await dbClient.client.db().collection('users').findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check if data is missing for file or image types
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      let localPath = '';

      if (type !== 'folder') {
        // Generate a unique filename using UUID
        const filename = uuidv4();
        
        // Get the storing folder path from env variables or use default
        const storingFolderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        
        // Ensure the storing folder exists
        if (!fs.existsSync(storingFolderPath)) {
          fs.mkdirSync(storingFolderPath, { recursive: true });
        }
        
        // Create the absolute local path
        localPath = path.join(storingFolderPath, filename);
        
        // Save the file in clear (data contains Base64 content) to the local path
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      }

      // Create the new file document
      const newFile = {
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath: type !== 'folder' ? localPath : null,
      };

      // Insert the new file into the database
      const result = await dbClient.client.db().collection('files').insertOne(newFile);

      // Return the newly created file with a status code of 201
      return res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async getShow(req, res) {
    const { token } = req.headers;
    const { id } = req.params;

    try {
      // Retrieve the user based on the token
      const user = await dbClient.client.db().collection('users').findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve the file document based on the ID and user
      const file = await dbClient.client
        .db()
        .collection('files')
        .findOne({ _id: id, userId: user._id });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const { token } = req.headers;
    const { parentId, page } = req.query;

    try {
      // Retrieve the user based on the token
      const user = await dbClient.client.db().collection('users').findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Convert page to a number and set default values
      const pageNumber = parseInt(page, 10) || 0;
      const itemsPerPage = 20;

      // Calculate skip value for pagination
      const skip = pageNumber * itemsPerPage;

      // Build the aggregation pipeline for retrieving files
      const pipeline = [
        { $match: { parentId: parentId || 0, userId: user._id } },
        { $skip: skip },
        { $limit: itemsPerPage },
      ];

      // Retrieve the list of file documents
      const files = await dbClient.client
        .db()
        .collection('files')
        .aggregate(pipeline)
        .toArray();

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
module.exports = FileController;

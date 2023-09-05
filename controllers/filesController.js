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
}
module.exports = FileController;

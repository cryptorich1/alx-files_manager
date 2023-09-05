const express = require('express');
const AppController = require('../controllers/AppController');
const router = express.Router();
const UserController = require('../controllers/UserController');
const FilesController = require('../controllers/FilesController');


//endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/files', FilesController.postUpload);
router.post('/users', UsersController.postNew);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);


module.exports = router;

const express = require('express');
const AppController = require('../controllers/AppController');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Define the endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

//new endpoint for creating a user
router.post('/users', UsersController.postNew);

module.exports = router;

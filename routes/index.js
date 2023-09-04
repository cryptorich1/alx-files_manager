const express = require('express');
const UserController = require('../controllers/UserController');


const router = express.Router();

//new endpoint for creating a user
router.post('/users', UsersController.postNew);

module.exports = router;

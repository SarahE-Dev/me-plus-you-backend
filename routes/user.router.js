const express = require('express');


const router = express.Router();
const {validateUserData} = require('../utils/middleware')


const {createUser, loginUser} = require('../controllers/user.controller');

router.post('/signup', validateUserData, createUser);

router.post('/login', loginUser);   

router.get('/', (req, res) => {
    res.send('Hello from user router');
});

module.exports = router;
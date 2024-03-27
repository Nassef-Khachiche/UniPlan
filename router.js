const express = require('express');
router = express.Router();

const { get_login } = require('./controllers/auth/login');
const { get_register } = require('./controllers/auth/register');
const { get_dashboard } = require('./controllers/dashboard');

router.get('/', get_dashboard);
router.get('/login', get_login);
router.get('/register', get_register);


module.exports = router;
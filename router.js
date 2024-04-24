const express = require('express');
const router = express.Router();

const { get_login, login } = require('./controllers/auth/login');
const { get_register, register } = require('./controllers/auth/register');
const { get_dashboard } = require('./controllers/dashboard');
const { all_projects } = require('./controllers/project');
const { view_project } = require('./controllers/project');

router.get('/', get_dashboard);
router.get('/dashboard', get_dashboard);

router.get('/login', get_login);
router.post('/login', login);

router.get('/register', get_register);
router.post('/register', register);

router.get('/dashboard', all_projects); // Route to view all projects
router.get('/project/:id', view_project); // Route to view a specific project by id

module.exports = router;

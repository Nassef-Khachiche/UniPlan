const express = require('express');
const router = express.Router();

const { get_login, login } = require('./controllers/auth/login');
const { get_register, register } = require('./controllers/auth/register');
const { get_dashboard } = require('./controllers/dashboard');
const { all_projects, view_project, view_cr_project, create_project } = require('./controllers/project'); // Import all_projects and view_project functions

router.get('/', get_dashboard);
router.get('/dashboard', get_dashboard);

router.get('/login', get_login);
router.post('/login', login);

router.get('/register', get_register);
router.post('/register', register);

router.get('/create/project', view_cr_project);
router.post('/create/project', create_project); // Route to create a new projects

router.get('/projects', all_projects); // Route to view all projects
router.get('/project/:id', view_project); // Route to view a specific project by id

module.exports = router;
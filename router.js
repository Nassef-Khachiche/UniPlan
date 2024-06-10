const express = require('express');
const router = express.Router();

const { get_login, login } = require('./controllers/auth/login');
const { get_register, register } = require('./controllers/auth/register');
const { get_dashboard } = require('./controllers/dashboard');
const { all_projects, all_user_projects, view_project, view_cr_project, create_project, update_project_status } = require('./controllers/project'); // Import all_projects and view_project functions
const { upload } = require('./controllers/upload');
const { profile_render } = require('./controllers/profile');

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

router.post('/profile', upload); // settings
router.get('/profile', profile_render);

router.get('/user/projects', all_user_projects);

router.post('/update-project-status', update_project_status); // Route to update project status

module.exports = router;
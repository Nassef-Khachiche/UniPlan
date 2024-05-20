const { prisma } = require("../prisma/connection");
const nodemailer = require('nodemailer');

exports.view_cr_project = async (req, res) => {
    if (!req.session.isAuthenticated) {
        res.render('auth/login');
    }
    else {
        const users = await prisma.users.findMany();
        res.render('create-project', { req: req, users: users });
    }
}

exports.create_project = async (req, res) => {
    let {
        project_name,
        project_bio
    } = req.body;

    try {
        // Check if the user is authenticated
        if (!req.session.isAuthenticated || !req.session.loggedInUser) {
            res.status(401).json({
                message: 'Unauthorized'
            });
            return;
        }

        // Create the project
        const project = await prisma.projects.create({
            data: {
                project_name: project_name,
                project_bio: project_bio,
                created_by: req.session.loggedInUser, // Take user_id from session
                project_member: {
                    create: {
                        user_id: req.session.loggedInUser
                    }
                }
            },
            include: {
                project_member: true // Include project members in the returned project
            }
        });

        // Send email notification
        await sendEmailNotification(req.session.loggedInUser, project);

        res.render('create-project', { req: req });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

// Function to send email notification
async function sendEmailNotification(userId, project) {
    try {
        // Retrieve user details
        const user = await prisma.users.findUnique({
            where: {
                user_id: userId
            }
        });

        // Create a nodemailer transporter
        let transporter = nodemailer.createTransport({
            /* Configure your transporter options here */
            service: 'gmail', // Change this to your email service provider
            auth: {
                user: 'nassefkhachiche1@gmail.com', // Your email address
                pass: 'Besboe*415nk5' // Your email password
            }
        });

        // Setup email data
        let mailOptions = {
            from: '"Uni Plan" <uniplan@roc-teraa.com>',
            to: user.email,
            subject: 'Nieuw project aangemaakt!',
            text: `Beste ${user.firstname},\n\n U bent toegevoegd aan het project: ${project.project_name}.\n\nProject Bio: ${project.project_bio}\n\nMet vriendelijke,\nHet Uni Plan Team`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
}

exports.view_project = async (req, res) => {
    try {
        // Extract project id from the URL query
        const projectId = parseInt(req.params.id);

        // Check if the user is authenticated
        if (!req.session.isAuthenticated || !req.session.loggedInUser) {
            res.status(401).json({
                message: 'Unauthorized'
            });
            return;
        }

        // Retrieve the project from the database
        const project = await prisma.projects.findUnique({
            where: {
                project_id: projectId
            },
        });

        const user = await prisma.users.findUnique({
            where: {
                user_id: projectId
            },
        });

        // Check if the project exists
        if (!project) {
            res.status(404).json({
                message: 'Project not found'
            });
            return;
        }

        // Check if the logged-in user is the creator of the project
        if (project.created_by !== req.session.loggedInUser) {
            res.status(403).json({
                message: 'Forbidden'
            });
            return;
        }

        res.render('project', { project: project, user: user })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

exports.all_projects = async (req, res) => {
    try {
        // Retrieve all projects
        const projects = await prisma.projects.findMany();

        // Render the EJS template with projects data
        res.render('projects', { projects: projects });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

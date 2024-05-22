const { log } = require("console");
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
    let { project_name, project_bio, users } = req.body;

    try {
        // Check if the user is authenticated
        if (!req.session.isAuthenticated || !req.session.loggedInUser) {
            res.render('auth/login');
            return;
        }

        // Extract project details from the request body
        const { project_name, project_bio, ict, houtwerk, buisness, techniek, zorg } = req.body;

        // Get the logged-in user's ID
        const creatorId = req.session.loggedInUser;

        // Check if the creatorId is defined
        if (!creatorId) {
            res.status(400).json({ message: 'Invalid creator ID' });
            return;
        }

        // Extract selected users from the request body (ensure it is an array)
        let { users } = req.body;
        if (!Array.isArray(users)) {
            users = [];
        }

        // List of selected colleges
        const selectedColleges = [];

        if (ict) selectedColleges.push('ict');
        if (houtwerk) selectedColleges.push('houtwerk');
        if (buisness) selectedColleges.push('business');
        if (techniek) selectedColleges.push('techniek');
        if (zorg) selectedColleges.push('zorg');

        console.log(selectedColleges);

        // Ensure selected colleges exist in the database
        const collegeRecords = await Promise.all(
            selectedColleges.map(async (college) => {
                return prisma.colleges.upsert({
                    where: { college_name: college },
                    update: {},
                    create: { college_name: college },
                });
            })
        );

        // Create the project with associated users and colleges
        const project = await prisma.projects.create({
            data: {
                project_name,
                project_bio,
                created_by: creatorId,
                project_member: {
                    create: users.map(email => ({
                        users: {
                            connect: { email }
                        }
                    }))
                },
                project_college: {
                    create: collegeRecords.map(college => ({
                        colleges: {
                            connect: { college_id: college.college_id }
                        }
                    }))
                }
            },
            include: {
                project_member: true,
                project_college: true
            }
        });

        // Send email notifications
        await Promise.all(users.map(email => sendEmailNotification(email, project)));

        const userList = await prisma.users.findMany();
        res.render('create-project', { req, users: userList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to send email notification
async function sendEmailNotification(email, project) {
    try {
        // Retrieve user details
        const user = await prisma.users.findUnique({
            where: { email: email }
        });

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Create a nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'nassefkhachiche1@gmail.com',
                pass: 'Besboe*415nk5'
            }
        });

        // Setup email data
        let mailOptions = {
            from: '"Uni Plan" <uniplan@roc-teraa.com>',
            to: user.email,
            subject: 'Nieuw project aangemaakt!',
            text: `Beste ${user.firstname},\n\n U bent toegevoegd aan het project: ${project.project_name}.\n\nProject Bio: ${project.project_bio}\n\nMet vriendelijke groet,\nHet Uni Plan Team`
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

        const members = await prisma.project_member.findMany({
            where: {
                project_id: projectId
            },
        });


        let memberArray = [];
        members.forEach(member => {
            memberArray.push(member.user_id);
        });


        const users = await prisma.users.findMany({
            where: {
                user_id: {
                    in: memberArray
                }
            },
        });


        const related_colleges = await prisma.project_college.findMany({
            where: {
                project_id: projectId
            }
        });

        const colleges = await Promise.all(
            related_colleges.map(async (college) => {
                return prisma.colleges.findMany({
                    where: { college_id: college.id },
                });
            })
        );

        console.log(colleges[0]);

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

        res.render('project', { project: project, members: users, colleges: colleges[0] })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}


exports.all_projects = async (req, res) => {
    try {
        let projects;
        const { searchQuery } = req.query;

        if (searchQuery) {
            // If there is a search query, filter projects by project_name or project_bio
            projects = await prisma.projects.findMany({
                where: {
                    OR: [
                        { project_name: { contains: searchQuery, mode: 'insensitive' } },
                        { project_bio: { contains: searchQuery, mode: 'insensitive' } }
                    ]
                },
                include: {
                    project_college: {
                        include: {
                            colleges: true
                        }
                    }
                }
            });
        } else {
            // Otherwise, retrieve all projects
            projects = await prisma.projects.findMany({
                include: {
                    project_college: {
                        include: {
                            colleges: true
                        }
                    }
                }
            });
        }

        console.log(projects.project_college);
        // Render the EJS template with projects data
        res.render('projects', { projects: projects, searchQuery: searchQuery });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const {
    prisma
} = require("../prisma/connection");
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const { all } = require("../router");
let completeFileName = "";

exports.view_cr_project = async (req, res) => {
    if (!req.session.isAuthenticated) {
        res.render('auth/login');
    } else {
        const users = await prisma.users.findMany();
        res.render('create-project', {
            req: req,
            users: users
        });
    }
}


// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        completeFileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, completeFileName);
    }
});

// Initialize multer upload
const upload = multer({
    storage: storage
});

// Handle the POST request to create a project
exports.create_project = async (req, res) => {
    try {

        // Handle file upload (actual uploading itself)
        upload.array('file')(req, res, async (err) => {
            // Error handling
            if (err) {
                console.error('File upload failed:', err);
                return res.status(400).send('File upload failed.');
            }

            try {

                // Check if the user is authenticated
                if (!req.session.isAuthenticated || !req.session.loggedInUser) {
                    res.render('auth/login');
                    return;
                }

                // Extract project details from the request body
                const {
                    file,
                    ict,
                    houtwerk,
                    buisness,
                    techniek,
                    zorg
                } = req.body;

                // Get the logged-in user's ID
                const creatorId = req.session.loggedInUser;

                // Check if the creatorId is defined
                if (!creatorId) {
                    res.status(400).json({
                        message: 'Invalid creator ID'
                    });
                    return;
                }

                // List of selected colleges
                const selectedColleges = [];

                if (ict) selectedColleges.push('ict');
                if (houtwerk) selectedColleges.push('houtwerk');
                if (buisness) selectedColleges.push('buisness');
                if (techniek) selectedColleges.push('techniek');
                if (zorg) selectedColleges.push('zorg');

                // Ensure selected colleges exist in the database
                const collegeRecords = await Promise.all(
                    selectedColleges.map(async (college) => {
                        return prisma.colleges.upsert({
                            where: {
                                college_name: college
                            },
                            update: {},
                            create: {
                                college_name: college
                            },
                        });
                    })
                );

                const {
                    project_name,
                    project_bio
                } = req.body;

                req.body.users.push(req.session.email);

                // Create the project with associated users and colleges
                const project = await prisma.projects.create({
                    data: {
                        project_name: project_name,
                        project_bio: project_bio,
                        created_by: creatorId,
                        project_member: {
                            create: req.body.users.map(email => ({
                                users: {
                                    connect: {
                                        email
                                    }
                                }
                            }))
                        },
                        project_college: {
                            create: collegeRecords.map(college => ({
                                colleges: {
                                    connect: {
                                        college_id: college.college_id
                                    }
                                }
                            })),
                        },
                        project_files: {
                            create: req.files.map(file => ({
                                file_id: file.filename
                            }))
                        },
                    },
                    include: {
                        project_member: true,
                        project_college: true,
                        project_files: true
                    }
                });

                // Send email notifications
                // await Promise.all(req.body.users.map(email => sendEmailNotification(email, project)));

                // Fetch all users to pass to the view
                const userList = await prisma.users.findMany();

                // Render the create-project view
                res.render('create-project', {
                    req: req,
                    users: userList
                });

            } catch (error) {
                console.error('Error creating project:', error);
                res.status(500).json({
                    message: 'Internal Server Error'
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

// Function to send email notification
async function sendEmailNotification(email, project) {
    try {
        // Retrieve user details
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
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
                    where: {
                        college_id: college.college_id
                    },
                });
            })
        );

        const member = await prisma.project_member.findFirst({
            where: {

                AND: [{
                        project_id: projectId,
                    },
                    {
                        user_id: req.session.loggedInUser
                    },
                ],
            },
        });

        let activeMember;

        console.log(member,req.session.loggedInUser);

        if (member != null) {
            activeMember = false;
        } else {
            activeMember = true;
        }

        // Check if the project exists
        if (!project) {
            res.status(404).json({
                message: 'Project not found'
            });
            return;
        }

        // // Check if the logged-in user is the creator of the project
        // if (project.created_by !== req.session.loggedInUser) {
        //     res.status(403).json({
        //         message: 'Forbidden'
        //     });
        //     return;s
        // }

        // find creator of the project
        const created_by = await prisma.users.findUnique({
            where: {
                user_id: project.created_by
            }
        });

        const files = await prisma.project_files.findMany({
            where: {
                project_id: projectId
            }
        });

        res.render('project', {
            req: req,
            project: project,
            members: users,
            colleges: colleges,
            created_by: created_by,
            activeMember: activeMember,
            files: files,
        });

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
        const {
            searchQuery
        } = req.query;

        if (searchQuery) {
            // If there is a search query, filter projects by project_name or project_bio
            projects = await prisma.projects.findMany({
                where: {
                    OR: [{
                            project_name: {
                                contains: searchQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            project_bio: {
                                contains: searchQuery,
                                mode: 'insensitive'
                            }
                        }
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


        // Render the EJS template with projects data
        res.render('projects', {
            req: req,
            projects: projects,
            searchQuery: searchQuery,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};
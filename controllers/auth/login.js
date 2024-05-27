const { prisma } = require("../../prisma/connection");
const bcrypt = require('bcrypt');

exports.get_login = async (req, res) => {
    res.render('auth/login');
}

exports.login = async (req, res) => {

    let {
        email,
        password
    } = req.body

    try {

        // HARD RESET
        // await prisma.project_member.deleteMany();
        // await prisma.project_files.deleteMany();
        // await prisma.project_college.deleteMany();
        // await prisma.projects.deleteMany();
        // await prisma.profilepictures.deleteMany();
        
        /* check if password and email are in database > let them in | else give a message saying something went wrong */
        const user = await prisma.users.findUnique({

            where:{
                email: email
            },
                select: {
                    user_id: true,
                    email: true,
                    password: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                },
        });

        const pfp = await prisma.profilepictures.findFirst({
            where: {
                user_id: user.id
            }
        });

        if (pfp) {
            req.session.LoggedInUser_pfp = pfp.image_id;
        }
        else {
            req.session.LoggedInUser_pfp = "999999999";
        }


        // if email is wrong
        if (user == null) {
            res.status(400).json({
                error: {
                    content: 'E-mail does not exist'
                }
            });
            return; // Terminate the function after sending the response
        }

        /* compare hashed password */
        const match = await bcrypt.compare(password, user.password);

        if (match && user.email == email) {

            req.session.isAuthenticated = true;

            req.session.loggedInUser = user.user_id;
            req.session.firstname = user.firstname;
            req.session.lastname = user.lastname;
            req.session.email = user.email;
            req.session.phone = user.phone;


            req.session.save();

            res.redirect('/dashboard');
            return; // Terminate the function after sending the response

        } else {
            res.status(400).json({ message: 'Wrong password!' });
            return; // Terminate the function after sending the response
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' }); // Send 500 status in case of server error
        return; // Terminate the function after sending the response
    }
}
const bcrypt = require('bcrypt');
const { prisma } = require("../../prisma/connection");

exports.get_register = async (req, res) => {
    res.render('auth/register');
}

exports.register = async (req, res) => 
{
    let {
        firstname,
        lastname,
        email,
        password1,
        password2,
        phone,
    } = req.body;


    console.log(req.body);

    password = "";
    // Password match checks
    if (password1 == password2) {
        // Hash password
        password = await bcrypt.hash(req.body.password1, 10); 
    }
    else {

        // incorrect password match
        res.status(400).json({
            error: {
                content: 'The passwords do not match',
            },
        });
    }

    try {

        const user = await prisma.users.create({
            data: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password,
                phone: phone,
            },
        });

        res.redirect('/login')

        return;

    } catch (e) {
        console.error(e);
   
        /* P2002: Is there already a user with these unique fields? Then no further. */
        if (e.code === 'P2002') {

            /* The .code property can be accessed in a type-safe manner */
            res.status(400).json({
                error: {
                    content: "This user already exists"
                },
            });
            return;
        }
    }
}
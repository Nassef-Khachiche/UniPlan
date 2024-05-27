exports.profile_render = async (req, res) => {

    // If LoggedInId is not set in the session, redirect the user to the login page
    if (req.session.loggedInUser) {

        const user = await prisma.users.findFirst({
            where: {
                user_id: req.session.loggedInUser,
            }
        });

        const user_pfp = await prisma.profilepictures.findFirst({
            where: {
                user_id: String(req.session.loggedInUser),
            }
        })

        // Default picture if they dont have a picture
        if (!user_pfp) {
            req.session.LoggedInUser_pfp = "999999999";
        }
        else {
            // Normal profile picture that was uploaded
            req.session.LoggedInUser_pfp = user_pfp.image_id;
        }

        //Data to use in the front end
        req.session.loggedInUser = user.user_id;


        res.render('profile', {
            req: req
        });
    } else {
        return res.render('auth/login');
    }
};
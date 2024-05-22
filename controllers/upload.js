const multer = require('multer');
const path = require('path');

let imageid = Date.now();

// Using multer middleware to store the image in my project
// Destination where it goes and what it should be named
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + imageid + path.extname(file.originalname));
	}
});

// Upload middleware
const upload = multer({
	storage: storage
});

exports.upload = async (req, res) => {

	let { body, session } = req;
	const user = await prisma.profilepictures.findFirst({
		where: {
			user_id: String(req.session.LoggedInId),
		}
	});

	// if User does not have a profile picture create one
	if (!user) {
		const image = await prisma.profilepictures.create({
			data: {
				user_id: String(req.session.LoggedInId),
				image_id: String(imageid),
			}
		});

		// critical: Need to update profile picture in order to update right after
		req.session.LoggedInUser_pfp = imageid
	}
	else {
		// Else update the user if he already got one record in the DB
		const update_user = await prisma.profilepictures.update({
			where: {
			  id: user.id,
			},
			data: {
				image_id: String(imageid)
			},
		})

		// critical: Need to update profile picture in order to update right after
		req.session.LoggedInUser_pfp = imageid
	}

	// Handle file upload (actual uploading itself)
	upload.single('image')(req, res, (err) => {

		// Error handling
		if (err) {
			return res.status(400).send('File upload failed.');
		}

		// Go back to profile
		res.render('profile', {req: req});
	});
};
const jwt = require('jsonwebtoken');

exports.authCheck = async (req) => {
	if (req.body.token) {
		const currentUser = await jwt.verify(req.body.token, process.env.JWT_KEY);
		// check token validity
		// Retrieve user data { pseudo: 'xxxx', pin: 'yyyyzzz' }
		if (currentUser) {
			console.log('CURRENT USER: ', currentUser);
			return currentUser;
		}
	} else {
		console.log("Vous n'êtes pas autorisé à accéder à cette ressource !");
	}
};

exports.authenticateUser = async (req, res, next) => {
	// check if user is the current logged in user
	if (req.body.token) {
		// pass token  in the headers instead of in the body
		await jwt
			.verify(req.body.token, process.env.JWT_KEY)
			.then((result) => {
				next();
				console.log(result);
			})
			.catch((error) => {
				console.log(error);
				return res.status(400).json({ message: 'Le token soumis est invalide !' });
			});
	} else {
		return res.status(401).send({
			message: "Vous n'êtes pas autorisé à rejoindre la salle de jeu !<br>Veuillez vérifier votre pin !"
		});
	}
};

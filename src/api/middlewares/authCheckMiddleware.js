const jwt = require('jsonwebtoken');

exports.authCheck = async (req, res, next) => {
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

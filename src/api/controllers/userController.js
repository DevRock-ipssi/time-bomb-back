const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const cryptoRandomString = require('crypto-random-string');
const Room = require('../models/roomModel.js');

/**
 * Save user if not exist and create token (pseudo + pin)
 */
function saveUser(userData, res) {
	let new_user = new User(userData);
	jwt.sign({ userData }, process.env.JWT_KEY, { expiresIn: '30 days' }, (error, token) => {
		new_user
			.save()
			.then((user) => {
				res.status(201);
				res.json({ token });
			})
			.catch((error) => {
				res.status(500);
				console.log(error);
				res.json({ message: 'Erreur serveur.' });
			});
	});
}


/**
 * Create pin room for user or register user and create a pin (GameMaster)
 */
exports.user_init_room = (req, res) => {
	let new_user = new User(req.body);

	User.findOne({ pseudo: new_user.pseudo })
		.then((user) => {
			//génère un pin
			let pinRandom = cryptoRandomString({ length: 10 });

			//if user existe
			if (user) {
				let userData = {
					pseudo: new_user.pseudo,
					pin: pinRandom
				};
				jwt.sign({ userData }, process.env.JWT_KEY, { expiresIn: '30 days' }, (error, token) => {
					if (error) {
						res.status(500);
						console.log(error);
						res.json({ message: 'Token invalide' });
					} else {
						res.json({ token }); // pseudo + pinRandom
						//=> CRÉATION DE LA ROOM
                        //=> A faire côté front en appelant ta route suivante '/rooms/create'
					}
				});
			} else {
				//create user if not existe
				let userData = {
					pseudo: new_user.pseudo,
					pin: pinRandom
				};
				saveUser(userData, res); // récupère token (pseudo + pinRandom)
				//=> CRÉATION DE LA ROOM
                //=> A faire côté front en appelant ta route suivante '/rooms/create'
			}
		})
		.catch((error) => {
			console.log(error);
			res.json('erreur');
		});
};

/**
 * Join room for user register or create user and join room
 */
exports.user_join_room = (req, res) => {
	let { body } = req;
	//verif si pin existe

	//user exist
	User.findOne({ pseudo: body.pseudo })
		.then((user) => {
			if (user) {
				let userData = {
					pseudo: user.pseudo,
					pin: body.pin
				};
				jwt.sign({ userData }, process.env.JWT_KEY, { expiresIn: '30 days' }, (error, token) => {
					if (error) {
						res.status(500);
						console.log(error);
						res.json({ message: 'Token invalide' });
					} else {
						res.json({ token });
						// => ACCÈS À LA ROOM
						res.redirect(`/rooms/join`);
					}
				});
			} else {
				//create user if not existe
				let userData = {
					pseudo: body.pseudo,
					pin: body.pin
				};
				saveUser(userData, res); // récupère token (pseudo + pin d'une room déjà existante )
				// => ACCÈS À LA ROOM
				res.redirect(`/rooms/join`);
			}
		})
		.catch((error) => {
			console.log(error);
			res.json('erreur');
		});
};

exports.find_all_user = (req, res) => {
	User.find({})
		.then((user) => {
			res.status(200);
			res.json(user);
		})
		.catch((error) => {
			res.status(500);
			console.log(error);
			res.json({ message: 'liste vide' });
		});
};

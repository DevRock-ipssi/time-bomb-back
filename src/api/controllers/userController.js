const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const cryptoRandomString = require('crypto-random-string');
const Room = require('../controllers/roomController');

/**
 * Save user if not exist and create token (pseudo + pin)
 */
function saveUser(userData, callback) {
	let new_user = new User(userData);
	jwt.sign({ userData }, process.env.JWT_KEY, { expiresIn: '30 days' }, (error, token) => {
		new_user
			.save()
			.then((user) => {
				callback(token);
			})
			.catch((error) => {
				callback('Erreur serveur');
			});
	});
}

/**
 * Create pin room for user or register user and create a pin (GameMaster)
 */
exports.user_init_room = (req, res) => {
	let new_user = new User(req.body);
	if (new_user.pseudo) {
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
							es.status(500).json({ message: 'Token invalide' });
						} else {
							Room.create_room(token, res);
						}
					});
				} else {
					//create user if not existe + token and create room
					let userData = {
						pseudo: new_user.pseudo,
						pin: pinRandom
					};

					saveUser(userData, function(response) {
						Room.create_room(response, res);
					});
				}
			})
			.catch((error) => {
				res.status(500).json({ message: 'Erreur serveur.' });
			});
	} else {
		res.status(400).json({ message: 'Veuillez saisir un pseudo' });
	}
};

/**
 * Join room for user register or create user and join room
 */
exports.user_join_room = (req, res) => {
	let { body } = req;

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
						res.status(500).json({ message: 'Token invalide' });
					} else {
						Room.join_a_room(token, res);
					}
				});
			} else {
				//create user if not existe
				let userData = {
					pseudo: body.pseudo,
					pin: body.pin
				};
				saveUser(userData, function(response) {
					Room.join_a_room(response, res);
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ message: 'Erreur serveur.' });
		});
};

exports.find_all_user = (req, res) => {
	User.find({})
		.then((user) => {
			res.status(200).json(user);
		})
		.catch((error) => {
			res.status(500).json({ message: 'liste vide' });
		});
};

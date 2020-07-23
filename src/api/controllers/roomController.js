const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Room = require('../models/roomModel');
const { authCheck } = require('../middlewares/authCheckMiddleware');
const { randomInteger } = require('../helpers/index.js');

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 8;
const MIN_ROUNDS = 4;
const MAX_ROUNDS = 8;

exports.create_room = async (req, res) => {
	try {
		// verify if a token is sended by client side
		const gameMaster = await authCheck(req, res);
		if (gameMaster) {
			const { userData } = gameMaster;
			//console.log('USERDATA', userData);
			const { pseudo, pin } = userData;

			// Checks if user exist in db
			const userFomDB = await User.findOne({ pseudo }).exec();
			if (userFomDB /*&& userFomDB.isGameMaster*/) {
				// generate randomly the number of rounds and players
				const numOfPlayers = randomInteger(MIN_PLAYERS, MAX_PLAYERS);
				const numOfRounds = randomInteger(MIN_ROUNDS, MAX_ROUNDS);
				// save room in the DB if not exist or return existing one
				const existingRoom = await Room.findOne({ pin });
				return existingRoom
					? existingRoom
					: new Room({
							name: shortid.generate(),
							numberOfPlayers: numOfPlayers,
							numberOfRounds: numOfRounds,
							gameMaster: userFomDB,
							players: [ userFomDB ],
							pin: pin
						})
							.save()
							.then((room) => {
								return res.status(201).json({ room });
							})
							.catch((error) => {
								res.status(500);
								console.log(error);
								res.json({ message: 'Erreur serveur.' });
							});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(401);
		res.send({ message: "Vous n'êtes pas autorisé à accéder au jeu !<br>Veuillez vérifier votre pin !" });
	}
};

exports.all_rooms = async (req, res) => {
	try {
		const rooms = await Room.find(async (err, rooms) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: 'Erreur Serveur'
				});
			}
			return rooms;
		}).populate('gameMaster', '_id pseudo')
		if (rooms) {
			res.status(200);
			res.send(rooms);
		}
	} catch (error) {
		console.log(error);
	}
};

exports.get_a_room = async (req, res) => {
    console.log('PARAMS: ', req.params)
	try {
		const room = await Room.findOne({ pin: req.params.pin }, async(err, room) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					'message': 'Erreur Serveur'
				});
			}
			return room;
		}).populate('gameMaster', '_id pseudo');

		if (room) {
			res.status(200).json({ room });
		} else {
			res.status(404).json({ 'message': 'Aucun room avec ce pin!' });
		}
	} catch (error) {
		console.log(error);
	}
};
